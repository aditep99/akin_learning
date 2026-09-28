create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subjects (
  id text primary key,
  name text not null,
  category text not null default 'basic',
  icon text not null default '📚',
  description text not null default '',
  world_label text not null default '',
  world_theme text not null default '',
  buddy_id text not null default 'sun',
  hero_accent text not null default 'gold',
  map_preview_style text not null default 'trail',
  home_mood text not null default 'adventure',
  home_order integer not null default 999,
  content_mode text not null default 'words' check (content_mode in ('words', 'levels')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.words (
  id text primary key,
  subject_id text not null references public.subjects(id) on delete cascade,
  word text not null,
  emoji text not null default '✨',
  phonics text not null default '',
  pronunciation_guide text not null default '',
  pronunciation_ipa text not null default '',
  translation text not null default '',
  image_path text,
  image_url text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.levels (
  id text primary key,
  subject_id text not null references public.subjects(id) on delete cascade,
  level_number integer not null,
  label text not null,
  mode text,
  theme_label text,
  payload jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subject_id, level_number)
);

create table if not exists public.content_migrations (
  id text primary key,
  source_checksum text not null,
  subject_count integer not null,
  word_count integer not null,
  level_count integer not null,
  migrated_at timestamptz not null default now()
);

create index if not exists words_subject_sort_idx
  on public.words(subject_id, sort_order);
create index if not exists levels_subject_number_idx
  on public.levels(subject_id, level_number);
create index if not exists subjects_home_order_idx
  on public.subjects(home_order);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists subjects_set_updated_at on public.subjects;
create trigger subjects_set_updated_at
before update on public.subjects
for each row execute procedure public.set_updated_at();

drop trigger if exists words_set_updated_at on public.words;
create trigger words_set_updated_at
before update on public.words
for each row execute procedure public.set_updated_at();

drop trigger if exists levels_set_updated_at on public.levels;
create trigger levels_set_updated_at
before update on public.levels
for each row execute procedure public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'editor')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.create_profile_for_new_user();

create or replace function public.is_content_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('admin', 'editor')
  );
$$;

alter table public.profiles enable row level security;
alter table public.subjects enable row level security;
alter table public.words enable row level security;
alter table public.levels enable row level security;
alter table public.content_migrations enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "Public reads active subjects" on public.subjects;
create policy "Public reads active subjects"
on public.subjects for select
to anon, authenticated
using (active);

drop policy if exists "Editors manage subjects" on public.subjects;
create policy "Editors manage subjects"
on public.subjects for all
to authenticated
using (public.is_content_editor())
with check (public.is_content_editor());

drop policy if exists "Public reads active words" on public.words;
create policy "Public reads active words"
on public.words for select
to anon, authenticated
using (
  active
  and exists (
    select 1 from public.subjects
    where subjects.id = words.subject_id
      and subjects.active
  )
);

drop policy if exists "Editors manage words" on public.words;
create policy "Editors manage words"
on public.words for all
to authenticated
using (public.is_content_editor())
with check (public.is_content_editor());

drop policy if exists "Public reads active levels" on public.levels;
create policy "Public reads active levels"
on public.levels for select
to anon, authenticated
using (
  active
  and exists (
    select 1 from public.subjects
    where subjects.id = levels.subject_id
      and subjects.active
  )
);

drop policy if exists "Editors manage levels" on public.levels;
create policy "Editors manage levels"
on public.levels for all
to authenticated
using (public.is_content_editor())
with check (public.is_content_editor());

drop policy if exists "Editors read migrations" on public.content_migrations;
create policy "Editors read migrations"
on public.content_migrations for select
to authenticated
using (public.is_content_editor());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'word-images',
  'word-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public reads word images" on storage.objects;
create policy "Public reads word images"
on storage.objects for select
to public
using (bucket_id = 'word-images');

drop policy if exists "Editors upload word images" on storage.objects;
create policy "Editors upload word images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'word-images'
  and public.is_content_editor()
);

drop policy if exists "Editors update word images" on storage.objects;
create policy "Editors update word images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'word-images'
  and public.is_content_editor()
)
with check (
  bucket_id = 'word-images'
  and public.is_content_editor()
);

drop policy if exists "Editors delete word images" on storage.objects;
create policy "Editors delete word images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'word-images'
  and public.is_content_editor()
);
