# AkinLearning Agent and Developer Guide

This file is the entry point for any agent or developer changing AkinLearning. It is an engineering guardrail, not a replacement for the product contracts.

## Project boundary

- Use `D:\AI\AkinLearning` as the only project root.
- Do not continue work from `C:\Users\Asus\OneDrive\Documents\Akin Project` or another copy.
- The application stack is React 19, Vite, Framer Motion, local browser storage, and optional Supabase content/auth services.
- Always preserve unrelated user changes. Never reset, clean, overwrite, or delete broad workspace paths to make a task easier.

## Required reading order

Before changing application code, read these files in order:

1. `AGENTS.md` — this guide and editing guardrails.
2. `DESIGN.md` — visual system, tokens, component states, and responsive rules.
3. `UX-CONTRACT.md` — navigation, state, persistence, feedback, recovery, locale, and accessibility behavior.
4. `CONTENT-CONTRACT.md` — question meaning, educational correctness, semantic review, and generated-content invariants.
5. `SUPABASE_SETUP.md` — migration order, release/import operation, RLS boundary, and local/cloud fallback.
6. `PROJECT_HANDOFF.md` — implementation evidence, current content inventory, and known architecture notes.

`PROJECT_HANDOFF.md` is evidence about the repository. It does not override the current user request, security/API contracts, `CONTENT-CONTRACT.md`, `UX-CONTRACT.md`, or `DESIGN.md`.

## Source-of-truth precedence

Resolve conflicts in this order:

1. Current user request and approved product decisions.
2. Verified security, API, database, and domain invariants.
3. `CONTENT-CONTRACT.md` for educational meaning, answer correctness, and generator invariants.
4. `UX-CONTRACT.md` for observable behavior.
5. `DESIGN.md` for visual intent and durable tokens.
6. Shared components and the strongest sibling workflow.
7. `SUPABASE_SETUP.md` for operational setup and deployment instructions.
8. `PROJECT_HANDOFF.md` and other repository notes as implementation evidence.
9. A documented, low-risk default when no stronger source exists.

If two authoritative sources conflict, stop and record the conflict in the task summary. Do not silently average the behavior.

## Scope guardrails

- Do not change content generation, mastery scoring, reward accounting, challenge validation, or Supabase schema/RLS unless the task explicitly includes that change. An approved content/generator change must also update `CONTENT-CONTRACT.md` and its independent validation evidence.
- Every resolved level must inherit a canonical `surfaceId`, `surfaceKind`, and `surfaceVariant` from `src/data/missionSurfaces.js`. Do not rename a surface or add a label-only variant to evade duplicate-surface or exact-signature checks; a new surface requires a real prompt, renderer, answer representation, and interaction cue difference.
- Do not ship an exact challenge signature twice across levels in the same subject/track. Target-word reuse for deliberate review is allowed only when the interaction signature is different and is reported separately by `npm run validate:mission-surfaces`.
- Do not change the default learning loop without updating `UX-CONTRACT.md` in the same change.
- When retiring a durable challenge mode, remove it from authored content, active renderers, randomizers, answer maps, mode sets, styles, and source contracts in the same changeset. Add a deterministic migration at the active-mission and challenge-session boundaries, preserve resume/progress/reward state, and provide an honest recovery state for incomplete legacy data.
- Do not add a screen-local version of a shared button, dialog, toast, field, progress meter, navigation item, or loading state.
- Use business-named variants when a surface genuinely needs different behavior, for example `FocusSessionShell` or `ParentToolShell`.
- Keep local fallback behavior honest. Never show a cloud-saved success message when the app is using the bundled local library.
- Keep English as the default shell locale and preserve Thai support. All visible copy and accessible names must be ready for localization.
- Keep `Worlds` as the default child landing surface. Selecting a world must enter the focused mission map, scroll to the map board, and preserve a keyboard/screen-reader focus outcome.
- A fresh app mount or browser refresh must remain on `Worlds`; a saved active mission may resume only after the learner explicitly chooses `Continue Mission`.
- Visible vocabulary metadata uses meaning plus IPA. Phonics may remain in the audio/narration path, but must not be rendered as the learner-facing pronunciation line.
- Do not copy AdaptedMind branding, artwork, text, or proprietary visual assets. Use it only as a reference for clear entry CTAs, personalized learning paths, targeted help, and measurable progress.

## Interaction and accessibility rules

- Use native `<button>` for actions and `<a>` for navigation whenever possible.
- Every enabled pointer target must have hover, focus-visible, pressed/active, disabled, and busy states where applicable.
- Every important touch target should be approximately 44 CSS px or larger.
- Do not use `window.alert`, `window.confirm`, or `window.prompt` for product UI. Use the app-owned dialog contract.
- Forms must own validation with `noValidate`, associated labels, inline correction text, `aria-invalid`, `aria-describedby`, and first-invalid focus.
- Preserve stable control geometry while loading or submitting.
- Every async operation needs honest loading, success, error, and recovery behavior.
- Respect `prefers-reduced-motion: reduce`; motion must communicate state rather than decorate routine actions.
- Keep scrollbars visible, styled, and keyboard/touch operable. Never hide a product-owned scroll surface only for appearance.
- Never make color the only signal for selected, success, warning, error, or locked states.

## Editing workflow

1. Read the required documents and inspect the current implementation before editing.
2. Identify the canonical component and behavior owner for the requested change.
3. Write down the affected user flow: trigger → pending → success destination → feedback → failure recovery → focus outcome.
4. Make the smallest coherent change. Prefer shared tokens, primitives, selectors, and hooks over screen-local patches.
5. Update `DESIGN.md` when a durable visual token or visual rule changes.
6. Update `UX-CONTRACT.md` when navigation, state, persistence, copy vocabulary, permissions, feedback, or recovery changes.
7. Update `CONTENT-CONTRACT.md` and the reviewed semantic manifest when question meaning, expected membership, answer policy, or generated-content constraints change.
8. Update the canonical mission surface catalog and spelling roster when a level's gameplay changes.
9. Add or update tests/validation for the changed state matrix, including the 256-seed surface audit.
10. Run the relevant checks before claiming completion.
11. For durable content/mode retirement, run the migration validator and confirm no active authored or renderer references remain.
12. Report changed files, verification results, known baseline failures, and unresolved risk.

## Verification commands

Run the commands relevant to the change. For a shared UI change, run at least:

```text
npm run validate:contracts
npm run validate:mission-correctness
npm run validate:mission-surfaces
npm run validate:challenge-migrations
npm run validate:mission-answers
npm run build
npm run validate:adaptive-learning
npm run validate:easy-access-ui
npm run validate:game-integrity
npm run validate:game-layout
npm run validate:worlds-entry
npm run validate:arcade
npm run validate:learning-games
npm run validate:randomization
npm run validate:shape-symbols
node scripts/validate-exercise-content.mjs
npx -p @google/design.md designmd lint DESIGN.md
```

For product/admin changes, also run the Frontend Design Premium static audit in report/strict mode as appropriate. Do not claim that an audit passed if a known baseline finding remains.

`premium-ui.json` is the machine-readable UI-audit manifest. It records
intentional ownership decisions that cannot be inferred from JSX alone; the
current Parent Library and Parent Progress selectors intentionally use the
native `Select/Listbox` control for platform keyboard and mobile behavior.
Keep that ownership decision in sync with the shared UX contract when adding a
new select or replacing the control.

## Known baseline risks

The contract documents record the baseline that existed when they were created. In particular:

- The existing stylesheet is large and contains multiple historical refresh layers.
- The initial Vite bundle is large and currently emits a chunk-size warning.
- Parent/Library forms need canonical validation ownership and `textarea` resize behavior.
- Existing destructive actions include native confirmation calls that must be migrated to the app-owned dialog.
- The existing global scrollbar styling needs standards-based `scrollbar-color` and `scrollbar-width` properties in addition to WebKit fallbacks.
- The long-press Parent/Teacher control needs an explicit accessible action/state contract even though the gesture itself is intentional.

These are migration items, not permission to make unrelated fixes during a future task.

## Change record

When a task changes a durable contract, add a short entry to the relevant document's change log with the date, decision, affected surfaces, and verification command. Keep historical notes concise; the current contract must remain easy to find.

- **2026-08-23 — Mission surface uniqueness:** Added the canonical surface catalog, spelling roster, generated-session reconciliation, and exact-signature duplicate audit. Affected all subjects/tracks, Math generators, Today Mission, and spelling gameplay. Verify with `npm run validate:mission-surfaces`, `npm run validate:mission-correctness`, `npm run validate:challenge-migrations`, and `npm run build`.

## Supabase content and learner-data boundary

The Supabase schema may be changed only when the task explicitly requests a
content, curriculum, grade-band, publish, or cloud-progress change. For this
platform, `SUPABASE_SETUP.md` documents the operational setup, while
`CONTENT-CONTRACT.md` owns payload correctness and `UX-CONTRACT.md` owns
fallback, sync, resume, and conflict behavior.

- Published content is selected by `curriculumId + gradeBandId + releaseId`.
  Anonymous clients can read only an active published release. Draft/review
  revisions, audit fields, and learner records remain protected by RLS.
- The browser may use only the Supabase anon key. A service-role key belongs in
  server-side seed/import tooling and must never appear in `VITE_*` variables.
- `npm run validate:content-payload` and `npm run validate:supabase-content`
  must pass before a release or bulk import is considered publishable.
  `npm run import:content -- --dry-run` is the required first step for a new
  curriculum, grade band, or level bundle.
- Content loaders validate a complete published bundle before replacing the
  bundled library. Network, RLS, checksum, schema, or payload failures use the
  bundled fallback (or the last validated cache) and must not report cloud
  success.
- Guest/local play remains valid. Parent-linked cloud progress is optional,
  append-only at the attempt layer, idempotent by `client_event_id`, and
  non-blocking. A queued or conflicted sync must be visible as a sync status,
  never as a completed write.
- Generated Math, Math Lessons, and Math Genius content stores configuration and
  release metadata, not random challenge instances. Renderer, generator,
  mastery, reward, and persistence semantics remain code-owned.
- Publish and rollback operations must use the versioned release/revision RPCs;
  do not mutate a published payload in place. Record the release checksum and
  schema version in the same changeset as the content change.

The current bundled snapshot is provisional (`akin-default` /
`foundation-k-p2`) and is not formal curriculum certification.

- **2026-08-23 — Versioned Supabase platform:** Added curriculum/grade-band
  content releases, revision validation, local/cache fallback, bulk import
  dry-run tooling, and optional parent-linked learner progress with idempotent
  attempt sync. Verify with `npm run validate:supabase-content`,
  `npm run validate:content-payload`, `npm run import:content -- --dry-run`,
  and `npm run build`.
