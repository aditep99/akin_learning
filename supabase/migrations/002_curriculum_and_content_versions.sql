-- AkinLearning versioned curriculum/content model.
-- This migration keeps the 001 tables and payload column for compatibility.

create table if not exists public.curricula (
  id text primary key,
  code text not null unique,
  name text not null,
  language_code text not null default 'en',
  country_code text not null default 'TH',
  version text not null default '1.0.0',
  provisional boolean not null default true,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.grade_bands (
  id text primary key,
  curriculum_id text not null references public.curricula(id) on delete cascade,
  code text not null,
  label text not null,
  ordinal integer not null default 0,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (curriculum_id, code)
);

create table if not exists public.content_releases (
  id uuid primary key default gen_random_uuid(),
  curriculum_id text not null references public.curricula(id) on delete restrict,
  grade_band_id text not null references public.grade_bands(id) on delete restrict,
  version text not null,
  checksum text not null,
  schema_version integer not null default 1,
  status text not null default 'draft'
    check (status in ('draft', 'review', 'published', 'archived')),
  release_notes text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (curriculum_id, grade_band_id, version)
);

alter table public.levels
  add column if not exists curriculum_id text,
  add column if not exists grade_band_id text,
  add column if not exists track_id text,
  add column if not exists surface_id text,
  add column if not exists surface_kind text,
  add column if not exists surface_variant text,
  add column if not exists renderer_key text,
  add column if not exists answer_representation text,
  add column if not exists schema_version integer,
  add column if not exists published_revision_id uuid,
  add column if not exists release_id uuid;

insert into public.curricula (
  id, code, name, language_code, country_code, version, provisional, active
)
values (
  'akin-default',
  'akin-default',
  'AkinLearning Foundation Library',
  'en',
  'TH',
  '1.0.0',
  true,
  true
)
on conflict (id) do nothing;

insert into public.grade_bands (
  id, curriculum_id, code, label, ordinal, active
)
values (
  'foundation-k-p2',
  'akin-default',
  'foundation-k-p2',
  'Foundation · Kindergarten to Primary 2',
  1,
  true
)
on conflict (id) do nothing;

update public.levels
set
  curriculum_id = coalesce(curriculum_id, 'akin-default'),
  grade_band_id = coalesce(grade_band_id, 'foundation-k-p2'),
  track_id = coalesce(track_id, coalesce(payload->>'trackId', '')),
  surface_id = coalesce(surface_id, payload->>'surfaceId'),
  surface_kind = coalesce(surface_kind, payload->>'surfaceKind'),
  surface_variant = coalesce(surface_variant, payload->>'surfaceVariant'),
  renderer_key = coalesce(renderer_key, payload->>'rendererKey'),
  answer_representation = coalesce(answer_representation, payload->>'answerRepresentation'),
  schema_version = coalesce(schema_version, nullif(payload->>'schemaVersion', '')::integer, 1)
where curriculum_id is null
   or grade_band_id is null
   or track_id is null
   or schema_version is null;

alter table public.levels
  alter column curriculum_id set default 'akin-default',
  alter column grade_band_id set default 'foundation-k-p2',
  alter column track_id set default '',
  alter column schema_version set default 1;

alter table public.levels
  alter column curriculum_id set not null,
  alter column grade_band_id set not null,
  alter column track_id set not null,
  alter column schema_version set not null;

alter table public.levels
  drop constraint if exists levels_subject_id_level_number_key;

alter table public.levels
  drop constraint if exists levels_surface_kind_check;

alter table public.levels
  add constraint levels_surface_kind_check
  check (surface_kind is null or surface_kind in ('single-skill', 'composite-review'));

create table if not exists public.level_revisions (
  id uuid primary key default gen_random_uuid(),
  level_id text not null references public.levels(id) on delete cascade,
  revision_number integer not null,
  schema_version integer not null default 1,
  status text not null default 'draft'
    check (status in ('draft', 'review', 'published', 'archived')),
  payload jsonb not null default '{}'::jsonb,
  checksum text not null,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  published_by uuid references auth.users(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (level_id, revision_number)
);

alter table public.levels
  drop constraint if exists levels_published_revision_id_fkey,
  drop constraint if exists levels_release_id_fkey;

alter table public.levels
  add constraint levels_published_revision_id_fkey
  foreign key (published_revision_id) references public.level_revisions(id)
  on delete set null,
  add constraint levels_release_id_fkey
  foreign key (release_id) references public.content_releases(id)
  on delete set null;

create table if not exists public.content_release_levels (
  release_id uuid not null references public.content_releases(id) on delete cascade,
  level_id text not null references public.levels(id) on delete cascade,
  revision_id uuid not null references public.level_revisions(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (release_id, level_id),
  unique (release_id, revision_id)
);

create unique index if not exists levels_curriculum_grade_subject_track_number_uidx
  on public.levels(curriculum_id, grade_band_id, subject_id, track_id, level_number);
create index if not exists levels_published_release_idx
  on public.levels(release_id, active, level_number);
create index if not exists revisions_level_status_idx
  on public.level_revisions(level_id, status, revision_number desc);
create index if not exists release_scope_status_idx
  on public.content_releases(curriculum_id, grade_band_id, status, updated_at desc);

drop trigger if exists curricula_set_updated_at on public.curricula;
create trigger curricula_set_updated_at
before update on public.curricula
for each row execute procedure public.set_updated_at();

drop trigger if exists grade_bands_set_updated_at on public.grade_bands;
create trigger grade_bands_set_updated_at
before update on public.grade_bands
for each row execute procedure public.set_updated_at();

drop trigger if exists content_releases_set_updated_at on public.content_releases;
create trigger content_releases_set_updated_at
before update on public.content_releases
for each row execute procedure public.set_updated_at();

drop trigger if exists level_revisions_set_updated_at on public.level_revisions;
create trigger level_revisions_set_updated_at
before update on public.level_revisions
for each row execute procedure public.set_updated_at();

create or replace function public.publish_level_revision(p_revision_id uuid)
returns public.level_revisions
language plpgsql
security definer
set search_path = public
as $$
declare
  revision public.level_revisions;
  level_surface jsonb;
begin
  if not public.is_content_editor() then
    raise exception 'content editor role required';
  end if;

  select * into revision
  from public.level_revisions
  where id = p_revision_id
  for update;

  if revision.id is null then
    raise exception 'level revision not found';
  end if;

  if revision.schema_version <> 1
     or jsonb_typeof(revision.payload) <> 'object'
     or jsonb_typeof(revision.payload->'surface') <> 'object' then
    raise exception 'level revision payload failed the publish contract';
  end if;

  level_surface := revision.payload->'surface';
  if coalesce(level_surface->>'surfaceId', '') = ''
     or coalesce(level_surface->>'surfaceKind', '') = ''
     or coalesce(level_surface->>'surfaceVariant', '') = ''
     or coalesce(level_surface->>'rendererKey', '') = ''
     or coalesce(level_surface->>'answerRepresentation', '') = '' then
    raise exception 'level revision surface metadata is incomplete';
  end if;

  update public.level_revisions
  set status = 'published',
      published_by = auth.uid(),
      published_at = now(),
      updated_by = auth.uid()
  where id = revision.id
  returning * into revision;

  update public.levels
  set payload = revision.payload,
      mode = coalesce(revision.payload->>'mode', mode),
      active = true,
      surface_id = level_surface->>'surfaceId',
      surface_kind = level_surface->>'surfaceKind',
      surface_variant = level_surface->>'surfaceVariant',
      renderer_key = level_surface->>'rendererKey',
      answer_representation = level_surface->>'answerRepresentation',
      schema_version = revision.schema_version,
      published_revision_id = revision.id,
      updated_at = now()
  where id = revision.level_id;

  return revision;
end;
$$;

create or replace function public.publish_content_release(p_release_id uuid)
returns public.content_releases
language plpgsql
security definer
set search_path = public
as $$
declare
  release public.content_releases;
  link_row public.content_release_levels;
  pending_count integer;
begin
  if not public.is_content_editor() then
    raise exception 'content editor role required';
  end if;

  select * into release
  from public.content_releases
  where id = p_release_id
  for update;

  if release.id is null then
    raise exception 'content release not found';
  end if;

  select count(*) into pending_count
  from public.content_release_levels link
  join public.level_revisions revision on revision.id = link.revision_id
  where link.release_id = release.id
    and (revision.status not in ('published', 'review', 'draft') or revision.schema_version <> 1);

  if pending_count > 0 then
    raise exception 'content release contains invalid revisions';
  end if;

  for link_row in
    select *
    from public.content_release_levels link
    where link.release_id = p_release_id
  loop
    perform public.publish_level_revision(link_row.revision_id);
  end loop;

  update public.content_releases
  set status = 'archived',
      updated_by = auth.uid(),
      updated_at = now()
  where curriculum_id = release.curriculum_id
    and grade_band_id = release.grade_band_id
    and status = 'published'
    and id <> p_release_id;

  update public.content_releases
  set status = 'published',
      published_by = auth.uid(),
      published_at = now(),
      updated_by = auth.uid()
  where id = p_release_id
  returning * into release;

  update public.levels
  set release_id = p_release_id
  where id in (
    select level_id from public.content_release_levels where release_id = p_release_id
  );

  return release;
end;
$$;

alter table public.curricula enable row level security;
alter table public.grade_bands enable row level security;
alter table public.content_releases enable row level security;
alter table public.level_revisions enable row level security;
alter table public.content_release_levels enable row level security;

drop policy if exists "Public reads active subjects" on public.subjects;
drop policy if exists "Public reads published subjects" on public.subjects;
create policy "Public reads published subjects"
on public.subjects for select
to anon, authenticated
using (
  active
  and exists (
    select 1
    from public.levels published_levels
    join public.content_release_levels links on links.level_id = published_levels.id
    join public.content_releases releases on releases.id = links.release_id
    where published_levels.subject_id = subjects.id
      and published_levels.active
      and releases.status = 'published'
  )
);

drop policy if exists "Public reads active words" on public.words;
drop policy if exists "Public reads published words" on public.words;
create policy "Public reads published words"
on public.words for select
to anon, authenticated
using (
  active
  and exists (
    select 1
    from public.levels published_levels
    join public.content_release_levels links on links.level_id = published_levels.id
    join public.content_releases releases on releases.id = links.release_id
    where published_levels.subject_id = words.subject_id
      and published_levels.active
      and releases.status = 'published'
  )
);

drop policy if exists "Public reads active curricula" on public.curricula;
create policy "Public reads active curricula"
on public.curricula for select
to anon, authenticated
using (active);

drop policy if exists "Editors manage curricula" on public.curricula;
create policy "Editors manage curricula"
on public.curricula for all
to authenticated
using (public.is_content_editor())
with check (public.is_content_editor());

drop policy if exists "Public reads active grade bands" on public.grade_bands;
create policy "Public reads active grade bands"
on public.grade_bands for select
to anon, authenticated
using (
  active and exists (
    select 1 from public.curricula
    where curricula.id = grade_bands.curriculum_id and curricula.active
  )
);

drop policy if exists "Editors manage grade bands" on public.grade_bands;
create policy "Editors manage grade bands"
on public.grade_bands for all
to authenticated
using (public.is_content_editor())
with check (public.is_content_editor());

drop policy if exists "Public reads published releases" on public.content_releases;
create policy "Public reads published releases"
on public.content_releases for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Editors manage releases" on public.content_releases;
create policy "Editors manage releases"
on public.content_releases for all
to authenticated
using (public.is_content_editor())
with check (public.is_content_editor());

drop policy if exists "Editors manage level revisions" on public.level_revisions;
create policy "Editors manage level revisions"
on public.level_revisions for all
to authenticated
using (public.is_content_editor())
with check (public.is_content_editor());

drop policy if exists "Editors manage release levels" on public.content_release_levels;
create policy "Editors manage release levels"
on public.content_release_levels for all
to authenticated
using (public.is_content_editor())
with check (public.is_content_editor());

drop policy if exists "Public reads published release links" on public.content_release_levels;
create policy "Public reads published release links"
on public.content_release_levels for select
to anon, authenticated
using (exists (
  select 1 from public.content_releases
  where content_releases.id = content_release_levels.release_id
    and content_releases.status = 'published'
));

drop policy if exists "Public reads published levels" on public.levels;
drop policy if exists "Public reads active levels" on public.levels;
create policy "Public reads published levels"
on public.levels for select
to anon, authenticated
using (
  active
  and exists (
    select 1
    from public.content_release_levels links
    join public.content_releases releases on releases.id = links.release_id
    where links.level_id = levels.id
      and releases.status = 'published'
  )
);

drop policy if exists "Editors manage levels" on public.levels;
create policy "Editors manage levels"
on public.levels for all
to authenticated
using (public.is_content_editor())
with check (public.is_content_editor());
