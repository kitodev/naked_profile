create table public.profile_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  caption text not null default '',
  media_url text,
  media_path text,
  media_type text check (media_type in ('image', 'video')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profile_posts enable row level security;

create policy "Profile posts are viewable by everyone"
  on public.profile_posts for select
  using (true);

create policy "Users can insert their own profile posts"
  on public.profile_posts for insert
  with check (auth.uid() = author_id);

create policy "Users can update their own profile posts"
  on public.profile_posts for update
  using (auth.uid() = author_id);

create policy "Users can delete their own profile posts"
  on public.profile_posts for delete
  using (auth.uid() = author_id);

create trigger profile_posts_updated_at
  before update on public.profile_posts
  for each row execute function public.touch_updated_at();

insert into storage.buckets (id, name, public)
values ('profile-media', 'profile-media', true)
on conflict (id) do nothing;

create policy "Profile media is publicly readable"
  on storage.objects for select
  using (bucket_id = 'profile-media');

create policy "Users can upload their own profile media"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own profile media"
  on storage.objects for update
  using (
    bucket_id = 'profile-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own profile media"
  on storage.objects for delete
  using (
    bucket_id = 'profile-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
