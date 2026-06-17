create extension if not exists "pgcrypto";

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    username,
    display_name,
    avatar_url,
    bio
  )
  values (
    new.id,
    lower(
      coalesce(
        new.raw_user_meta_data->>'username',
        split_part(coalesce(new.email, ''), '@', 1)
      )
    ),
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'bio', 'Hey, I am using Naked Profile.')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.is_conversation_member(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = p_conversation_id
      and cm.user_id = auth.uid()
  );
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  display_name text,
  avatar_url text,
  cover_url text,
  bio text,
  website text,
  location text,
  is_creator boolean not null default false,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username))
  where username is not null;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

create table if not exists public.profile_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  caption text not null default '',
  visibility text not null default 'public'
    check (visibility in ('public', 'followers', 'subscribers', 'private')),
  media_url text,
  media_path text,
  media_type text check (media_type in ('image', 'video')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profile_posts enable row level security;

drop policy if exists "Profile posts are viewable by everyone" on public.profile_posts;
create policy "Profile posts are viewable by everyone"
  on public.profile_posts for select
  using (true);

drop policy if exists "Users can insert their own profile posts" on public.profile_posts;
create policy "Users can insert their own profile posts"
  on public.profile_posts for insert
  with check (auth.uid() = author_id);

drop policy if exists "Users can update their own profile posts" on public.profile_posts;
create policy "Users can update their own profile posts"
  on public.profile_posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "Users can delete their own profile posts" on public.profile_posts;
create policy "Users can delete their own profile posts"
  on public.profile_posts for delete
  using (auth.uid() = author_id);

drop trigger if exists profile_posts_updated_at on public.profile_posts;
create trigger profile_posts_updated_at
  before update on public.profile_posts
  for each row execute function public.touch_updated_at();

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid references public.profile_posts(id) on delete set null,
  title text,
  description text,
  media_url text not null,
  media_path text,
  media_type text not null check (media_type in ('image', 'video', 'file')),
  visibility text not null default 'public'
    check (visibility in ('public', 'followers', 'subscribers', 'private')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.media_assets enable row level security;

drop policy if exists "Media assets are viewable by everyone" on public.media_assets;
create policy "Media assets are viewable by everyone"
  on public.media_assets for select
  using (true);

drop policy if exists "Users can insert their own media assets" on public.media_assets;
create policy "Users can insert their own media assets"
  on public.media_assets for insert
  with check (auth.uid() = owner_id);

drop policy if exists "Users can update their own media assets" on public.media_assets;
create policy "Users can update their own media assets"
  on public.media_assets for update
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

drop policy if exists "Users can delete their own media assets" on public.media_assets;
create policy "Users can delete their own media assets"
  on public.media_assets for delete
  using (auth.uid() = owner_id);

drop trigger if exists media_assets_updated_at on public.media_assets;
create trigger media_assets_updated_at
  before update on public.media_assets
  for each row execute function public.touch_updated_at();

create table if not exists public.post_likes (
  post_id uuid not null references public.profile_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;

drop policy if exists "Post likes are viewable by everyone" on public.post_likes;
create policy "Post likes are viewable by everyone"
  on public.post_likes for select
  using (true);

drop policy if exists "Users can like posts as themselves" on public.post_likes;
create policy "Users can like posts as themselves"
  on public.post_likes for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove their own likes" on public.post_likes;
create policy "Users can remove their own likes"
  on public.post_likes for delete
  using (auth.uid() = user_id);

create table if not exists public.post_bookmarks (
  post_id uuid not null references public.profile_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_bookmarks enable row level security;

drop policy if exists "Post bookmarks are viewable by everyone" on public.post_bookmarks;
create policy "Post bookmarks are viewable by everyone"
  on public.post_bookmarks for select
  using (true);

drop policy if exists "Users can bookmark posts as themselves" on public.post_bookmarks;
create policy "Users can bookmark posts as themselves"
  on public.post_bookmarks for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can remove their own bookmarks" on public.post_bookmarks;
create policy "Users can remove their own bookmarks"
  on public.post_bookmarks for delete
  using (auth.uid() = user_id);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.profile_posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_comment_id uuid references public.post_comments(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.post_comments enable row level security;

drop policy if exists "Post comments are viewable by everyone" on public.post_comments;
create policy "Post comments are viewable by everyone"
  on public.post_comments for select
  using (true);

drop policy if exists "Users can insert their own comments" on public.post_comments;
create policy "Users can insert their own comments"
  on public.post_comments for insert
  with check (auth.uid() = author_id);

drop policy if exists "Users can update their own comments" on public.post_comments;
create policy "Users can update their own comments"
  on public.post_comments for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

drop policy if exists "Users can delete their own comments" on public.post_comments;
create policy "Users can delete their own comments"
  on public.post_comments for delete
  using (auth.uid() = author_id);

drop trigger if exists post_comments_updated_at on public.post_comments;
create trigger post_comments_updated_at
  before update on public.post_comments
  for each row execute function public.touch_updated_at();

create table if not exists public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  constraint follows_no_self_follow check (follower_id <> following_id)
);

alter table public.follows enable row level security;

drop policy if exists "Follows are viewable by everyone" on public.follows;
create policy "Follows are viewable by everyone"
  on public.follows for select
  using (true);

drop policy if exists "Users can follow as themselves" on public.follows;
create policy "Users can follow as themselves"
  on public.follows for insert
  with check (auth.uid() = follower_id);

drop policy if exists "Users can unfollow themselves" on public.follows;
create policy "Users can unfollow themselves"
  on public.follows for delete
  using (auth.uid() = follower_id);

create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  label text not null,
  created_at timestamptz not null default now()
);

alter table public.tags enable row level security;

drop policy if exists "Tags are viewable by everyone" on public.tags;
create policy "Tags are viewable by everyone"
  on public.tags for select
  using (true);

create table if not exists public.post_tags (
  post_id uuid not null references public.profile_posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, tag_id)
);

alter table public.post_tags enable row level security;

drop policy if exists "Post tags are viewable by everyone" on public.post_tags;
create policy "Post tags are viewable by everyone"
  on public.post_tags for select
  using (true);

drop policy if exists "Authenticated users can add post tags" on public.post_tags;
create policy "Authenticated users can add post tags"
  on public.post_tags for insert
  with check (auth.uid() is not null);

drop policy if exists "Authenticated users can remove post tags" on public.post_tags;
create policy "Authenticated users can remove post tags"
  on public.post_tags for delete
  using (auth.uid() is not null);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'direct'
    check (kind in ('direct', 'group')),
  title text,
  created_by uuid references public.profiles(id) on delete set null,
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.conversations enable row level security;

drop policy if exists "Conversation members can view conversations" on public.conversations;
create policy "Conversation members can view conversations"
  on public.conversations for select
  using (public.is_conversation_member(id));

drop policy if exists "Authenticated users can create conversations" on public.conversations;
create policy "Authenticated users can create conversations"
  on public.conversations for insert
  with check (auth.uid() = created_by);

drop policy if exists "Conversation creators can update conversations" on public.conversations;
create policy "Conversation creators can update conversations"
  on public.conversations for update
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

drop trigger if exists conversations_updated_at on public.conversations;
create trigger conversations_updated_at
  before update on public.conversations
  for each row execute function public.touch_updated_at();

create table if not exists public.conversation_members (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member'
    check (role in ('member', 'admin')),
  muted_until timestamptz,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, user_id)
);

alter table public.conversation_members enable row level security;

drop policy if exists "Conversation members are viewable by members" on public.conversation_members;
create policy "Conversation members are viewable by members"
  on public.conversation_members for select
  using (user_id = auth.uid() or public.is_conversation_member(conversation_id));

drop policy if exists "Users can join conversations as themselves" on public.conversation_members;
create policy "Users can join conversations as themselves"
  on public.conversation_members for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can leave their own conversations" on public.conversation_members;
create policy "Users can leave their own conversations"
  on public.conversation_members for delete
  using (auth.uid() = user_id);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null default '',
  media_url text,
  media_path text,
  media_type text check (media_type in ('image', 'video', 'file')),
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.messages enable row level security;

drop policy if exists "Conversation members can view messages" on public.messages;
create policy "Conversation members can view messages"
  on public.messages for select
  using (public.is_conversation_member(conversation_id));

drop policy if exists "Conversation members can send messages" on public.messages;
create policy "Conversation members can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and public.is_conversation_member(conversation_id)
  );

drop policy if exists "Message senders can update their messages" on public.messages;
create policy "Message senders can update their messages"
  on public.messages for update
  using (auth.uid() = sender_id)
  with check (auth.uid() = sender_id);

drop policy if exists "Message senders can delete their messages" on public.messages;
create policy "Message senders can delete their messages"
  on public.messages for delete
  using (auth.uid() = sender_id);

drop trigger if exists messages_updated_at on public.messages;
create trigger messages_updated_at
  before update on public.messages
  for each row execute function public.touch_updated_at();

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

drop policy if exists "Users can view their own notifications" on public.notifications;
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = recipient_id);

drop policy if exists "Users can update their own notifications" on public.notifications;
create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

create table if not exists public.creator_plans (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  price_cents integer not null default 0 check (price_cents >= 0),
  currency text not null default 'usd',
  billing_interval text not null default 'month'
    check (billing_interval in ('week', 'month', 'year')),
  stripe_product_id text,
  stripe_price_id text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (creator_id, name)
);

alter table public.creator_plans enable row level security;

drop policy if exists "Creator plans are viewable by everyone" on public.creator_plans;
create policy "Creator plans are viewable by everyone"
  on public.creator_plans for select
  using (true);

drop policy if exists "Creators can manage their plans" on public.creator_plans;
create policy "Creators can manage their plans"
  on public.creator_plans for insert
  with check (auth.uid() = creator_id);

drop policy if exists "Creators can update their plans" on public.creator_plans;
create policy "Creators can update their plans"
  on public.creator_plans for update
  using (auth.uid() = creator_id)
  with check (auth.uid() = creator_id);

drop policy if exists "Creators can delete their plans" on public.creator_plans;
create policy "Creators can delete their plans"
  on public.creator_plans for delete
  using (auth.uid() = creator_id);

drop trigger if exists creator_plans_updated_at on public.creator_plans;
create trigger creator_plans_updated_at
  before update on public.creator_plans
  for each row execute function public.touch_updated_at();

create table if not exists public.billing_customers (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  stripe_customer_id text not null unique,
  default_payment_method_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.billing_customers enable row level security;

drop policy if exists "Users can view their own billing customer row" on public.billing_customers;
create policy "Users can view their own billing customer row"
  on public.billing_customers for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update their own billing customer row" on public.billing_customers;
create policy "Users can update their own billing customer row"
  on public.billing_customers for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists billing_customers_updated_at on public.billing_customers;
create trigger billing_customers_updated_at
  before update on public.billing_customers
  for each row execute function public.touch_updated_at();

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  subscriber_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  plan_id uuid references public.creator_plans(id) on delete set null,
  status text not null default 'active'
    check (status in ('trialing', 'active', 'past_due', 'canceled', 'incomplete', 'unpaid', 'paused')),
  stripe_customer_id text,
  stripe_subscription_id text unique,
  stripe_price_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subscriber_id, creator_id)
);

alter table public.subscriptions enable row level security;

drop policy if exists "Subscription participants can view subscriptions" on public.subscriptions;
create policy "Subscription participants can view subscriptions"
  on public.subscriptions for select
  using (auth.uid() = subscriber_id or auth.uid() = creator_id);

drop policy if exists "Subscribers can create their own subscriptions" on public.subscriptions;
create policy "Subscribers can create their own subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = subscriber_id);

drop policy if exists "Subscription participants can update subscriptions" on public.subscriptions;
create policy "Subscription participants can update subscriptions"
  on public.subscriptions for update
  using (auth.uid() = subscriber_id or auth.uid() = creator_id)
  with check (auth.uid() = subscriber_id or auth.uid() = creator_id);

drop trigger if exists subscriptions_updated_at on public.subscriptions;
create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.touch_updated_at();

create table if not exists public.payment_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.payment_events enable row level security;

drop policy if exists "Payment events are service only" on public.payment_events;
create policy "Payment events are service only"
  on public.payment_events for select
  using (false);

drop policy if exists "Payment event writes are service only" on public.payment_events;
create policy "Payment event writes are service only"
  on public.payment_events for insert
  with check (false);

insert into storage.buckets (id, name, public)
values ('profile-media', 'profile-media', true)
on conflict (id) do update
set public = excluded.public;

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
