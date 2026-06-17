create extension if not exists "pgcrypto";

create table if not exists public.fanly_posts (
  id text primary key default gen_random_uuid()::text,
  author_user_id uuid references public.profiles(id) on delete cascade,
  creator_id text,
  author_name text not null,
  author_handle text not null,
  author_avatar text,
  caption text not null default '',
  media_url text,
  media_type text check (media_type in ('image', 'video')),
  sensitive boolean not null default false,
  subscribers_only boolean not null default false,
  like_count integer not null default 0 check (like_count >= 0),
  bookmark_count integer not null default 0 check (bookmark_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fanly_posts enable row level security;

drop policy if exists "Fanly posts are viewable by everyone" on public.fanly_posts;
create policy "Fanly posts are viewable by everyone"
  on public.fanly_posts for select
  using (true);

drop policy if exists "Users can create their own fanly posts" on public.fanly_posts;
create policy "Users can create their own fanly posts"
  on public.fanly_posts for insert
  with check (auth.uid() = author_user_id);

drop policy if exists "Users can update their own fanly posts" on public.fanly_posts;
create policy "Users can update their own fanly posts"
  on public.fanly_posts for update
  using (auth.uid() = author_user_id)
  with check (auth.uid() = author_user_id);

drop policy if exists "Users can delete their own fanly posts" on public.fanly_posts;
create policy "Users can delete their own fanly posts"
  on public.fanly_posts for delete
  using (auth.uid() = author_user_id);

drop trigger if exists fanly_posts_updated_at on public.fanly_posts;
create trigger fanly_posts_updated_at
  before update on public.fanly_posts
  for each row execute function public.touch_updated_at();

create table if not exists public.fanly_post_likes (
  post_id text not null references public.fanly_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.fanly_post_likes enable row level security;

drop policy if exists "Users can view fanly likes" on public.fanly_post_likes;
create policy "Users can view fanly likes"
  on public.fanly_post_likes for select
  using (true);

drop policy if exists "Users can like fanly posts" on public.fanly_post_likes;
create policy "Users can like fanly posts"
  on public.fanly_post_likes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove fanly likes" on public.fanly_post_likes;
create policy "Users can remove fanly likes"
  on public.fanly_post_likes for delete
  using (auth.uid() = user_id);

create table if not exists public.fanly_post_bookmarks (
  post_id text not null references public.fanly_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.fanly_post_bookmarks enable row level security;

drop policy if exists "Users can view their fanly bookmarks" on public.fanly_post_bookmarks;
create policy "Users can view their fanly bookmarks"
  on public.fanly_post_bookmarks for select
  using (auth.uid() = user_id);

drop policy if exists "Users can bookmark fanly posts" on public.fanly_post_bookmarks;
create policy "Users can bookmark fanly posts"
  on public.fanly_post_bookmarks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove fanly bookmarks" on public.fanly_post_bookmarks;
create policy "Users can remove fanly bookmarks"
  on public.fanly_post_bookmarks for delete
  using (auth.uid() = user_id);

create table if not exists public.fanly_creator_follows (
  user_id uuid not null references public.profiles(id) on delete cascade,
  creator_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, creator_id)
);

alter table public.fanly_creator_follows enable row level security;

drop policy if exists "Users can view fanly follows" on public.fanly_creator_follows;
create policy "Users can view fanly follows"
  on public.fanly_creator_follows for select
  using (true);

drop policy if exists "Users can follow fanly creators" on public.fanly_creator_follows;
create policy "Users can follow fanly creators"
  on public.fanly_creator_follows for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove fanly follows" on public.fanly_creator_follows;
create policy "Users can remove fanly follows"
  on public.fanly_creator_follows for delete
  using (auth.uid() = user_id);

create table if not exists public.fanly_creator_subscriptions (
  user_id uuid not null references public.profiles(id) on delete cascade,
  creator_id text not null,
  status text not null default 'active'
    check (status in ('active', 'canceled', 'past_due')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, creator_id)
);

alter table public.fanly_creator_subscriptions enable row level security;

drop policy if exists "Users can view their fanly subscriptions" on public.fanly_creator_subscriptions;
create policy "Users can view their fanly subscriptions"
  on public.fanly_creator_subscriptions for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create fanly subscriptions" on public.fanly_creator_subscriptions;
create policy "Users can create fanly subscriptions"
  on public.fanly_creator_subscriptions for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update fanly subscriptions" on public.fanly_creator_subscriptions;
create policy "Users can update fanly subscriptions"
  on public.fanly_creator_subscriptions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete fanly subscriptions" on public.fanly_creator_subscriptions;
create policy "Users can delete fanly subscriptions"
  on public.fanly_creator_subscriptions for delete
  using (auth.uid() = user_id);

drop trigger if exists fanly_creator_subscriptions_updated_at on public.fanly_creator_subscriptions;
create trigger fanly_creator_subscriptions_updated_at
  before update on public.fanly_creator_subscriptions
  for each row execute function public.touch_updated_at();

create table if not exists public.fanly_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  creator_id text not null,
  favorite boolean not null default false,
  muted boolean not null default false,
  archived boolean not null default false,
  unread_count integer not null default 0 check (unread_count >= 0),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, creator_id)
);

alter table public.fanly_conversations enable row level security;

drop policy if exists "Users can view their fanly conversations" on public.fanly_conversations;
create policy "Users can view their fanly conversations"
  on public.fanly_conversations for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create their fanly conversations" on public.fanly_conversations;
create policy "Users can create their fanly conversations"
  on public.fanly_conversations for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their fanly conversations" on public.fanly_conversations;
create policy "Users can update their fanly conversations"
  on public.fanly_conversations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their fanly conversations" on public.fanly_conversations;
create policy "Users can delete their fanly conversations"
  on public.fanly_conversations for delete
  using (auth.uid() = user_id);

drop trigger if exists fanly_conversations_updated_at on public.fanly_conversations;
create trigger fanly_conversations_updated_at
  before update on public.fanly_conversations
  for each row execute function public.touch_updated_at();

create table if not exists public.fanly_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.fanly_conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  author text not null check (author in ('me', 'creator')),
  body text not null default '',
  attachment_name text,
  attachment_type text check (attachment_type in ('image', 'file')),
  attachment_url text,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fanly_messages enable row level security;

drop policy if exists "Users can view their fanly messages" on public.fanly_messages;
create policy "Users can view their fanly messages"
  on public.fanly_messages for select
  using (
    exists (
      select 1
      from public.fanly_conversations c
      where c.id = conversation_id
        and c.user_id = auth.uid()
    )
  );

drop policy if exists "Users can create their fanly messages" on public.fanly_messages;
create policy "Users can create their fanly messages"
  on public.fanly_messages for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete their fanly messages" on public.fanly_messages;
create policy "Users can delete their fanly messages"
  on public.fanly_messages for delete
  using (auth.uid() = user_id);

drop trigger if exists fanly_messages_updated_at on public.fanly_messages;
create trigger fanly_messages_updated_at
  before update on public.fanly_messages
  for each row execute function public.touch_updated_at();

create index if not exists fanly_posts_created_at_idx
  on public.fanly_posts (created_at desc);
create index if not exists fanly_conversations_user_last_idx
  on public.fanly_conversations (user_id, last_message_at desc);
create index if not exists fanly_messages_conversation_created_idx
  on public.fanly_messages (conversation_id, created_at);

insert into public.fanly_posts (
  id,
  creator_id,
  author_name,
  author_handle,
  caption,
  sensitive,
  subscribers_only,
  like_count,
  bookmark_count,
  created_at
) values
  ('seed-aria-1', 'aria', 'Aria Mae', 'ariamae', 'Behind the scenes from today''s shoot.', true, false, 34, 8, '2026-06-12T08:00:00Z'),
  ('seed-luna-1', 'luna', 'Luna Park', 'lunapark', 'New set is live for subscribers.', false, true, 124, 12, '2026-06-12T06:00:00Z'),
  ('seed-theo-1', 'theo', 'Theo Vance', 'theovance', 'Studio preview. Full track drops tonight.', false, false, 88, 4, '2026-06-11T22:00:00Z'),
  ('seed-marcus-1', 'marcus', 'Marcus Reid', 'marcusreid', 'Subscriber workout plan update is ready.', false, true, 51, 7, '2026-06-11T07:00:00Z')
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('profile-media', 'profile-media', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Profile media is publicly readable" on storage.objects;
create policy "Profile media is publicly readable"
  on storage.objects for select
  using (bucket_id = 'profile-media');

drop policy if exists "Users can upload their own profile media" on storage.objects;
create policy "Users can upload their own profile media"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can update their own profile media" on storage.objects;
create policy "Users can update their own profile media"
  on storage.objects for update
  using (
    bucket_id = 'profile-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "Users can delete their own profile media" on storage.objects;
create policy "Users can delete their own profile media"
  on storage.objects for delete
  using (
    bucket_id = 'profile-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
