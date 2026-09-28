# AkinLearning Supabase setup

Supabase is the published content source when a complete release is available.
The child app remains playable from the bundled library and the last validated
published cache when Supabase is unavailable. Optional cloud progress is
parent-linked; guest/local play does not require an account.

## 1. Apply the schema

Run the migrations in order in the Supabase SQL editor or through the Supabase
CLI:

1. `supabase/migrations/001_content_library.sql` — compatibility tables,
   words, levels, storage, and editor profile.
2. `supabase/migrations/002_curriculum_and_content_versions.sql` — curriculum,
   grade bands, releases, level revisions, published pointers, rollback RPCs,
   and published-only anonymous level reads.
3. `supabase/migrations/003_learner_progress.sql` — optional learner profiles,
   attempts, mastery projections, sessions, reward ledger, idempotency RPC, and
   RLS.

The current bundled snapshot is provisional, not formal curriculum
certification:

- Curriculum: `akin-default`
- Grade band: `foundation-k-p2` (`Foundation · Kindergarten to Primary 2`)
- Subjects: **13**
- Words: **506**
- Levels: **92**
- SHA-256: `sha256:6c3bc939803a6d038bdf4d64ca94922afdaab297ffb3df56b8731979e329ba96`

The snapshot is generated from the current library by `npm run backup:content`;
do not copy counts from old setup notes.

## 2. Configure the browser safely

Copy `.env.example` to `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The browser uses only the anon key. Never put `SUPABASE_SERVICE_ROLE_KEY` in a
`VITE_*` variable, in the repository, or in a client bundle. Service-role
credentials belong only in a protected seed/import environment.

## 3. Validate and import content

Run the local checks before touching Supabase:

```powershell
npm run backup:content
npm run validate:content-payload
npm run validate:supabase-content
npm run import:content -- --dry-run
npm run seed:supabase -- --dry-run
```

For the initial snapshot, seed server-side with a service-role key:

```powershell
$env:SUPABASE_URL = "https://your-project.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY = "your-service-role-key"
npm run seed:supabase
Remove-Item Env:SUPABASE_SERVICE_ROLE_KEY
Remove-Item Env:SUPABASE_URL
```

The seed pipeline uploads supported PNG/JPEG/WebP assets, upserts the
curriculum, grade, subjects, words, level payloads, revisions, and a published
release, then verifies the scoped count and checksum. It stores generator
configuration for Math, Math Lessons, and Math Genius; random challenge
instances remain code-generated.

For a new curriculum, grade band, or level bundle, use a JSON file with a
`library` array and optional `curriculum`, `gradeBand`, and `release` metadata:

```powershell
npm run import:content -- --file .\content\p3-bundle.json --dry-run
npm run import:content -- --file .\content\p3-bundle.json
# Only after editor/curriculum review:
npm run import:content -- --file .\content\p3-bundle.json --publish
```

Import creates versioned rows and a draft release by default. Production policy
keeps the release private until editor validation and curriculum review are
complete; `--publish` is an explicit release action and publish/rollback RPCs
retain prior revision history.

## 4. Runtime behavior and RLS

`loadLibrary({ curriculumId, gradeBandId, locale })` accepts only a complete
published release whose schema and surface metadata pass validation. A missing
release, network timeout, RLS error, checksum mismatch, or invalid payload
falls back to the complete bundled library/cache and shows a source warning.
It never reports a cloud save when the write failed.
The user-facing source state is `Local fallback` when the bundled library is
active.
This local fallback is the complete bundled library, not a partial cloud merge.

RLS expectations:

- Anonymous/authenticated learners can read active curricula/grade bands and
  levels linked to `content_releases.status = 'published'`.
- Draft/review releases, level revisions, release links, audit fields, and
  learner data are not anonymous-readable.
- Editors/admins can author and publish content through authenticated RLS and
  the publish RPCs.
- A Parent can read/write only their own `learner_profiles` and read the
  associated projections, sessions, attempts, and reward ledger.
- `learning_attempts.client_event_id` is unique. Replayed attempts return a
  duplicate-safe result and cannot award mastery/rewards again.
- Session revisions detect two-device conflicts; a conflict is recoverable and
  does not block local play.

## 5. Parent Library and optional sync

Parent Library shows the selected curriculum, grade band, release ID, and
cloud/local source state. The child Worlds map remains visually identical while
content source changes. Parent Progress can link the current local learner to a
Parent-owned profile and explicitly enable `Sync progress`.

Sync is queued and non-blocking. A queued/error status says that local progress
is safe; it does not show a false success. The local mastery, reward,
retry, persistence, and resume engines remain the immediate behavior owners.

## 6. Operational checklist

Before a release:

- run `npm run validate:supabase-content` and `npm run validate:content-payload`;
- run the complete correctness, surface, game, layout, contract, and build
  suite documented in `AGENTS.md`;
- test anon/editor/admin/parent/non-owner RLS access;
- test publish, rollback, invalid payload, network timeout, offline cache,
  duplicate attempt, and session conflict;
- inspect IDs, status, and latency only in logs; do not log child data, tokens,
  credentials, or payload secrets.

The retained architecture artifact is
`docs/AkinLearning-Supabase-System-Design.docx`. `PROJECT_HANDOFF.md` remains
unchanged because it is project evidence/history, not a current setup command.

## Change log

| Date | Decision | Verification |
|---|---|---|
| 2026-08-23 | Replaced stale seed counts with the current 13-subject/506-word/92-level snapshot and documented migrations 002/003, published release fallback, bulk import, RLS, and optional parent-linked progress. | `npm run validate:supabase-content`, `npm run validate:content-payload`, `npm run import:content -- --dry-run`, `npm run build` |
