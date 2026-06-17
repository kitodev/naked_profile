create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  username text,
  display_name text,
  avatar_url text,
  role text not null default 'fan'
    check (role in ('fan', 'creator', 'admin')),
  email_confirmed_at timestamptz,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.users enable row level security;

create unique index if not exists users_username_unique_idx
  on public.users (lower(username))
  where username is not null;

drop policy if exists "Users can view their own user row" on public.users;
create policy "Users can view their own user row"
  on public.users for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own user row" on public.users;
create policy "Users can update their own user row"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at
  before update on public.users
  for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  resolved_username text;
  resolved_display_name text;
begin
  resolved_username := lower(
    coalesce(
      new.raw_user_meta_data->>'username',
      split_part(coalesce(new.email, ''), '@', 1)
    )
  );

  resolved_display_name := coalesce(
    new.raw_user_meta_data->>'display_name',
    resolved_username
  );

  insert into public.users (
    id,
    email,
    username,
    display_name,
    avatar_url,
    role,
    email_confirmed_at,
    last_sign_in_at
  )
  values (
    new.id,
    coalesce(new.email, ''),
    resolved_username,
    resolved_display_name,
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'role', 'fan'),
    new.email_confirmed_at,
    new.last_sign_in_at
  )
  on conflict (id) do update
  set
    email = excluded.email,
    username = coalesce(public.users.username, excluded.username),
    display_name = coalesce(public.users.display_name, excluded.display_name),
    avatar_url = coalesce(public.users.avatar_url, excluded.avatar_url),
    email_confirmed_at = excluded.email_confirmed_at,
    last_sign_in_at = excluded.last_sign_in_at;

  insert into public.profiles (
    id,
    username,
    display_name,
    avatar_url,
    bio
  )
  values (
    new.id,
    resolved_username,
    resolved_display_name,
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'bio', 'Hey, I am using Naked Profile.')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.sync_user_auth_state()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users as app_user
  set
    email = coalesce(new.email, app_user.email),
    email_confirmed_at = new.email_confirmed_at,
    last_sign_in_at = new.last_sign_in_at
  where app_user.id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email, email_confirmed_at, last_sign_in_at on auth.users
  for each row execute function public.sync_user_auth_state();

insert into public.users (
  id,
  email,
  username,
  display_name,
  avatar_url,
  email_confirmed_at,
  last_sign_in_at,
  created_at
)
select
  au.id,
  coalesce(au.email, ''),
  lower(
    coalesce(
      au.raw_user_meta_data->>'username',
      split_part(coalesce(au.email, ''), '@', 1)
    )
  ),
  coalesce(
    au.raw_user_meta_data->>'display_name',
    au.raw_user_meta_data->>'username',
    split_part(coalesce(au.email, ''), '@', 1)
  ),
  au.raw_user_meta_data->>'avatar_url',
  au.email_confirmed_at,
  au.last_sign_in_at,
  au.created_at
from auth.users au
on conflict (id) do nothing;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.sync_user_auth_state() from public, anon, authenticated;
