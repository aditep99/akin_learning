# AkinLearning Content Contract

This document is the canonical source of truth for educational question meaning, answer correctness, and generated-content invariants in AkinLearning. It governs authored missions and runtime-generated sessions; it does not replace the visual rules in `DESIGN.md` or the interaction and persistence rules in `UX-CONTRACT.md`.

## Purpose and authority

- Every mission must have a prompt, representation, and validation rule that agree on one intended answer or one complete intended mapping.
- `CONTENT-CONTRACT.md` owns educational semantics: operands, expected answers, spelling reconstruction, category membership, prompt/answer alignment, and the constraints used by generators.
- `UX-CONTRACT.md` owns what happens before, during, and after an answer. `DESIGN.md` owns how the task and answer states look.
- `scripts/fixtures/mission-semantic-cases.mjs` is the independent human-reviewed manifest for authored `odd-one-out` and `sort-two-baskets` missions. Content factories are not evidence of their own semantic correctness.
- `PROJECT_HANDOFF.md` is implementation history and evidence. It is not a source of new content instructions and may contain stale inventory counts.
- A change to a durable learning rule, authored category mission, or generator must update code, this contract, and the relevant validator/manifest in the same changeset.

## Audience and learning boundaries

AkinLearning currently serves approximately kindergarten through early-primary learners using English-first shell copy with Thai support. Prompts should use concrete, age-appropriate language and avoid requiring an unstated specialist definition.

Classification tasks use the ordinary meaning explicitly named by the prompt. Fruit and vegetable missions use everyday culinary grouping, not botanical classification. Tasks about animal size, shape, flight, or habitat use qualifiers such as `usually` when exceptions exist. These conventions make the intended classroom rule explicit; they are not claims that the category is universal in every scientific context.

This repository audit checks logical correctness, content consistency, and clarity for the stated learner range. It is not a formal curriculum certification, standards alignment review, clinical accessibility assessment, or substitute for review by a qualified curriculum specialist and native-language educator.

## Question correctness contract

Every authored or generated challenge must satisfy all applicable rules:

1. The challenge has a stable ID and a supported mode.
2. The prompt and assistance describe the interaction that the renderer and validator actually use.
3. A choice question has exactly one declared correct answer among visible choices. Choice IDs and visible values are not duplicated in a way that creates ambiguity.
4. A mapping or sorting question assigns every item to exactly one declared destination under the stated rule, and every destination has at least one member.
5. The answer can be derived from information visible or intentionally audible in the task. Decorative assets and image availability do not change correctness.
6. A generated challenge remains valid at range boundaries, does not create a negative result unless the level explicitly permits it, and does not expose two different answers that both satisfy the prompt.
7. Randomizing a target updates all target metadata used by the experience, including the correct choice, prompt word, translation, review word, narration/listen value, and answer choices.
8. Wrong-answer retry, mastery, reward, and persistence behavior remain governed by `UX-CONTRACT.md`; content validation must not silently change those systems.

## Mode-specific rules

### Arithmetic and generated math

- Math Quest addition uses `leftCount + rightCount = answer`; subtraction uses `leftCount - rightCount = answer` with `0 <= rightCount <= leftCount`.
- Every Math Quest scene animal has a unique instance `id` such as `cat-1` and a category `wordId` such as `cat`. `sceneMeta.focusIds` and `sceneMeta.removedIds` reference instance IDs only.
- In subtraction, the scene shows the complete start group, exactly `rightCount` matching instances are marked for removal, and the unmarked count equals `answer`.
- In addition, distractor animals may be present only when the prompt names the two groups to count; the scene must contain exactly the declared number of each named category.
- Persisted legacy Math Quest challenges with duplicate category IDs are normalized deterministically. The final `rightCount` matching instances become the removed set, preserving resumability without changing the arithmetic.
- Math Lessons independently recompute count, sequence, before/after, order, parity, comparison, equation, missing-part, operator, place-value, and shape answers from the displayed fields.
- A choose-operator task must have exactly one operator that satisfies the equation.
- Math Genius independently recomputes column equations, daily totals, addition/subtraction stories, operator stories, and two-step chains from their stored values.

### Math Genius Column Math

- Column Math stores the original operands and derives the paper-work steps from the operator and operands; step metadata is informational and must agree with the derived values when present.
- Addition carries the ones total into the tens column. `carryValue` is `0` or `1`; a second carry may move into the hundreds column for a legacy answer of `100`.
- Borrowing subtraction requires `leftValue % 10 < rightValue % 10`. The adjusted tens is `floor(leftValue / 10) - 1` and the adjusted ones is `(leftValue % 10) + 10`, therefore the learner-facing adjusted ones field is always `10–18`.
- New Column Math answers are non-negative and at most `99`. Saved legacy challenges with a correct answer of `100` remain valid for resume rendering and expose a final hundreds answer slot.
- Level generation keeps ten exercises and the requested distribution: Level 1 has five no-carry and five one-digit carry additions; Levels 2 and 4 carry on every addition; Level 3 borrows on every subtraction; Level 5 alternates borrowing subtraction and carrying addition.
- A generated level must use the declared operand range and regrouping condition. The same operand pair is not reused within a generated session, and level ranges/operators keep new arithmetic signatures distinct across the column track.

### Spelling and writing-token tasks

- `targetTokens.join("")` reconstructs the displayed word exactly.
- A token bank contains the same token multiset as the target; repeated letters use distinct token instance IDs.
- A missing-token task has exactly one blank and reinserting `correctAnswer` reconstructs the target word.
- No new first-letter selection may be authored. Thai Exercises Level 1 uses `spelling-order`, and Thai Spelling Level 2 uses `token-bank-limited`; both require the learner to reconstruct the complete target word.
- Legacy `first-letter-pick` sessions are compatibility input only. `challengeMigrations.js` converts them deterministically to `spelling-order`, preserving the challenge ID and target token multiset; incomplete legacy data enters recovery instead of reporting success.
- Spelling replacement must preserve the original target word, token order semantics, validation IDs, retry behavior, and resume state. It must not introduce a new first-letter prompt or answer policy.

### Vocabulary, category, and sort

- Picture, listening, and word-choice tasks keep their correct choice, prompt target, and narration target aligned after randomization.
- `odd-one-out` has one reviewed rule, one reviewed group, and one reviewed outlier. Generic wording is not sufficient when the category could be interpreted in multiple ways.
- `sort-two-baskets` uses two mutually exclusive labels under the stated classroom rule. Labels such as `Sweet` and `Green` that can overlap are not acceptable.
- Everyday culinary fruit/vegetable tasks avoid disputed examples such as corn when the learning goal is a single unambiguous group.
- Animal habitat, flight, size, and food shape tasks use `usually` where a category describes a common characteristic rather than an absolute rule.

### Hotspot, memory, and specialized interactions

- A hotspot target ID resolves to exactly one point. Coordinates stay within `0–100%`, and every point has a real accessible word label.
- Hotspot labels identify selectable locations but must not reveal the answer through hidden metadata unavailable to sighted learners.
- Memory cards intentionally hide their face until opened. Pair IDs are unique and each revealed pair uses the shared answer validator.
- Count-picture choices expose an accessible description of the group without replacing the child's visual counting task with the numeric answer.

### Learning Games and Arcade

- Every mode declares a supported `answerKind`, and its declared correct action must be accepted by `validateLearningGameAnswer`.
- Number Blaster recomputes its equation; Sound Bubble Pop aligns the audible target, picture, and visible word choice; Shape Shield matches the named shape; Pattern Pop continues the visible sequence.
- Legacy `letter-ninja` sessions migrate to Sound Bubble Pop using the target word and a deterministic canonical word-choice pool. The active roster must contain no Letter Ninja renderer or authored challenge.
- Treasure Sort assigns each item to a real basket. Word Rocket contains enough instances of every target letter, including repeated letters.
- Arcade validates every registered mode at difficulty 1, 2, and 3. A newly registered mode must be supported by the answer validator and the correctness audit before release.

### Mission surface uniqueness and spelling roster

- `src/data/missionSurfaces.js` is the canonical source for `surfaceId`, `surfaceKind`, `surfaceVariant`, renderer ownership, and answer representation for every resolved level and track.
- A surface identity must describe a real learner-visible difference in prompt semantics, renderer behavior, answer representation, or interaction cue. A renamed label or ID is not sufficient.
- Within one subject/track, exact challenge signatures must be unique across levels. The comparison ignores IDs, runtime IDs, surface IDs, and labels, but includes mode, target, prompt semantics, choices, category membership, token sequence, scene counts, operands, and answer contract.
- Target words may repeat for spaced review. The surface validator reports target reuse separately, but only exact signature duplicates fail the audit.
- The active spelling roster is `learn-write-speak` (English Spelling Level 1 only), `token-bank-limited`, `missing-letter`, `sound-to-word-choice`, `tricky-word-pick`, `write-from-memory`, `word-repair`, and `spelling-sprint`; `spelling-order` remains a full-token ordering surface where explicitly assigned. No authored challenge may use `first-letter-pick` or `letter-ninja`.
- Generated Math, Math Genius, Math Lessons, Arcade, Learning Games, standard subjects, and Today Mission candidates must inherit their level/track surface metadata. Generated checks use at least 256 fixed seeds per level/track and include boundary fixtures.
- Legacy surface reconciliation preserves active index, attempts, diagnostic state, progress, hearts, XP, and reward state. Incomplete legacy payloads enter recovery and must not report success; completed history is not rewritten.

## Reviewed semantic categories

The reviewed manifest at `scripts/fixtures/mission-semantic-cases.mjs` covers every authored `odd-one-out` and `sort-two-baskets` challenge. Each entry records:

- subject and challenge ID;
- interaction mode;
- the human-readable classification rule;
- expected group members and the one correct outlier, or exact basket-to-member mappings.

`npm run validate:mission-correctness` fails when an authored category challenge is missing from the manifest, a manifest entry is stale, a basket/member set changes, an outlier changes, or a reviewed prompt is absent. Adding a new mission in either mode therefore requires explicit semantic review rather than inheriting approval from a factory helper.

## Automated verification

Run the following for any content, generator, answer renderer, or mission-state change:

```text
npm run validate:mission-correctness
npm run validate:mission-surfaces
npm run validate:challenge-migrations
npm run validate:mission-answers
npm run validate:game-integrity
npm run validate:learning-games
npm run validate:arcade
npm run validate:randomization
node scripts/validate-exercise-content.mjs
npm run validate:contracts
npm run build
```

The correctness validator checks all authored challenges and runs deterministic generated sessions with at least 256 fixed seeds per applicable level or mode. Findings are emitted as JSON with `subject`, `level`, `challengeId`, and `reason`, and any finding returns a non-zero exit code. Boundary fixtures include legacy duplicate Math Quest IDs, zero-result arithmetic, two-digit limits, legacy first-letter migration, and legacy Letter Ninja migration.

Passing automation means the checked invariants held for the exercised data and seeds. It does not prove that every future random state is correct, that every translation is native-quality, or that the project has received formal curriculum approval.

`npm run validate:mission-surfaces` emits JSON findings with `subject`, `track`, `level`, `surfaceId`, `challengeId`, and `reason`. It checks resolved surface inheritance, spelling roster retirement, authored and generated exact-signature uniqueness, fixed-seed generated sessions, Arcade mode boundaries, Today Mission inheritance, and legacy surface migration. Its `reviewReuse` list is informational and is not a failure when the gameplay signature differs.

### Science photo choices

Science Exercises uses the local registry in `src/data/subjects/sciencePhotoAssets.js` for reviewed choice and sort-item photos. Plant Parts presents five distinct close-ups: roots exposed in soil, a stem with visible nodes, one veined leaf, one flower, and one fruit. Science-only photo overrides also cover fish, duck, dolphin, and whale so those choices never fall back to emoji.

Each registry item records a stable asset ID, local source, 4:3 dimensions, SHA-256, license, creator, source page, and review date. New/replaced files are at least 1024×768, under 5 MB, and contain one dominant object without labels, arrows, or answer-revealing marks. A canonical asset may be reused for spaced review in a later challenge, but the visible choices/items in one challenge must have unique asset ID, path, and hash.

The shared `VocabularyVisual` hierarchy remains `image → emoji → word`; an image failure therefore keeps a readable answer surface. Saved Science active missions refresh only these visual fields from the current registry while preserving challenge IDs, option order, prompts, basket assignments, answer IDs, index, and progress. Run `npm run validate:science-images` with the mission validators after changing this pack.

### Final Test assessment content

Final Test is a separate subject with permanent ID `final-test` and four
permanent level IDs `final-test-unit-1` through `final-test-unit-4`. Each Unit
contains exactly 40 authored questions with the fixed distribution of 8
`picture-choice`, 6 `matching`, 8 `fill-blank`, 6 `sentence-order`, 6
`reading`, and 6 `applied` questions. The reviewed roster follows the supplied
Cambridge World English 1 Unit 1–4 pointers for Primary 1 EP practice; it is
not represented as a complete transcription of the published book.

Final Test choice questions have one `correctChoiceId`; matching questions map
every stable left ID to one stable right ID; fill questions provide normalized
`acceptedAnswers`; and sentence-order questions keep stable `correctTokenIds`
that reconstruct the authored sentence. Session creation may shuffle visible
choices, pairs, or word-bank tokens, but never changes the answer key or
question ID. The Final Test validator runs all four Units across at least 256
fixed seeds and checks the authored and runtime answer contracts.

Questions that show a picture use a local raster from
`src/assets/final-test/photo/` and `finalTestPhotoAssets.js`. Registry entries
must include dimensions, SHA-256, CC0/Public Domain license, creator, source
URL, and review date. Asset ID, path, and hash must be unique among choices
shown together; reuse in a later question is allowed for spaced review. SVG,
data URI, answer text, arrows, or highlights are not authored as Final Test
images. A failed image follows the shared fallback without changing meaning or
correctness.

Final Test submissions use one callback and count only complete checks. Blank
or incomplete responses do not add an attempt. A wrong complete response keeps
the entered value available for editing and a correct response advances. The
level result stores `latestFirstAttemptScore`, `bestFirstAttemptScore`,
`totalQuestions`, `attempts`, and `completedAt` under
`learningState.finalTestResults[levelId]`. Today Mission reuses the same board
with `presentation: "today"` and never completes a Final Test Unit.

## Human review boundary

Human review remains required for:

- developmental appropriateness and lesson sequencing;
- cultural and regional interpretation of categories;
- Thai and English naturalness, pronunciation, and pedagogy;
- whether visual complexity, audio, and reading load suit the intended age;
- alignment with a school, ministry, or published curriculum;
- new semantic categories not already represented in the reviewed manifest.

Delivery reports must state automated audit results separately from expert curriculum review. Use wording such as “passed the automated logical/content audit” and do not claim “curriculum certified” unless a named qualified reviewer has actually provided that certification.

## Supabase change log

| Date | Decision | Affected content | Verification |
|---|---|---|---|
| 2026-08-23 | Established the canonical content contract, unique Math Quest scene IDs and legacy normalization, deterministic 256-seed correctness audit, and a reviewed manifest for all authored category missions. | Math Quest, Math Lessons, Math Genius, vocabulary, spelling, Science, English, Learning Games, Arcade | `npm run validate:mission-correctness`, full project validation suite, and `npm run build` |
| 2026-08-23 | Recorded the superseded Thai first-character rule and replaced overlapping animal, food, school, body, and science classifications with explicit single-answer rules. | Thai Exercises, Thai Spelling, authored `odd-one-out` and `sort-two-baskets` missions | Reviewed semantic manifest plus `npm run validate:mission-correctness` |
| 2026-08-23 | Retired first-letter selection from the active roster, replaced Thai Level 1/2 surfaces with full-word spelling interactions, and migrated legacy Letter Ninja sessions to Sound Bubble Pop. | Thai Exercises, Thai Spelling, Learning Games Level 4, active mission resume | `npm run validate:challenge-migrations`, `npm run validate:mission-correctness`, `npm run validate:learning-games`, and `npm run build` |
| 2026-08-23 | Added canonical mission surface metadata and a 256-seed cross-level duplicate audit; differentiated every spelling level surface and fixed generated Math/Math Lessons/Body review overlap. | All subject/track levels, spelling roster, Math generators, Body mixed review, Today Mission | `npm run validate:mission-surfaces`, `npm run validate:mission-correctness`, `npm run validate:mission-answers`, and `npm run build` |
| 2026-09-07 | Added a provenance-backed local Science photo registry, distinct close-up Plant Parts photos, and Science-only fish/duck/dolphin/whale replacements with per-challenge duplicate checks and resume rehydration. | Science Exercises Levels 1–6 and Today Mission Science activities | `npm run validate:science-images`, content/mission validators, and `npm run build` |
| 2026-09-07 | Added the Final Test subject with four 40-question Cambridge World English 1 practice Units, six fixed formats, local photo provenance, deterministic sessions, first-attempt progress, and Today Mission reuse. | Final Test world, Units 1–4, local assets, active mission resume, and content validation | `npm run validate:final-test`, mission/content validators, import dry-run, and `npm run build` |

## Supabase curriculum and release contract

The bundled library and the published Supabase library represent the same
content contract. Supabase is the published source when a complete release is
available; bundled code is the offline and validation fallback. The current
snapshot is deliberately provisional and is stored under curriculum
`akin-default` and grade band `foundation-k-p2`; it is not formal curriculum
certification.

### Identity and payload

The unique level identity is:

`curriculum + gradeBand + subject + track + levelNumber`

Every imported level uses `schemaVersion: 1` and the versioned payload shape:

```json
{
  "schemaVersion": 1,
  "surface": {
    "surfaceId": "english-spelling:write-from-memory",
    "surfaceKind": "single-skill",
    "surfaceVariant": "picture-audio-text-input",
    "rendererKey": "WriteFromMemoryBoard",
    "answerRepresentation": "typed-word"
  },
  "mode": "write-from-memory",
  "exercises": [],
  "wordRefs": []
}
```

`surfaceId`, `surfaceKind`, `surfaceVariant`, `rendererKey`, and
`answerRepresentation` must come from the canonical mission surface catalog;
labels alone cannot evade the duplicate audit. The payload may contain
generated configuration for Math, Math Lessons, or Math Genius, but it must not
contain executable code or a random challenge instance that the generator owns.
Payload validation also enforces a bounded size before import.
Supabase stores these revisions in `level_revisions` and exposes them only
through a published release pointer.

### Draft, review, publish, and rollback

- Bulk JSON import and Parent Library authoring create a draft revision first.
- An editor/admin validates schema, surface inheritance, semantic correctness,
  and exact challenge signatures before attaching a revision to a release.
- Anonymous clients can read only `content_releases.status = published` through
  RLS. Draft/review revisions and audit fields are not public.
- Publishing changes the release pointer and records checksum, schema version,
  publisher, and timestamp. Rollback points the scope back to a previous
  published release; it does not rewrite completed history.
- A failed network, RLS, checksum, or payload validation uses the complete
  bundled library (or the last validated published cache) and reports the
  source honestly.

### Optional learner data

Cloud progress is parent-linked and optional. Guests continue using the local
mastery/reward engine. Cloud attempts are append-only and idempotent by
`client_event_id`; mastery projections and the reward ledger update through a
security-definer transaction. Active sessions use a revision for resume and
conflict detection. A queued sync or conflict is a recoverable status, not a
false success.

`npm run validate:content-payload`, `npm run validate:supabase-content`, and
`npm run import:content -- --dry-run` are the minimum payload/release checks.
They supplement, rather than replace, `npm run validate:mission-correctness`,
`npm run validate:mission-surfaces`, and the reviewed semantic manifest.

## Change log

| Date | Decision | Affected content | Verification |
|---|---|---|---|
| 2026-08-23 | Added versioned curriculum/grade-band payloads, published release checksums, revision lifecycle, and explicit local/cache fallback. | All subjects, levels, generated configuration, bulk import, anonymous reads | `npm run validate:content-payload`, `npm run validate:supabase-content`, `npm run import:content -- --dry-run` |
| 2026-08-23 | Added optional parent-linked learner progress with append-only idempotent attempts, transaction projections, reward ledger, and session conflict recovery. | Learner profiles, mastery, sessions, attempts, rewards | Migration review, RLS review, and runtime build; live Supabase/RLS matrix remains deployment QA |
| 2026-09-07 | Added the Math Genius Column Math step contract for ones-first entry, learner-entered carry/borrow values, bounded level ranges, and legacy answer 100 compatibility. | Math Genius column track and Today Mission generated challenges | `npm run validate:column-math`, `npm run validate:mission-correctness`, and `npm run validate:mission-surfaces` |


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
