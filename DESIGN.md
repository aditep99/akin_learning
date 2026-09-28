---
version: alpha
name: "Akin Atlas"
description: "A bilingual, monster-guided learning world that turns short personalized practice into a calm, collectible adventure."
colors:
  primary: "{colors.coral}"
  ink: "#102A43"
  teal: "#0F7891"
  coral: "#F4694F"
  reward: "#FFD166"
  success: "#3CC98A"
  danger: "#C94A4A"
  canvas: "#F6F8F4"
  surface: "#FFFFFF"
  surfaceMuted: "#EAF5F2"
  focus: "#2F80ED"
  answerRed: "#EF4444"
  answerOrange: "#F97316"
  answerYellow: "#F5C542"
  answerGreen: "#22A06B"
  answerBlue: "#3182CE"
  answerPurple: "#8B5CF6"
  answerPink: "#EC4899"
  answerBrown: "#9A6B3F"
  answerBlack: "#1F2937"
  answerWhite: "#FFFFFF"
typography:
  display:
    fontFamily: "Baloo 2, Noto Sans Thai, system-ui, sans-serif"
    fontSize: "4rem"
    lineHeight: "0.98"
  sans:
    fontFamily: "Quicksand, Noto Sans Thai, system-ui, sans-serif"
    fontSize: "1rem"
    lineHeight: "1.5"
  utility:
    fontFamily: "Quicksand, Noto Sans Thai, system-ui, sans-serif"
    fontSize: "0.8125rem"
    lineHeight: "1.3"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
rounded:
  DEFAULT: "0.875rem"
  control: "0.875rem"
  card: "1.625rem"
  hero: "2.25rem"
  pill: "999px"
spacing:
  compactGap: "0.75rem"
  sectionGap: "1.5rem"
  pageGutter: "clamp(1rem, 3vw, 3rem)"
  pageMax: "80rem"
components:
  button:
    backgroundColor: "{colors.coral}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "2.75rem"
  button-secondary:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    height: "2.75rem"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
  dialog:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    width: "32rem"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "2.75rem"
  progress:
    backgroundColor: "{colors.surfaceMuted}"
    height: "0.625rem"
  reward-badge:
    backgroundColor: "{colors.reward}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  status-success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
  status-danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
  page:
    backgroundColor: "{colors.canvas}"
  focus-ring:
    backgroundColor: "{colors.focus}"
    height: "3px"
    width: "100%"
  answer-swatch-red:
    backgroundColor: "{colors.answerRed}"
    rounded: "999px"
    height: "6.75rem"
  answer-swatch-orange:
    backgroundColor: "{colors.answerOrange}"
    rounded: "999px"
    height: "6.75rem"
  answer-swatch-yellow:
    backgroundColor: "{colors.answerYellow}"
    rounded: "999px"
    height: "6.75rem"
  answer-swatch-green:
    backgroundColor: "{colors.answerGreen}"
    rounded: "999px"
    height: "6.75rem"
  answer-swatch-blue:
    backgroundColor: "{colors.answerBlue}"
    rounded: "999px"
    height: "6.75rem"
  answer-swatch-purple:
    backgroundColor: "{colors.answerPurple}"
    rounded: "999px"
    height: "6.75rem"
  answer-swatch-pink:
    backgroundColor: "{colors.answerPink}"
    rounded: "999px"
    height: "6.75rem"
  answer-swatch-brown:
    backgroundColor: "{colors.answerBrown}"
    rounded: "999px"
    height: "6.75rem"
  answer-swatch-black:
    backgroundColor: "{colors.answerBlack}"
    rounded: "999px"
    height: "6.75rem"
  answer-swatch-white:
    backgroundColor: "{colors.answerWhite}"
    rounded: "999px"
    height: "6.75rem"
---

# AkinLearning Design System

## Overview

### Creative North Star

Akin Atlas is a friendly learning map drawn like a field notebook: a child opens one clear mission, follows a visible route, and meets a guide or monster at each meaningful step. The interface should feel like a calm expedition with playful discoveries, not a noisy arcade dashboard.

### Product context and register

- **Audience and primary job:** Children approximately kindergarten–P2 complete short English, Thai, math, science, spelling, and learning-game activities; parents and teachers review progress and maintain content.
- **Target market(s) and evidence:** The current repository contains Thai and English content, Thai parent-facing copy, local-first child progress, and optional Supabase parent/teacher content management. This document does not infer a regulated market from language alone.
- **Locale(s) and language policy:** English is the default shell locale. Thai is supported through a locale dictionary and must cover visible copy, errors, status messages, and accessible names. Subject words, translations, phonics, and exercise data remain data-driven.
- **Usage scene:** Children use touch-first phones/tablets and occasional desktop browsers. Parents use desktop or tablet for reports and library management. Important controls remain reachable at short heights and while the mobile navigation is present.
- **Register:** Hybrid product. Child routes use expressive mission-world visuals; Parent Progress and Parent Library use the same tokens with calmer density and clearer data hierarchy.
- **Named shell variants:** `LearningShell` owns the normal child route, `FocusSessionShell` owns an in-progress mission, and `ParentToolShell` owns parent-facing reports and library tools.
- **Memorable signature:** A mission route/ribbon links the home recommendation, current activity, progress meter, and celebration summary. Akin or the selected monster guide appears where it adds orientation or encouragement.
- **Restraint:** Keep answer choices, instructions, progress, and recovery controls quiet and legible. Use one strong focal moment per surface; decorative clouds, sparkles, and gradients must not compete with the learning task.
- **Anti-references:** Do not resemble a generic SaaS dashboard, a gambling-like reward loop, a dense worksheet, or a direct copy of AdaptedMind. AdaptedMind is a reference for clear entry CTAs, personalized learning paths, targeted help, and measurable progress only: https://www.adaptedmind.com/
- **Token ownership/runtime mapping:** `src/index.css` owns the runtime token adapter and shared visual defaults. The semantic tokens in this file are now active aliases for the Akin Atlas layer; legacy variables remain as compatibility inputs while consumers migrate incrementally. A token migration must update this document, the runtime adapter, shared consumers, and verification in one changeset.

### Runtime token mapping

| DESIGN.md role | Approved target token | Current runtime evidence | Migration rule |
|---|---|---|---|
| ink | `--color-ink` | Active semantic alias in `src/index.css`; `--ink` remains legacy-compatible. | Use the semantic alias in new shared consumers; remove legacy use only after migration evidence. |
| teal | `--color-teal` | Active semantic alias; legacy sky/blue variables remain available. | Do not silently reinterpret `--sky` as teal; migrate deliberately. |
| coral | `--color-coral` | Active semantic alias mapped to the Atlas primary action; legacy orange variables remain. | Keep equivalent action meaning when replacing a legacy consumer. |
| reward | `--color-reward` | Active semantic alias for reward/warning emphasis. | Consolidate new reward UI through shared components. |
| success | `--color-success` | Active semantic alias; legacy green variables remain. | Preserve success meaning while changing appearance. |
| danger | `--color-danger` | Active semantic alias; legacy red variables remain. | Use only for destructive/security-sensitive intent. |
| focus | `--color-focus` | Active global `*:focus-visible` ring in `src/index.css`. | Screen-local focus overrides require a documented exception. |
| answer swatches | `--color-answer-red` through `--color-answer-white` | Active color-answer tokens in `src/index.css`, selected by `data-color-token`. | Use only for answer content; keep the word label visible so color is never the sole signal. |

## Colors

The palette uses deep ink for readable hierarchy, teal for learning orientation, coral for the primary safe action, yellow for earned rewards, mint for success, and red for danger. Canvas and surface colors are intentionally light so real photos and game artwork remain the focal content. Answer swatches use the `answer*` tokens and are paired with a visible name.

Semantic meaning must not rely on color alone. Selected, locked, success, warning, and error states also require text, iconography, shape, or position. Focus uses `#2F80ED` with a visible ring. If a dark or high-contrast theme is introduced, remap semantic roles rather than duplicating component rules.

## Typography

`Baloo 2` is reserved for display headings, mission titles, and large reward numbers. `Quicksand` is the primary UI family, with `Noto Sans Thai` and system fallbacks for Thai and mixed-script text. Body copy uses sentence case and comfortable line height; labels describe what the user controls rather than how the system is implemented.

Do not use all-caps for primary instructions. Utility labels may use small caps or uppercase sparingly when they identify a real category such as `MISSION` or `SKILL FOCUS`. Long Thai strings must wrap naturally without fixed character widths or clipped controls.

## Layout

- Use a centered content width up to `80rem` with responsive page gutters from the `pageGutter` token.
- Preserve the current 761px mobile-to-wide breakpoint unless a migration proves a better breakpoint across the full state matrix.
- Desktop child routes may use the named `FocusSessionShell` variant to maximize the game board; normal child routes use the `LearningShell` navigation.
- Mobile child routes use the bottom navigation with safe-area padding. It must never cover a focused answer, form field, dialog action, or the Parent/Teacher entry.
- Parent tools use natural document scrolling. A bounded data list may own its own scroll, but it must not force a sibling long form into the same fixed-height or hidden-overflow contract.
- Reserve media dimensions and error/help regions so loading, validation, and feedback do not move primary controls.
- At 200% zoom, wrap or reflow important content. Only genuine comparison tables may require two-dimensional scrolling.

### Responsive breakpoint contract

| Band | Width | Layout expectation |
|---|---:|---|
| Mobile | `< 761px` | Single-column child learning, bottom navigation, safe-area padding, and touch-first answer targets. |
| Tablet | `761px–1023px` | The current wide-shell breakpoint is active; keep touch targets and allow two columns only when instructions and recovery controls still fit. |
| Desktop | `≥ 1024px` | Centered content up to `80rem`, expanded navigation, and `FocusSessionShell` may use the available board width. |

The tablet band is a responsive validation target, not permission to change routing or game behavior during a visual-only migration.

## Elevation & Depth

Hierarchy comes from tonal surfaces, a restrained border, and a small number of soft shadows. The mission surface and answer board may have stronger depth than a static report row. Avoid stacked shadows on every nested card. Dialogs and focus surfaces must remain visually above the page without changing document flow.

Avoid blur and backdrop filters when they reduce text contrast, cause expensive repainting on mobile, or make the learning board look translucent. Decorative depth never replaces a border, label, or state message.

## Shapes

Controls use the `control` radius; cards use the `card` radius; hero/mission surfaces may use the `hero` radius; status chips use the `pill` radius. Corners are friendly but not every element should be a pill. Answer cards remain large, clearly bounded targets with a stable footprint in idle, wrong, correct, and disabled states.

## Components

### Foundational visual states

Every interactive component defines default, hover, focus-visible, pressed/active, selected/current, disabled, busy, success, warning, and error states where applicable. Busy states preserve the control's dimensions and expose text or an accessible status. Loading treatment uses a stable app-owned indicator by default; skeletons are allowed only when their geometry exactly matches the final content.

### Buttons and actions

Buttons combine emphasis and intent:

- Solid brand/primary: the single safest main action on a surface.
- Outline neutral: back, cancel, or secondary navigation.
- Solid success: continue after a completed learning action.
- Warning: recoverable caution such as leaving an in-progress mission.
- Danger: delete, reset, sign out, or other destructive/security-sensitive actions.
- Ghost/link: low-emphasis exploration or text navigation.

The visible label and accessible name use the real verb. `Play Today’s Mission`, `Continue`, `Keep Playing`, `Leave Mission`, `Delete`, and `Reset Adaptive Path` must not be replaced by vague labels such as `OK`.

### Navigation and data display

Top-level child navigation is `Today`, `Worlds`, `Arcade`, and `Rewards`. The current item is exposed with `aria-current`. A focus-session variant may add a compact exit/progress HUD, but it must retain orientation and a clear route back to the saved mission context.

World cards show the world name, purpose, progress, next available action, and lock state. Worlds is the default child landing surface on launch and browser refresh, even when a saved mission exists. A saved mission is resumed from an explicit `Continue Mission` action rather than an automatic boot redirect. Selecting a world transitions to the focused mission map, removes decorative guide artwork from the map state, and scrolls/focuses the mission board so the next learning nodes are immediately visible. Reports use readable rows or cards with visible labels; a progress bar is never the only representation of a score.

### Answer representation contract

Every selectable answer value is understandable from the idle state through a representation appropriate to its data type. The visual is stable in loading, idle, wrong, correct, disabled, and reduced-motion states; it must not depend on a network image loading successfully.

| Answer type | Idle representation | Applied surfaces and exception |
|---|---|---|
| Vocabulary | Image or emoji plus the real word label and visible meaning + IPA metadata; `image → emoji → word` fallback | Generic vocabulary choices, spelling prompts, and word-choice Learning Games including Word Fishing, Zombie Word Munch, Pattern Pop, Treasure Sort, Sound Safari, Sound Bubble Pop, and Monster Delivery |
| Color | Flat color swatch plus the real color name | Color exercises use `answerVisual.kind = color` and a validated `token`; the name remains visible |
| Number / operator | Real number, sign, or expression value | Math, Math Genius, and Math Lessons |
| Letter / spelling token | The actual letter or word token | Word Rocket, `spelling-order`, `token-bank-limited`, spelling, and writing surfaces; no active first-letter selection surface |
| Shape | The shape symbol or drawing plus its name/value | Shape Shield and Math Lessons shape choices |
| Count picture | The complete group of pictures with an accessible description | Number-to-scene keeps the counting interaction; accessible text describes the group without replacing the visual task |
| Hotspot | The spatial point on the body map with an accessible word label | Hotspot placement keeps spatial interaction and keyboard focus |
| Memory | Hidden card back until the card is opened | Memory Match and Echo Memory retain the deliberate reveal mechanic |

Sound Bubble Pop uses the vocabulary representation contract: the listening target, fallback visual, and real word label remain aligned in idle, wrong, retry, and reduced-motion states. `first-letter-pick` and `letter-ninja` are retired active modes; their old sessions are handled only by the deterministic migration boundary.

Images, brain icons, monster art, and other playful visuals are supplemental context, never the only answer signal. `src/components/VocabularyAnswer.jsx` owns the shared fallback, label, and meaning/IPA metadata behavior. Phonics remains an audio/narration aid and is not rendered as the learner-facing pronunciation line. Target/prompt text may still follow the retry reveal rule from `challengeReveal.js`; that rule does not hide answer values.

### Mission surface uniqueness

`src/data/missionSurfaces.js` is the canonical catalog for the gameplay a learner sees. Every resolved level and its runtime challenges carry:

- `surfaceId` — the stable subject/track surface identity;
- `surfaceKind` — `single-skill` or `composite-review`;
- `surfaceVariant` — the observable prompt, layout, and interaction cue variant;
- `rendererKey` and `answerRepresentation` — the shared renderer and answer hierarchy that own the surface.

Changing a label or `surfaceId` alone is not a new design. A new surface must change the learner-visible prompt, renderer behavior, answer representation, or interaction cue in a way that is useful for the skill. The mission-surface validator compares the exact challenge signature without counting IDs, labels, or surface names as differences.

The active spelling roster is intentionally varied: `learn-write-speak` (English Level 1 only), `token-bank-limited`, `missing-letter`, `sound-to-word-choice`, `tricky-word-pick`, `write-from-memory`, `word-repair`, and `spelling-sprint`. `spelling-order` remains the full-token ordering surface for the levels that own it. Spelling sprint uses a progress rail and short text-entry rounds without a forced timer. Retired `first-letter-pick` and `letter-ninja` are not active visual surfaces.

`composite-review` surfaces may combine existing modes inside a level, but they still use a distinct review framing and may not repeat an exact challenge signature from another level in the same subject/track. Repeated vocabulary is review content, not a visual contract exception.

### Worlds-first and focused mission map

The splash route opens on `Worlds` so the child sees the available learning path immediately. A world card is a semantic button with one clear next action. After selection, the map route uses the `screen-shell--map-focused` state: decorative guide/monster artwork is omitted, the mission map remains stable, and the map board receives programmatic scroll and focus. Reduced motion uses an instant scroll while preserving the same destination and focus result.

### Math Quest count-check states

Math Quest uses one stable board footprint across `counting`, `invalid`, `verified`, and `answer retry` states. Subtraction shows the full start group and marks each take-away instance with both a diagonal strike and a visible `−` badge; danger color reinforces the mark but is never its only signal. Operand cards use compact category markers and the explicit group labels `Start group` / `Take away` or `First group` / `Second group`.

Before count verification, the equation displays unknown operands, the real `Check counts` action is available, and final answer cards remain visible but natively disabled. Missing or incorrect counts add a visible inline message and an invalid outline without resizing the cards. After verification, both cards receive a verified treatment, the actual equation appears, and the first final answer receives focus. Editing either operand restores the pre-verification visual state. Reduced motion removes movement while preserving the strike, badge, labels, disabled state, and focus ring.

On short desktop and tablet viewports, `FocusSessionShell` owns visible vertical scrolling for Math Quest while the card and activity board keep natural height. On mobile, the document owns vertical scrolling. Neither mode may clip the task, count controls, solution cards, or place the audio control over prompt text.

### Column Math paper entry

The Math Genius column board is a ruled-paper surface with the answer columns right-aligned under the operands. Learners tap the visible slots or use the shared number pad; each slot has a stable footprint, a dashed idle border, a solid focus ring, and a visible square placeholder so an unfinished answer never looks like a completed number.

Answer entry follows the physical paper sequence: ones first, then the carry and tens when addition needs regrouping. Borrowing shows the original tens and ones crossed out and places editable adjusted values beside them before the answer slots. The adjusted ones slot accepts `10–18` as a two-digit value. A legacy answer of `100` adds a hundreds column and a final hundreds slot after the second carry.

Use the existing Akin Atlas ink, teal, coral, reward yellow, and focus blue tokens. Carry and borrow are identified with the `ทด` / `ยืม` labels and English helper text as well as color. The paper board keeps its natural height and visible scroll ownership on short desktop/tablet screens; on mobile it stacks above the keypad and remains reachable at 200% zoom. Slot focus and feedback remain visible under reduced motion.

### Science photo choice cards

Science Exercises uses a named `choice-card--science-photo` variant. The variant keeps the Akin Atlas ink, teal, coral, reward, and focus tokens while giving every local photo a stable 4:3 viewing window, rounded frame, and `object-fit: contain` treatment so roots, stems, leaves, flowers, fruit, and animals remain visible without clipping. The photo itself carries no labels, arrows, highlights, or answer cues; the visible word and meaning metadata stay below it.

The same variant is used for Science sorting items and Today Mission because both render the canonical vocabulary surface. Keyboard focus, touch target size, image-error fallback, and `prefers-reduced-motion: reduce` keep their existing shared behavior.

### Final Test assessment boards

Final Test is a named Akin Atlas world with a calm assessment surface: one
strong prompt, a clearly separated Unit/question marker, and one board that
changes layout according to the declared format. The six formats retain a
shared shell and action bar so children learn where to look for `Check answer`
and `Clear` while the visible answer representation changes to fit the task.

Picture choice uses the local real-photo frame with a stable 4:3 window and a
word label beneath each image. Matching uses two labeled columns and visible
selected/matched states. Fill blank uses one large, centered input. Sentence
order uses a selected sentence rail and a word bank with move/remove controls.
Reading places the short passage above text choices, and applied questions use
the same choice card with a concrete situation and optional photo. All controls
have native focus rings and touch-sized targets; no image, color, or translation
alone communicates the answer.

The board keeps a stable footprint through idle, incomplete, wrong, correct,
disabled, and reduced-motion states. Incomplete checks receive a quiet inline
instruction and no error styling or attempt count. Wrong complete checks retain
the entered value and use the existing retry emphasis; correct checks lock the
board briefly before the next question. The summary is a readable score card
with first-attempt and total-check labels, plus explicit Retry Unit and Back to
Map actions.

Final Test photo assets are bundled local JPEG/PNG files with registry-backed
provenance and no text, arrows, highlights, or vector/data-URI illustrations.
The image fallback remains readable when a file fails. The same board and
visual contract are used in Today Mission, where the presentation label changes
to review context but the Unit map and assessment progress do not change.

### Forms and overlays

Forms use associated labels, explicit help/error text, `noValidate`, stable submit geometry, and first-invalid focus. App-owned dialogs own focus placement, focus containment, Escape behavior, least-destructive initial focus for serious actions, and focus restoration. Toasts use one shared live-region placement and never carry the only copy of a critical error.

### Iconography

Icons and monster art are supportive, not the only source of meaning. Icon-only controls require localized accessible names. Emoji may represent content or playful decoration, but navigation and destructive actions must not depend on emoji interpretation.

### Motion

Motion communicates route changes, answer feedback, progress, and celebration. Most micro-interactions use approximately 200–300ms; route transitions may use 300–500ms when spatial continuity is meaningful. Reduce transforms, stagger, and bounce under `prefers-reduced-motion: reduce`, keeping only a short opacity/status transition when feedback still needs to be perceived.

### Content and data visualization

Copy is conversational, specific, and action-oriented. Incorrect answers use supportive recovery language and never shame the child. Parent reports distinguish local-only data from cloud data. Numbers, progress, dates, and status labels use a stable locale formatter and must remain readable when values grow.

## Do's and Don'ts

- **Do:** Give each screen one obvious next action and a visible reason to choose it.
- **Do:** Reuse the same label, token, feedback, and destination for equivalent operations across child and parent surfaces.
- **Do:** Let Akin/monsters add orientation and encouragement at moments that need warmth.
- **Do:** Keep real learning content and photos legible above decoration.
- **Don't:** Add a new gradient, radius, or button color as a screen-local exception without a named variant and token mapping.
- **Don't:** Use a card with a click handler as a substitute for a native button or link.
- **Don't:** Hide scrollbars, focus rings, errors, loading state, or important copy for visual cleanliness.
- **Don't:** Make the UI look like a direct AdaptedMind clone or claim cloud persistence when the app is using local fallback.

## Change log

| Date | Decision | Affected surfaces | Verification |
|---|---|---|---|
| 2026-08-23 | Created Akin Atlas visual contract; English-first shell with Thai support; documented target token mapping before UI migration. | All child and parent surfaces | `npm run validate:contracts` and `npx -p @google/design.md designmd lint DESIGN.md` |
| 2026-08-23 | Activated the semantic runtime adapter, shared shell variants, reduced-motion button behavior, global focus/scrollbar rules, and app-owned confirmation dialog styling. | Today entry, focus sessions, Parent Progress, Parent Library, navigation overlays | `npm run build` and `npm run validate:contracts` |
| 2026-08-23 | Made vocabulary the primary visible label for word-choice answer cards; retained shared card geometry, icon/animation support, and specialized game modalities. | Word Fishing, Zombie Word Munch, Pattern Pop, Treasure Sort, Sound Bubble, Monster Delivery | `npm run validate:game-integrity`, `npm run build`, and `npx -p @google/design.md designmd lint DESIGN.md` |
| 2026-08-23 | Standardized answer clarity across mission types with shared image/emoji/word fallback, color swatch tokens, visible values, and explicit memory/spatial exceptions. | Generic Gameplay, Learning Games, Spelling, Math, Math Genius, Math Lessons, and Arcade data surfaces | `npm run validate:mission-answers`, `npm run validate:game-integrity`, `npm run build`, and browser/manual QA status in the delivery report |
| 2026-08-23 | Added the Math Quest count-check state system with non-color removal marks, stable category cards, verified/invalid states, and natively disabled final answers. | Math Quest addition/subtraction on mobile, tablet, and desktop | `npm run validate:mission-correctness`, `npm run validate:game-layout`, `npm run build`, and browser/manual QA status in the delivery report |
| 2026-08-23 | Assigned Math Quest scrolling to the responsive shell and reserved a prompt-grid column for audio, preventing clipped controls and text overlap at short desktop, tablet, and mobile sizes. | Math Quest focus-session layout | Browser viewport QA, `npm run validate:game-layout`, and `npm run build` |
| 2026-08-23 | Retired first-letter and Letter Ninja answer surfaces; preserved the shared value/fallback hierarchy and added Sound Bubble Pop to the Learning Games roster. | Thai spelling surfaces and Learning Games Level 4 | `npm run validate:challenge-migrations`, `npm run validate:game-integrity`, `npm run validate:learning-games`, and `npx -p @google/design.md designmd lint DESIGN.md` |
| 2026-08-23 | Made Worlds the default child landing surface; added meaning + IPA metadata to shared vocabulary surfaces; and focused the mission map after world selection while hiding decorative artwork. | Splash Worlds, Adventure Map, Gameplay, Spelling, Learning Games, Math vocabulary cards | `npm run validate:worlds-entry`, `npm run validate:game-layout`, `npm run validate:contracts`, `npm run build`, and `npx -p @google/design.md designmd lint DESIGN.md` |
| 2026-08-23 | Hardened startup so launch and browser refresh render Worlds before any saved-mission resume action. | App boot, Worlds splash, Today Mission resume CTA | `npm run validate:worlds-entry`, `npm run validate:contracts`, and `npm run build` |
| 2026-08-23 | Added canonical `surfaceId`/`surfaceKind`/`surfaceVariant` metadata, differentiated spelling boards, and documented exact-signature uniqueness with review reuse reported separately. | All subject maps, spelling levels, Math/Math Genius/Math Lessons generated boards, and Today Mission | `npm run validate:mission-surfaces`, `npm run validate:mission-correctness`, `npm run validate:challenge-migrations`, `npm run build`, and `npx -p @google/design.md designmd lint DESIGN.md` |
| 2026-09-07 | Added paper-style Column Math slots with ones-first entry, visible carry/borrow rows, strike-through originals, editable focus states, and a legacy hundreds-column fallback. | Math Genius column track and Today Mission Math Genius activities | `npm run validate:column-math`, `npm run validate:game-layout`, `npm run validate:contracts`, `npm run build`, and browser viewport QA |
| 2026-09-07 | Added the Science photo-card variant with consistent 4:3 local imagery, no answer-revealing overlays, and shared fallback/reduced-motion behavior. | Science Exercises Levels 1–6, sorting items, and Today Mission Science | `npm run validate:science-images`, `npm run validate:game-layout`, `npm run validate:contracts`, `npm run build`, and browser viewport QA |
| 2026-09-07 | Added the Final Test assessment-board variant with six clear response layouts, stable photo frames, visible focus/retry states, and a first-attempt summary. | Final Test world, Units 1–4, picture/matching/fill/order/reading/applied boards, Today Mission reuse | `npm run validate:final-test`, `npm run validate:game-layout`, `npm run validate:contracts`, `npm run build`, and responsive/Premium UI QA |

## Published content and cloud-status visual states

Content scope is a product state, not a decorative badge. Parent Library uses
the existing `ParentToolShell` hierarchy for curriculum, grade band, release,
and source status. The source label must distinguish `Cloud connected`,
`Last validated cache`, and `Local fallback`; it must never imply a successful
publish or sync when the operation is pending or failed.

The versioned content model is `curriculum + grade band + published release`.
Draft/review controls remain visibly private to the parent/editor context.
The child Worlds and mission map keep the same learning shell regardless of
source, so a network transition does not change answer card geometry, route
orientation, or the Akin Atlas visual hierarchy.

Optional learner sync uses a calm status treatment in Parent Progress:

- `Sync progress` is a labeled control, never color-only;
- queued writes use a visible status message that says local progress is safe;
- duplicate attempts remain visually neutral because the server idempotency
  result is not a new reward;
- session revision conflicts use an explicit recovery action and preserve the
  local report;
- unavailable Supabase keeps the report local/read-only and does not show a
  cloud-success toast.

Payload validation, RLS, checksum, and release lifecycle are behavior
contracts owned by `CONTENT-CONTRACT.md` and `UX-CONTRACT.md`; this document
owns only their visual representation. `docs/AkinLearning-Supabase-System-Design.docx`
is the retained system-design artifact for the architecture and operational
readiness details.

## Change log

| Date | Decision | Affected surfaces | Verification |
|---|---|---|---|
| 2026-08-23 | Added stable visual states for curriculum/grade scope, published-release source badges, optional cloud sync, queued writes, and session conflicts without changing child shell geometry. | Parent Library, Parent Progress, Worlds, mission map, local fallback | `npm run validate:supabase-content`, `npm run validate:contracts`, `npm run build`, and design lint |


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
