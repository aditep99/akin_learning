# AkinLearning UX Contract

This document defines observable product behavior. It complements `DESIGN.md`, which owns visual intent and tokens. It is the contract for future UI changes; it is not a replacement for API, security, database, or legal policy.

## Product boundaries

- Child learning is local-first. Profile, mission progress, mastery, stars, coins, challenge history, and arcade preferences are stored in browser storage by the existing implementation.
- Parent Progress is protected by the local Parent PIN and reports local device learning insights.
- Parent Library is a separate authenticated surface backed by Supabase. Editor/admin role checks and database/storage RLS remain authoritative.
- If Supabase is unavailable or not configured, the child app may use the bundled library and the Parent Library must clearly remain read-only. The UI must not claim a remote write succeeded.
- The current React/Vite state machine remains the compatibility boundary until a routing migration is explicitly approved.

## Source-of-truth and change rules

1. User-approved product decisions and verified security/API/domain invariants are highest authority.
2. `CONTENT-CONTRACT.md` owns educational meaning, answer correctness, reviewed category rules, and generated-content invariants.
3. This contract owns navigation, state, persistence, feedback, recovery, locale, permissions, and accessibility behavior.
4. `DESIGN.md` owns visual tokens, visual hierarchy, responsive geometry, and motion character.
5. Shared components and canonical sibling workflows are implementation evidence.
6. `PROJECT_HANDOFF.md` is repository evidence and may be stale; current code and validation must be checked before relying on counts or behavior.

When a behavior changes, update this contract, the owning shared implementation, and the relevant test/validation in the same changeset. When a durable visual decision changes, update `DESIGN.md`, runtime tokens, and visual evidence together.

## Primary child learning flow

```text
Worlds (default landing)
  → Select a world
  → Focused Mission Map
  → Start the next unlocked mission
  → Activity
  → Hint/retry when needed
  → Mission Summary
  → Continue, Play Again, or Explore Worlds

Today shortcut
  → Discover My Path (first diagnostic) or Play Today’s Mission (returning child)
  → Activity
  → Hint/retry when needed
  → Mission Summary
  → Continue, Play Again, or Explore Worlds
```

Canonical world path: `Worlds → Mission Map → Activity → Hint → Summary → Continue`.
Today remains a separate shortcut: `Today → Today Mission → Activity → Hint → Summary → Continue`.

### Entry state

| State | Primary label | Destination | Required context |
|---|---|---|---|
| Diagnostic not complete | `Discover My Path` | `today-mission` with diagnostic mode | Explain that the short session helps Akin find a comfortable starting point. |
| Active mission exists | `Continue Mission` | Today Mission after explicit action | Preserve the active mission and return to the exact saved activity only when the learner chooses to continue. |
| Diagnostic complete, no active mission | `Play Today’s Mission` | `today-mission` with 3–5 adaptive activities | Show skill focus, estimated length, and why the mission was selected. |
| No playable content | `Explore Worlds` | Worlds view | Explain that content is unavailable and provide a recovery path; never show an endless spinner. |
| Default app entry | `Worlds` | Worlds view | Always open the world catalog on a fresh launch, browser refresh, or after returning home, while preserving the selected group filter. |

### Activity behavior

- Every activity shows the current mission position and a stable way to pause/leave.
- Correct answers provide immediate success feedback, update the adaptive record, and advance after the feedback state completes.
- Wrong answers do not remove hearts or block progress. The selected answer shows an error state, the child can retry, and a progressively stronger hint may appear.
- Every selectable answer value is understandable at idle through a type-appropriate representation. Vocabulary choices show image/emoji plus the real word and visible meaning + IPA; color choices show a real swatch plus the color name; numbers, operators, letters, spelling tokens, and shapes show their actual value; count-picture scenes keep the picture group with an accessible description; and hotspots keep their spatial map position with an accessible label.
- This answer-value rule applies to standard vocabulary, spelling, science/English exercises, Learning Games, Arcade, Math, Math Genius, and Math Lessons. Images and icons are supplemental, and shared `VocabularyAnswer` fallback is `image → emoji → word` so a broken asset cannot make an answer blank. `VocabularyMeta` owns the visible meaning + IPA line; phonics is audio-only.
- Memory Match and Echo Memory intentionally keep card faces hidden until opened. Hotspot activities intentionally keep spatial selection. Target/prompt text may still reveal after misses according to `challengeReveal.js`; answer values do not wait for that reveal. Validation, wrong state, retry, focus, keyboard activation, persistence, mastery, rewards, and progression remain unchanged.
- First-letter selection is not an active answer surface. Thai Exercises Level 1 uses full-word `spelling-order`, Thai Spelling Level 2 uses `token-bank-limited`, and Learning Games Level 4 uses Sound Bubble Pop. Legacy `first-letter-pick` and `letter-ninja` records are migrated at the active-mission/challenge boundary before rendering.
- Answer cards keep the existing desktop/mobile grid and stable footprint. A wrong answer is visibly marked and remains retryable without removing hearts or blocking progress.
- Audio/listen controls are optional assistance and must not be the only way to understand the task.
- A disabled or busy answer cannot be activated twice.
- A mission transition must not change the answer board footprint unexpectedly.

### Answer representation matrix

| Surface family | Required idle signal | Success destination | Failure recovery | Focus outcome | Persistence rule |
|---|---|---|---|---|---|
| Generic vocabulary / spelling / English exercises | Image or emoji plus visible word/token | Next challenge or mission summary after success feedback | Keep current challenge, show wrong state, allow retry and hint | Focus remains on the selected answer or the next prompt | Existing local-first mission/progress writes only |
| Color exercise | Flat swatch plus visible color name | Existing next challenge path | Retry the same choice; do not rely on hue alone | Selected card keeps visible focus ring | No content-engine or learning-algorithm change |
| Math / Math Genius / Math Lessons | Real number, operator, letter, shape, or count scene | Existing lesson/mission progression | Keep board and input, expose inline correction/retry | Focus stays on keypad/choice or returns to first invalid token | Existing session/progress persistence |
| Learning Games / Arcade | Native value or the game’s documented visual representation; Sound Bubble Pop keeps picture, word, and audio target aligned | Existing round/summary destination | Existing wrong animation, retry, and non-blocking progress | Selected control remains keyboard reachable | Existing local profile/arcade persistence |
| Legacy retired challenge | Deterministically migrated to the current spelling or listening representation; incomplete data shows recovery | Resume the saved mission context after migration | Clear recovery state; never report false success | Focus moves to the migrated activity or recovery action | Preserve index, diagnostic, progress, and reward state |
| Memory | Hidden card back until flip | Existing pair/round completion | Keep cards available and allow another pair | Focus stays on opened/mismatched card | Existing memory session state |
| Hotspot | Spatial marker plus accessible word label | Existing correct hotspot completion | Keep map active and allow another marker | Focus follows the selected marker | Existing mission state |

### Mission surface contract

The runtime surface metadata is durable behavior, not decorative telemetry. Each level owns a `surfaceId`, `surfaceKind`, and `surfaceVariant` from `src/data/missionSurfaces.js`; authored challenges, generated sessions, and Today Mission candidates inherit that metadata. The surface catalog must describe a real difference in prompt, renderer, answer representation, or interaction cue. A new ID or label without a real interaction difference is invalid.

Within one subject/track, an exact challenge signature cannot appear in two levels. The signature comparison ignores challenge IDs, runtime IDs, surface IDs, and display labels, but includes mode, prompt semantics, target, choices, category membership, token sequence, scene counts, operands, and answer contract. Target words may recur as deliberate review when the exact signature differs; the automated report lists this reuse separately from failures.

Spelling levels use distinct active surfaces: `learn-write-speak` only for English Spelling Level 1; `token-bank-limited`; `missing-letter`; `sound-to-word-choice`; `tricky-word-pick`; `write-from-memory`; `word-repair`; and `spelling-sprint`. English Spelling Levels 2–8 are not forced into the Learn → Write → Speak flow. Thai and English spelling replacement surfaces preserve answer IDs, retry, keyboard, focus, reduced-motion, mastery, reward, and progression behavior.

Math, Math Genius, Math Lessons, Learning Games, Arcade, standard subject maps, and Today Mission must carry the canonical surface through generated-session boundaries. Legacy active challenges are reconciled deterministically before rendering; unrepairable payloads enter recovery and never report false success. Completed history is not rewritten.

### Math Quest count verification

Math Quest uses the state sequence `counting → checking → verified → final answer`. The child enters both visible group counts before choosing a final answer.

- Missing operand: show an inline error and focus the first empty group. This is incomplete input, not a wrong learning attempt; do not call wrong-attempt handling.
- Incorrect operand: preserve both entered values, mark and focus the first incorrect group, and use the existing wrong-attempt path. Hearts are not removed and progress is not blocked.
- Correct operands: reveal the real equation, enable final answer buttons, announce the verified state, and focus the first answer.
- Edit, Delete, or Clear after verification: clear verification immediately, hide the solved operands behind unknown placeholders, and natively disable final answers again.
- Incorrect final answer: preserve the verified operands and allow another final-answer attempt.
- The number-pad title follows the selected group. It must never say `Take away` while the `Start group` field is selected.
- Persisted `activeMission` challenges with legacy duplicate scene IDs are normalized on render so the exact mission can resume. This compatibility repair does not rewrite mastery, rewards, or the stored schema.
- Short desktop/tablet: the Math Quest focus shell is the vertical scroll owner; mobile uses document scrolling. Task, groups, keypad, and solution controls must remain reachable without horizontal scrolling.

### Math Genius column-math entry

Column Math uses one shared paper-style board in both the Math Genius route and Today Mission. The answer is entered by place value, starting with the ones column; the UI never concatenates keypad presses into a left-to-right answer string.

- Addition without regrouping: `answerOnes → answerTens → answerHundreds` when a saved legacy answer needs a hundreds column.
- Addition with regrouping: `answerOnes → carry to tens → answerTens`; a legacy answer of 100 also adds `carry to hundreds → answerHundreds`.
- Subtraction with regrouping: `tens after borrowing → ones after borrowing (10–18) → answerOnes → answerTens`.
- Each slot is a native button with a visible focus ring and can be selected again for correction. The shared keypad and physical number keys write only to the active slot; Delete clears that slot and Clear resets the full sequence.
- Check treats blank slots as incomplete input, announces the first missing slot, and does not record a wrong attempt. When all slots are filled, it checks regrouping steps and answer digits together, preserves incorrect values, focuses the first incorrect slot, and uses the existing retry/wrong-answer path.
- The original tens/ones values remain visible during borrowing with a strike-through and a separate adjusted value slot. Carry values are entered in the carry row above the relevant column.
- Generated Column Math keeps ten questions per level: Level 1 has five no-carry and five one-digit carry additions; Levels 2 and 4 carry on every addition; Level 3 borrows on every subtraction; Level 5 alternates five borrow subtractions with five carry additions. New answers stay in `0–99`; legacy saved answers up to `100` remain renderable for resume compatibility.

### Pause, leave, and resume

- `Pause` preserves the current mission in `activeMission` and returns to the Today context or the documented originating surface.
- Selecting another top-level destination during an active mission opens an app-owned leave dialog.
- The dialog actions are `Keep Playing` and `Leave Mission`. `Keep Playing` restores focus to the triggering control. `Leave Mission` preserves the saved index and navigates to the selected destination.
- Browser reload opens `Worlds` even when an active mission is saved. The saved mission remains available through the explicit `Continue Mission` entry action, which restores the exact activity/index when its challenge is still valid.
- When the learner chooses `Continue Mission`, the app applies the canonical challenge migration before validation. `first-letter-pick` becomes full-word `spelling-order`; `letter-ninja` becomes Sound Bubble Pop with deterministic token/choice order. The active activity index, diagnostic state, progress, and reward state are preserved. If the legacy payload is incomplete, show recovery and do not silently start a replacement or report success.

## Secondary child paths

### Worlds

- `Worlds` is an exploratory catalog of learning subjects grouped by Learn, Practice, Math, and Play.
- A world card exposes name, purpose, level/lesson count, progress, lock state, and one next action.
- Worlds is the default child landing surface on launch, browser refresh, and after returning home. Opening a world shows the next unlocked mission first; locked missions remain visible with an understandable reason.
- Selecting a world enters the Adventure Map, hides decorative guide/monster artwork in the focused map state, scrolls to the mission map, and moves focus to the map board. `prefers-reduced-motion: reduce` changes only scroll animation, not the destination or focus outcome.
- Completing the final level returns to the world/map context with success feedback. Completing a level never silently drops the child at an unrelated route.

### Arcade

- Arcade is a low-pressure, quick-play alternative. It may use combo/score/sticker rewards, but it must not imply that speed or gambling-like repetition is required for learning.
- `Start Arcade` begins a valid session. Favorite mode controls are semantic buttons and do not also trigger the parent card action.
- Ending an active run uses the app-owned exit dialog. The run summary reports score, accuracy, rounds, mistakes, combo, and stickers honestly.
- `Play Again` starts a new run. `Back to Arcade` returns to the mode picker.

### Rewards

- Rewards show stars, coins, arcade score, and sticker collection with visible labels.
- Locked rewards explain the action that earns them. The collection is not the only route to continue learning.
- Reward completion links back to a meaningful next action such as Today Mission or Arcade.

## Parent and teacher flows

### Parent entry and progress

- The Parent/Teacher entry is intentionally protected from accidental child activation but remains keyboard and assistive-technology accessible.
- First-time Parent Progress setup creates a four-digit local PIN. Existing PIN entry verifies before showing the report.
- Incorrect PIN or invalid setup shows inline error copy and preserves the safe context. Do not reveal stored hashes or sensitive values.
- Parent Progress is labeled local-only and reports accuracy, questions, sessions, mastery, hints, and recent activity from the current device.
- `Reset Adaptive Path` is destructive to local adaptive state and requires an app-owned confirmation dialog naming the consequence. The dialog stays open while the reset is pending and reports failure without clearing the report on error.
- Product UI must not call `window.alert`, `window.confirm`, or `window.prompt`; delete and reset use the app-owned confirmation dialog contract.

### Parent Library

- Library access requires a valid Supabase session and `admin`/`editor` role. UI gating never replaces server authorization.
- Failed sign-in keeps the user on the login surface, preserves the email, clears/keeps password according to the security policy, and provides a useful error message.
- Content source states are explicit: loading, cloud connected, local/read-only fallback, empty, error, and retry.
- Create/edit forms use `noValidate`, associated labels, inline errors, error summary, first-invalid focus, stable busy buttons, and `textarea { resize: none; }` or a shared textarea owner.
- Successful create/edit returns to the owning subject/list context and announces success through the shared status system.
- Delete is an app-owned confirmation dialog using the real verb `Delete`, names the word and consequence, keeps the dialog open while the mutation is pending, and updates the list only after confirmed success.
- Upload errors preserve the non-sensitive form values and offer retry. Backend errors are translated into user-safe copy; raw payloads do not appear in the UI.
- Sign out returns to the child home and removes the authenticated parent context.

## Canonical operation ledger

| Operation | Trigger | Pending | Success destination/feedback | Failure recovery | Focus outcome |
|---|---|---|---|---|---|
| Start Today Mission | `Discover My Path`, `Play Today’s Mission`, or `Continue Mission` | Stable CTA; app-owned loading if planning takes time | First activity; mission context identifies diagnostic/normal mode | Keep Today context and offer retry | First actionable activity control |
| Answer activity | Answer button/card | Prevent duplicate activation; keep board geometry | Next activity or summary with success feedback | Keep current activity, show retry/hint | Failed choice or next prompt |
| Check Math Quest counts | `Check counts` after entering both groups | Keep board geometry; final answers remain disabled | Reveal actual equation, enable final answers, announce success | Missing value: inline correction without wrong attempt; incorrect value: preserve entries and allow retry | First empty/incorrect group, or first final answer after success |
| Pause mission | `Pause` | None unless saving is async | Today context; resume CTA remains visible | Keep activity open and explain save issue | Pause trigger or resume CTA |
| Leave mission | `Leave Mission` in dialog | Dialog action busy | Chosen destination; active mission remains resumable | Keep dialog open with retry/cancel | Dialog cancel or action trigger |
| Complete mission | Final correct answer | Celebration transition | Mission Summary with rewards and skills | Preserve completed records; show summary recovery | Summary heading |
| Open world | World card or `Explore Worlds` | Stable navigation control | Adventure Map; scroll and focus the mission map | Keep originating Worlds view and show route error state | Mission map board receives focus after scroll |
| Start arcade | `Start Arcade` or game card | Stable CTA | First arcade round | Return to picker with retry | First challenge control |
| Submit parent login | `เข้าสู่ Parent Library` | Stable busy submit button | Library screen; authenticated session | Inline/form-level error; preserve email | First invalid field or form heading |
| Save library content | `Add subject` / `Save` | Button busy, no duplicate submit | Owning list/subject; shared success status | Preserve fields and show retry | Updated item or list heading |
| Delete library word | `Delete` in dialog | Dialog action busy | Word removed; shared success status | Dialog remains open with retry/cancel | Next word or list heading |
| Reset adaptive path | `Reset Adaptive Path` in dialog | Dialog action busy | Parent report refreshed; shared success status | Dialog remains open; state unchanged | Report heading |

## State and feedback contract

Every repeated interactive surface accounts for the applicable states:

- idle/default
- hover
- focus-visible
- pressed/active
- selected/current
- disabled with a known reason
- busy/pending
- success
- warning
- error
- empty
- no-results
- local/read-only fallback
- offline/timeout/retry when remote work is involved
- session expired or permission changed when authenticated

Use one shared status/toast live region. A toast acknowledges an operation; it never replaces inline correction copy or the only explanation of a critical failure. Status copy uses the same verb as the trigger: `Save` → `Saved`, `Delete` → `Deleted`, `Reset` → `Reset` only after confirmed success.

## Persistence and data integrity

- Progress writes are local-first through the existing learning profile/state helpers. Storage failures must not crash gameplay; show a recoverable status when persistence matters.
- Active missions persist the challenge/index needed to resume. Completed records must not be silently rolled back by navigation or a visual redesign.
- Content reads may fall back from Supabase to the bundled library. Remote writes are never simulated in fallback mode.
- New async work must ignore/cancel stale results so an older request cannot overwrite a newer library or session state.
- Do not add optimistic behavior to permission, destructive, or externally visible mutations without an explicit contract update.

## Locale, accessibility, and document orientation

- English is the default shell locale; Thai is a supported locale for all owned copy and accessible names.
- Locale changes preserve screen, progress, active mission, and form values unless a business rule says otherwise.
- Use native semantic controls, visible focus, keyboard equivalence, readable labels, and text alternatives for decorative/icon-only controls.
- Support `prefers-reduced-motion: reduce` and keep focus visible when navigation, dialogs, bottom navigation, or virtual keyboards are present.
- Every navigable app state sets an honest document title such as `Today Mission — AkinLearning`, `Worlds — AkinLearning`, or `Parent Library — AkinLearning`.

## Baseline audit before contract rollout

This is a recorded historical baseline, not a claim of production compliance. It was captured from the repository before this UI migration:

- `npm run build` passed, with a large main JS chunk and stylesheet size warning.
- Adaptive-learning, easy-access UI, game integrity/layout, arcade, learning-games, randomization, shape-symbol, and exercise-content validations passed when run directly.
- `audit_project.py --mode strict --no-write` reported the then-current findings: long-press Parent button action discoverability, missing `noValidate` on Parent/Library forms, missing textarea resize evidence, and WebKit-only scrollbar theming.
- At baseline, `src/screens/LibraryScreen.jsx` and `src/screens/ParentProgressScreen.jsx` contained native confirmation calls; those calls are now replaced by the shared dialog owner.
- The repository had no existing `DESIGN.md` or `UX-CONTRACT.md`; these files establish the first durable design and behavior contracts.

## Current implementation snapshot

This snapshot records what the current code now guarantees after the first contract implementation. It is evidence for future changes, not a substitute for running the checks again:

- `src/App.jsx` derives the Today entry label from state: `Discover My Path`, `Continue Mission`, or `Play Today’s Mission`. A valid `activeMission` is restored when the learner explicitly selects `Continue Mission`; a fresh mount remains on Worlds.
- `src/components/ConfirmDialog.jsx` is the shared owner for leave, delete, and reset confirmation. It traps focus, uses least-destructive initial focus, supports Escape, reports busy/error state, and restores focus on close.
- `src/components/ActionButton.jsx` owns shared disabled/busy/pressed semantics and reduced-motion-safe feedback. `ScreenShell` exposes `LearningShell`, `FocusSessionShell`, and `ParentToolShell` variants.
- Parent forms use `noValidate`, inline/form-level error copy, first-invalid focus, and password/PIN reveal controls. Remote mutation errors are translated into safe copy; local fallback remains visibly read-only.
- Parent / Teacher entry is a normal keyboard- and touch-activated button; the PIN or Supabase gate remains the protection boundary instead of an undiscoverable long press.
- `src/index.css` now exposes active Akin Atlas semantic aliases, a global focus ring, standards-based scrollbar rules, non-resizable textareas, and dialog/CTA states. Legacy visual variables remain during incremental migration.
- `src/components/VocabularyAnswer.jsx` owns image/emoji/word fallback, color swatches, visible answer labels, and accessible visual names. Generic Gameplay and Learning Game choice renderers use it without changing answer IDs or validation.
- `src/index.css` now includes answer swatch tokens and stable vocabulary visual/label sizing. Color, image fallback, word-choice, math, spelling, hotspot, and memory rules remain separate where the interaction requires it.
- The strict static premium audit now reports no findings for this slice. Remaining risk is the large production bundles and browser-level manual checks; no claim of complete production accessibility or performance audit is made here.

## Definition of done for future UI changes

A UI change is complete only when:

1. The affected flow and canonical owner are identified.
2. `DESIGN.md`, `CONTENT-CONTRACT.md`, and/or this contract is updated if durable visual, content, or behavior rules changed.
3. All applicable idle, busy, success, error, empty, permission, responsive, locale, keyboard, and reduced-motion states are covered.
4. No native dialog, screen-local duplicate primitive, false cloud-success message, or inaccessible click target is introduced.
5. `npm run validate:contracts`, relevant project validations, and `npm run build` pass.
6. The final report lists changed files, verification output, baseline failures, and unresolved risks.

## Change log

| Date | Decision | Affected flows | Verification |
|---|---|---|---|
| 2026-08-23 | Created the behavior contract: Today Mission is the primary child entry; English-first shell with Thai support; local-first progress; Supabase-protected Parent Library. | Child navigation, missions, worlds, arcade, rewards, parent progress, parent library | `npm run validate:contracts` and project validation suite |
| 2026-08-23 | Implemented the first contract slice: state-aware Today CTA, active mission resume, app-owned leave/delete/reset dialogs, route titles, form validation/focus, and explicit async fallback messaging. | Today Mission, app navigation, Parent Progress, Parent Library, Parent Login | `npm run build`, `npm run validate:contracts`, and relevant project validations |
| 2026-08-23 | Established visible vocabulary labels for the six word-choice Learning Games while preserving retry/reveal rules and specialized game interactions. | Learning Game answer cards and target/prompt feedback | `npm run validate:game-integrity`, `npm run validate:learning-games`, `npm run validate:game-layout`, `npm run validate:contracts`, and `npm run build` |
| 2026-08-23 | Expanded the answer-value contract across all mission families; added shared fallback/color representation and preserved memory/spatial exceptions and target/prompt reveal behavior. | Generic missions, Learning Games, Arcade, Spelling, Math, Math Genius, Math Lessons | `npm run validate:mission-answers`, project validation suite, `npm run build`, and browser/manual QA status in the delivery report |
| 2026-08-23 | Added two-step Math Quest count verification, deterministic legacy scene normalization, non-blocking operand correction, and real disabled/focus outcomes for final answers. | Math Quest addition/subtraction and resumed `activeMission` sessions | `npm run validate:mission-correctness`, `npm run validate:mission-answers`, `npm run validate:game-layout`, and `npm run build` |
| 2026-08-23 | Recorded the superseded first-written-character instructions and assigned responsive Math Quest scrolling so prompt, count, keypad, and final-answer controls remain reachable. | Legacy Thai first-character records and Math Quest responsive interaction | Browser viewport QA, `npm run validate:mission-correctness`, `npm run validate:contracts`, and `npm run build` |
| 2026-08-23 | Retired active first-letter selection and Letter Ninja, replacing them with full-word Thai spelling interactions and Sound Bubble Pop while preserving deterministic resume migration and no-false-success recovery. | Thai Exercises Level 1, Thai Spelling Level 2, Learning Games Level 4, active mission restore | `npm run validate:challenge-migrations`, `npm run validate:mission-correctness`, `npm run validate:contracts`, and `npm run build` |
| 2026-08-23 | Made Worlds the default child entry, added meaning + IPA as the visible vocabulary metadata line, and focused the mission map after world selection with decorative artwork removed. | Worlds splash, Adventure Map, generic vocabulary, spelling, Learning Games, and Math vocabulary surfaces | `npm run validate:worlds-entry`, `npm run validate:game-layout`, `npm run validate:contracts`, and `npm run build` |
| 2026-08-23 | Hardened fresh-entry behavior so launch and browser refresh stay on Worlds; active missions resume only through the explicit Continue Mission action. | App boot, Worlds splash, Today Mission resume | `npm run validate:worlds-entry`, `npm run validate:contracts`, and `npm run build` |
| 2026-08-23 | Added canonical mission-surface inheritance, spelling surface differentiation, cross-level exact-signature checks, and deterministic generated-session reconciliation. | All subject/track levels, Spelling, Math, Math Genius, Math Lessons, Today Mission, and legacy resume | `npm run validate:mission-surfaces`, `npm run validate:mission-correctness`, `npm run validate:challenge-migrations`, `npm run validate:contracts`, and `npm run build` |
| 2026-09-07 | Changed Math Genius Column Math to paper-style place-value entry: ones first, learner-entered carry/borrow steps, editable slots, and legacy 100-compatible hundreds handling. | Math Genius column track and Today Mission Math Genius activities | `npm run validate:column-math`, `npm run validate:mission-correctness`, `npm run validate:mission-surfaces`, `npm run validate:contracts`, and `npm run build` |
| 2026-09-07 | Added clear 4:3 Science photo choice states with stable fallback and visual-only active-mission rehydration. | Science Exercises and Today Mission Science activities | `npm run validate:science-images`, `npm run validate:mission-answers`, `npm run validate:contracts`, and `npm run build` |
| 2026-09-07 | Added the Final Test world, four-Unit map, six board formats, stable Check/Clear/retry focus states, first-attempt summary, and Today Mission presentation mode. | Final Test gameplay, summary, Worlds, mission map, Today Mission, local photo choices | `npm run validate:final-test`, `npm run validate:mission-surfaces`, `npm run validate:contracts`, `npm run build`, and responsive QA |

### Science photo choice states

Science Exercises keeps the same picture, listening, odd-one-out, and sorting interactions. Photo choices use the shared `VocabularyVisual` fallback, show the English value and Thai meaning/IPA metadata, and keep a visible focus ring when keyboard or touch users move between cards. A failed photo load falls through to emoji and then the word without changing the answer ID or retry state.

When an active Today Mission is resumed, the Science visual registry rehydrates saved choice/item objects in place. The existing challenge ID, choice order, correct answer, basket assignment, mission index, attempts, and progress stay unchanged; only stale image fields and their registry marker are refreshed.

### Final Test assessment states

Final Test is presented as its own world and four-Unit map. The focused board
uses the same `FocusSessionShell` orientation and native controls as the other
learning routes, with one visible question step, English prompt, Thai helper,
and a real `Check answer` action. Picture choice, matching, fill blank,
sentence order, short reading, and applied situations each expose their own
answer controls while keeping the same focus, feedback, and recovery language.

The board treats an incomplete response as a recoverable state: it shows what
is still needed and does not increment attempts or mark the response wrong. A
complete wrong response stays visible for editing, records one attempt, and
focuses the first repair point. A complete correct response locks the submitted
board during the success transition and advances. `Clear` resets only the
current board; starting Retry creates a new 40-question session.

Completing a Unit opens a summary with first-attempt score, total checks, best
first-attempt score, Retry Unit, and Back to Map. The summary never blocks retry
on a pass/fail threshold. Local state persists the latest and best scores under
`learningState.finalTestResults[levelId]`, while the existing stars, coins,
mastery, and mission reward flow remains shared. Today Mission calls the same
screen with `presentation: "today"`; its mission summary owns completion and
Final Test Unit progress is not changed by review.

Final Test photo choices use local files only and the existing image fallback.
The photo frame reserves a stable 4:3 area, keyboard focus remains visible,
and reduced motion removes lift transitions without removing feedback or the
answer sequence. Rehydrating an active mission refreshes only current photo
URLs; IDs, order, answer maps, index, attempts, and progress remain stable.

## Supabase content, fallback, and cloud-progress contract

`loadLibrary({ curriculumId, gradeBandId, locale })` requests a complete
published release. The response includes `source`, `releaseId`, and `warning`.
The child experience accepts a remote bundle only after schema, surface, scope,
and checksum validation. A network timeout, RLS denial, missing release,
invalid payload, or cache write failure falls back to the bundled library (or
the last validated published cache) and visibly identifies the source. No
cloud success is shown for a failed write.

The current bundled snapshot uses provisional `akin-default` /
`foundation-k-p2` scope. Supabase content is versioned by curriculum, grade
band, release, and level revision. Worlds and the mission map read the selected
published release; draft/review content is not visible to anonymous learners.
Parent Library can select the published curriculum/grade scope. New bundles
must pass `npm run import:content -- --dry-run` before an editor publishes them.
The runtime source labels include `Local fallback`; an RPC conflict is returned
as `session_revision_conflict` for deterministic recovery handling.

### Optional parent-linked learner sync

Guest/local play is always valid. A Parent account may link a child profile and
turn on sync. Local mastery, retry, hearts, XP, stars, coins, and active mission
semantics remain the immediate experience; sync is queued and non-blocking.

- Attempt events are append-only and idempotent by `client_event_id`.
- The server RPC updates mastery projections and the reward ledger in one
  transaction; a duplicate event returns `duplicate` and cannot award again.
- A queued event shows a recoverable “waiting for a connection” status. It is
  retried after the parent profile is available and never reports success while
  pending.
- Active cloud sessions carry a revision. A stale device receives a conflict
  state and must not overwrite the newer session silently; local play can
  continue or the learner can choose the latest session.
- Parent RLS exposes only child profiles owned by that Parent account. Guest
  profiles and local storage are not exposed to anonymous users.

### Durable operation ledger additions

| Operation | Trigger | Pending | Success destination/feedback | Failure recovery | Focus outcome | Persistence rule |
|---|---|---|---|---|---|---|
| Load published content | App start or curriculum/grade change | Stable loading state | Worlds uses the validated release and shows source badge | Use complete local/cache fallback with warning | Preserve Worlds/map orientation | Cache by release/checksum; never partial-merge |
| Link learner | Parent Progress → Link this learner | Button busy; controls retain footprint | Child profile selected; sync status announced | Inline error; local report remains usable | Return focus to link/status region | Parent-owned profile; sync off until explicit enable |
| Record cloud attempt | Local answer event while sync is enabled | No gameplay block; optional queued status | Silent synced status or duplicate-safe result | Queue/retry; never false success | Keep answer focus and retry state | Append-only event keyed by `client_event_id` |
| Resume cloud session | Continue a saved mission | Loading/recovery state | Restore matching session revision | Conflict/recovery state; keep local state | Focus first valid control or conflict action | Revision check prevents silent overwrite |
| Publish/rollback release | Editor release action | Publish busy state | Worlds reads new release pointer | Keep prior release/local fallback; show error | Focus release status | Immutable revision/checksum; history is retained |

## Supabase change log

| Date | Decision | Affected flows | Verification |
|---|---|---|---|
| 2026-08-23 | Added published curriculum/grade release loading, checksum/schema validation, cache/local fallback, and Parent Library scope selection. | App startup, Worlds, mission map, Parent Library | `npm run validate:supabase-content`, `npm run validate:content-payload`, `npm run build` |
| 2026-08-23 | Added optional parent-linked cloud progress with idempotent attempts, queued retry, session revision conflict, and honest local/cloud status. | Parent Progress, local mastery, active mission resume | Migration/RLS review and build; live Supabase matrix remains deployment QA |


### 2026-09-08 — Final Test photo-first clues

Final Test picture-choice questions show the English prompt and photos first.
The Thai prompt and all English/Thai option captions appear only when
`wrongAttempts >= 3`. Empty checks do not count; Clear preserves attempts and
unlocked clues. New questions and Retry reset the per-question gate. A failed
image reveals only its own text fallback immediately. Screen readers retain
image descriptions and selection state. This applies identically in Today
Mission without changing answers, IDs, scoring, or other question formats.
Photo cards reserve caption space, use 4:3 photographs, A–D badges and a selected
check mark. Shared ActionButton owns Check/Clear. Responsive two/four-column
layouts, visible focus, 44px controls and reduced motion remain required.
Verification: validate:final-test, contracts/mission checks, build, design lint,
Premium strict audit and browser interaction checks.
