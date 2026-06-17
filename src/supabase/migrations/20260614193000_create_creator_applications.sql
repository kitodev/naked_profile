create table if not exists public.creator_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  handle text not null,
  category text not null,
  bio text not null,
  portfolio_url text,
  audience_size integer check (audience_size is null or audience_size >= 0),
  payout_email text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.creator_applications enable row level security;

create index if not exists creator_applications_status_idx
  on public.creator_applications (status, created_at desc);

drop policy if exists "Users can view their own creator application"
  on public.creator_applications;
create policy "Users can view their own creator application"
  on public.creator_applications for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own creator application"
  on public.creator_applications;
create policy "Users can create their own creator application"
  on public.creator_applications for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update pending creator applications"
  on public.creator_applications;
create policy "Users can update pending creator applications"
  on public.creator_applications for update
  using (auth.uid() = user_id and status = 'pending')
  with check (auth.uid() = user_id and status = 'pending');

drop trigger if exists creator_applications_updated_at
  on public.creator_applications;
create trigger creator_applications_updated_at
  before update on public.creator_applications
  for each row execute function public.touch_updated_at();
