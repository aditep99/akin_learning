-- Optional parent-linked learner sync. Guest/local play does not require any
-- row in these tables. Attempts are append-only and projections are updated by
-- security-definer RPCs so replayed client events cannot double-award rewards.

create table if not exists public.learner_profiles (
  id uuid primary key default gen_random_uuid(),
  parent_user_id uuid not null references auth.users(id) on delete cascade,
  local_profile_id text,
  display_name text not null,
  locale text not null default 'en',
  sync_enabled boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (parent_user_id, local_profile_id)
);

create table if not exists public.learner_subject_progress (
  learner_id uuid not null references public.learner_profiles(id) on delete cascade,
  subject_id text not null,
  completed_levels integer not null default 0,
  current_level integer not null default 1,
  total_attempts integer not null default 0,
  total_correct integer not null default 0,
  last_level_id text,
  last_played_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (learner_id, subject_id)
);

create table if not exists public.learner_skill_mastery (
  learner_id uuid not null references public.learner_profiles(id) on delete cascade,
  skill_id text not null,
  label text not null default 'Monster skill',
  score integer not null default 0 check (score between 0 and 100),
  status text not null default 'Needs Practice',
  attempts integer not null default 0,
  correct integer not null default 0,
  first_try_correct integer not null default 0,
  hint_uses integer not null default 0,
  streak integer not null default 0,
  last_played_at timestamptz,
  due_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (learner_id, skill_id)
);

create table if not exists public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learner_profiles(id) on delete cascade,
  level_id text not null,
  release_id uuid references public.content_releases(id) on delete set null,
  status text not null default 'active'
    check (status in ('active', 'completed', 'abandoned', 'recovery')),
  activity_index integer not null default 0,
  revision integer not null default 1,
  state jsonb not null default '{}'::jsonb,
  client_device_id text,
  started_at timestamptz not null default now(),
  last_resumed_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_attempts (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learner_profiles(id) on delete cascade,
  session_id uuid references public.learning_sessions(id) on delete set null,
  client_event_id text not null unique,
  subject_id text not null,
  level_id text,
  challenge_id text,
  skill_id text not null,
  attempt_number integer not null default 1,
  hint_level integer not null default 0,
  correct boolean not null,
  event_at timestamptz not null default now(),
  release_id uuid references public.content_releases(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.reward_ledger (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learner_profiles(id) on delete cascade,
  client_event_id text not null unique,
  source_type text not null,
  source_id text,
  xp_delta integer not null default 0,
  stars_delta integer not null default 0,
  coins_delta integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists learner_profiles_parent_idx
  on public.learner_profiles(parent_user_id, active, updated_at desc);
create index if not exists learning_attempts_learner_time_idx
  on public.learning_attempts(learner_id, event_at desc);
create index if not exists learning_sessions_learner_status_idx
  on public.learning_sessions(learner_id, status, updated_at desc);
create index if not exists mastery_learner_score_idx
  on public.learner_skill_mastery(learner_id, score);

drop trigger if exists learner_profiles_set_updated_at on public.learner_profiles;
create trigger learner_profiles_set_updated_at
before update on public.learner_profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists learner_subject_progress_set_updated_at on public.learner_subject_progress;
create trigger learner_subject_progress_set_updated_at
before update on public.learner_subject_progress
for each row execute procedure public.set_updated_at();

drop trigger if exists learner_skill_mastery_set_updated_at on public.learner_skill_mastery;
create trigger learner_skill_mastery_set_updated_at
before update on public.learner_skill_mastery
for each row execute procedure public.set_updated_at();

drop trigger if exists learning_sessions_set_updated_at on public.learning_sessions;
create trigger learning_sessions_set_updated_at
before update on public.learning_sessions
for each row execute procedure public.set_updated_at();

alter table public.learner_profiles enable row level security;
alter table public.learner_subject_progress enable row level security;
alter table public.learner_skill_mastery enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.learning_attempts enable row level security;
alter table public.reward_ledger enable row level security;

drop policy if exists "Parents manage learner profiles" on public.learner_profiles;
create policy "Parents manage learner profiles"
on public.learner_profiles for all
to authenticated
using (parent_user_id = auth.uid())
with check (parent_user_id = auth.uid());

drop policy if exists "Parents read subject progress" on public.learner_subject_progress;
create policy "Parents read subject progress"
on public.learner_subject_progress for select
to authenticated
using (exists (
  select 1 from public.learner_profiles
  where learner_profiles.id = learner_subject_progress.learner_id
    and learner_profiles.parent_user_id = auth.uid()
));

drop policy if exists "Parents read skill mastery" on public.learner_skill_mastery;
create policy "Parents read skill mastery"
on public.learner_skill_mastery for select
to authenticated
using (exists (
  select 1 from public.learner_profiles
  where learner_profiles.id = learner_skill_mastery.learner_id
    and learner_profiles.parent_user_id = auth.uid()
));

drop policy if exists "Parents manage learning sessions" on public.learning_sessions;
create policy "Parents manage learning sessions"
on public.learning_sessions for select
to authenticated
using (exists (
  select 1 from public.learner_profiles
  where learner_profiles.id = learning_sessions.learner_id
    and learner_profiles.parent_user_id = auth.uid()
));

drop policy if exists "Parents read learning attempts" on public.learning_attempts;
create policy "Parents read learning attempts"
on public.learning_attempts for select
to authenticated
using (exists (
  select 1 from public.learner_profiles
  where learner_profiles.id = learning_attempts.learner_id
    and learner_profiles.parent_user_id = auth.uid()
));

drop policy if exists "Parents read reward ledger" on public.reward_ledger;
create policy "Parents read reward ledger"
on public.reward_ledger for select
to authenticated
using (exists (
  select 1 from public.learner_profiles
  where learner_profiles.id = reward_ledger.learner_id
    and learner_profiles.parent_user_id = auth.uid()
));

create or replace function public.record_learning_attempt(p_event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_child_id uuid;
  v_session_id uuid;
  v_release_id uuid;
  v_client_event_id text;
  v_subject_id text;
  v_level_id text;
  v_challenge_id text;
  v_skill_id text;
  v_skill_label text;
  v_attempt_number integer;
  v_hint_level integer;
  v_correct boolean;
  v_now timestamptz;
  v_inserted_id uuid;
  v_previous_score integer := 0;
  v_previous_streak integer := 0;
  v_score integer;
  v_streak integer;
  v_reward_points integer;
  v_status text;
  v_review_days integer;
  v_reward_event_id text;
  v_reward jsonb;
  v_xp integer := 0;
  v_stars integer := 0;
  v_coins integer := 0;
begin
  v_child_id := nullif(p_event->>'childId', '')::uuid;
  v_session_id := nullif(p_event->>'sessionId', '')::uuid;
  v_release_id := nullif(p_event->>'releaseId', '')::uuid;
  v_client_event_id := nullif(p_event->>'clientEventId', '');
  v_subject_id := coalesce(nullif(p_event->>'subjectId', ''), 'unknown');
  v_level_id := nullif(p_event->>'levelId', '');
  v_challenge_id := nullif(p_event->>'challengeId', '');
  v_skill_id := coalesce(nullif(p_event->>'skillId', ''), 'unknown:activity');
  v_skill_label := coalesce(nullif(p_event->>'skillLabel', ''), 'Monster skill');
  v_attempt_number := greatest(1, coalesce((p_event->>'attemptNumber')::integer, 1));
  v_hint_level := greatest(0, coalesce((p_event->>'hintLevel')::integer, 0));
  v_correct := coalesce((p_event->>'correct')::boolean, false);
  v_now := coalesce(nullif(p_event->>'eventAt', '')::timestamptz, now());

  if v_child_id is null or v_client_event_id is null then
    raise exception 'childId and clientEventId are required';
  end if;

  if not exists (
    select 1 from public.learner_profiles
    where id = v_child_id and parent_user_id = auth.uid() and sync_enabled
  ) then
    raise exception 'learner profile is not owned by the current parent or sync is disabled';
  end if;

  insert into public.learning_attempts (
    learner_id, session_id, client_event_id, subject_id, level_id,
    challenge_id, skill_id, attempt_number, hint_level, correct,
    event_at, release_id, metadata
  ) values (
    v_child_id, v_session_id, v_client_event_id, v_subject_id, v_level_id,
    v_challenge_id, v_skill_id, v_attempt_number, v_hint_level, v_correct,
    v_now, v_release_id, coalesce(p_event->'metadata', '{}'::jsonb)
  )
  on conflict (client_event_id) do nothing
  returning id into v_inserted_id;

  if v_inserted_id is null then
    return jsonb_build_object('accepted', false, 'duplicate', true);
  end if;

  select score, streak into v_previous_score, v_previous_streak
  from public.learner_skill_mastery
  where learner_id = v_child_id and skill_id = v_skill_id
  for update;

  if v_correct then
    v_reward_points := case when v_attempt_number = 1 then 12 else 6 end;
    v_reward_points := greatest(1, v_reward_points - (v_hint_level * 2));
    v_score := least(100, greatest(0, v_previous_score + v_reward_points));
    v_streak := v_previous_streak + 1;
    v_review_days := case when v_streak >= 3 then 7 when v_streak >= 2 then 3 else 1 end;
  else
    v_reward_points := -8;
    v_score := least(100, greatest(0, v_previous_score + v_reward_points));
    v_streak := 0;
    v_review_days := 0;
  end if;

  v_status := case
    when v_score >= 90 and v_streak >= 3 then 'Mastered'
    when v_score >= 80 then 'Ready'
    when v_score >= 60 then 'Learning'
    else 'Needs Practice'
  end;

  insert into public.learner_skill_mastery (
    learner_id, skill_id, label, score, status, attempts, correct,
    first_try_correct, hint_uses, streak, last_played_at, due_at
  ) values (
    v_child_id, v_skill_id, v_skill_label, v_score, v_status, 1,
    case when v_correct then 1 else 0 end,
    case when v_correct and v_attempt_number = 1 then 1 else 0 end,
    case when v_hint_level > 0 then 1 else 0 end,
    v_streak, v_now,
    case when v_correct then v_now + make_interval(days => v_review_days) else v_now end
  )
  on conflict (learner_id, skill_id) do update set
    label = excluded.label,
    score = excluded.score,
    status = excluded.status,
    attempts = learner_skill_mastery.attempts + 1,
    correct = learner_skill_mastery.correct + excluded.correct,
    first_try_correct = learner_skill_mastery.first_try_correct + excluded.first_try_correct,
    hint_uses = learner_skill_mastery.hint_uses + excluded.hint_uses,
    streak = excluded.streak,
    last_played_at = excluded.last_played_at,
    due_at = excluded.due_at,
    updated_at = now();

  insert into public.learner_subject_progress (
    learner_id, subject_id, total_attempts, total_correct,
    last_level_id, last_played_at
  ) values (
    v_child_id, v_subject_id, 1, case when v_correct then 1 else 0 end,
    v_level_id, v_now
  )
  on conflict (learner_id, subject_id) do update set
    total_attempts = learner_subject_progress.total_attempts + 1,
    total_correct = learner_subject_progress.total_correct + excluded.total_correct,
    last_level_id = excluded.last_level_id,
    last_played_at = excluded.last_played_at,
    updated_at = now();

  v_reward := p_event->'reward';
  if jsonb_typeof(v_reward) = 'object' then
    v_reward_event_id := coalesce(nullif(v_reward->>'clientEventId', ''), v_client_event_id || ':reward');
    v_xp := coalesce((v_reward->>'xpDelta')::integer, 0);
    v_stars := coalesce((v_reward->>'starsDelta')::integer, 0);
    v_coins := coalesce((v_reward->>'coinsDelta')::integer, 0);
    insert into public.reward_ledger (
      learner_id, client_event_id, source_type, source_id,
      xp_delta, stars_delta, coins_delta
    ) values (
      v_child_id, v_reward_event_id,
      coalesce(nullif(v_reward->>'sourceType', ''), 'learning-attempt'),
      coalesce(nullif(v_reward->>'sourceId', ''), v_challenge_id),
      v_xp, v_stars, v_coins
    ) on conflict (client_event_id) do nothing;
  end if;

  return jsonb_build_object(
    'accepted', true,
    'duplicate', false,
    'attemptId', v_inserted_id,
    'score', v_score,
    'streak', v_streak,
    'status', v_status
  );
end;
$$;

create or replace function public.save_learning_session(
  p_session_id uuid,
  p_learner_id uuid,
  p_level_id text,
  p_revision integer,
  p_state jsonb,
  p_status text default 'active',
  p_activity_index integer default 0,
  p_release_id uuid default null,
  p_client_device_id text default null
)
returns public.learning_sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  session_row public.learning_sessions;
begin
  if not exists (
    select 1 from public.learner_profiles
    where id = p_learner_id and parent_user_id = auth.uid() and sync_enabled
  ) then
    raise exception 'learner profile is not owned by the current parent or sync is disabled';
  end if;

  select * into session_row
  from public.learning_sessions
  where id = p_session_id
  for update;

  if session_row.id is not null and session_row.revision <> p_revision then
    raise exception using errcode = '40001', message = 'session_revision_conflict';
  end if;

  insert into public.learning_sessions (
    id, learner_id, level_id, release_id, status, activity_index,
    revision, state, client_device_id, last_resumed_at, completed_at
  ) values (
    coalesce(p_session_id, gen_random_uuid()), p_learner_id, p_level_id,
    p_release_id, p_status, p_activity_index,
    coalesce(p_revision, 1), coalesce(p_state, '{}'::jsonb),
    p_client_device_id, now(), case when p_status = 'completed' then now() else null end
  )
  on conflict (id) do update set
    status = excluded.status,
    activity_index = excluded.activity_index,
    revision = learning_sessions.revision + 1,
    state = excluded.state,
    client_device_id = excluded.client_device_id,
    last_resumed_at = now(),
    completed_at = excluded.completed_at,
    updated_at = now()
  returning * into session_row;

  return session_row;
end;
$$;

revoke all on function public.record_learning_attempt(jsonb) from public, anon;
grant execute on function public.record_learning_attempt(jsonb) to authenticated;
revoke all on function public.save_learning_session(uuid, uuid, text, integer, jsonb, text, integer, uuid, text) from public, anon;
grant execute on function public.save_learning_session(uuid, uuid, text, integer, jsonb, text, integer, uuid, text) to authenticated;
