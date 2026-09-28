# Akin Learning Project Handoff

## Working Root

- Main project root: `D:\AI\AkinLearning`
- Do not continue work from: `C:\Users\Asus\OneDrive\Documents\Akin Project`
- If starting a new Codex/Desktop thread, open the folder `D:\AI\AkinLearning` first, then create the thread from that folder.

## App Overview

This app is a kids learning app built with React + Vite. The core flow is:

1. `SplashScreen`
2. `AdventureMapScreen`
3. `GameplayScreen` / `SpellingGameplayScreen` / `MathGameplayScreen` / `MathLessonGameplayScreen`
4. In-game celebration overlay, followed by the next level or Map

Main orchestrator:

- `src/App.jsx`

Subject registry:

- `src/data/contentLibrary.js`

Level overrides for major vocabulary subjects:

- `src/data/subjectLevelOverrides.js`

## Subject Groups

`contentLibrary.js` currently registers these subjects:

### Basic

- `animals`
- `body`
- `fruits-vegetables`
- `math`
- `school-things`

### Exercises

- `math-lessons` shown as `Math Exercises`
- `thai-exercises`
- `science-exercises`
- `english-exercises`
- `thai-spelling`
- `english-spelling`

## Core Gameplay Modes

### Vocabulary / Basic Mode Family

Defined mainly in:

- `src/data/subjects/vocabularyPlay.js`
- `src/screens/GameplayScreen.jsx`

Current modes:

- `picture-pick`
- `sound-pick`
- `word-to-picture`
- `odd-one-out`
- `sort-two-baskets`
- `hotspot-place`

### Spelling Mode Family

Defined mainly in:

- `src/data/subjects/spellingShared.js`
- `src/screens/SpellingGameplayScreen.jsx`

Current modes:

- `spelling-order`
- `token-bank-limited`
- `first-letter-pick`
- `missing-letter`
- `sound-to-word-choice`
- `tricky-word-pick`

### Math Quest Mode

Defined mainly in:

- `src/data/subjects/math.js`
- `src/screens/MathGameplayScreen.jsx`

Current mode:

- `math-count`

### Math Exercises / EP Lessons Mode Family

Defined mainly in:

- `src/data/subjects/mathLessons.js`
- `src/screens/MathLessonGameplayScreen.jsx`

Current modes:

- `count-select`
- `number-to-scene`
- `number-sequence`
- `before-after-choice`
- `number-order-pick`
- `parity-pick`
- `parity-target-pick`
- `parity-true-false`
- `compare-pick`
- `equation-choice`
- `scene-equation-choice`
- `equation-input`
- `true-false-equation`
- `missing-part`
- `choose-operator`

## Progress / Unlock Logic

Main logic is in `src/App.jsx`.

Important behavior:

- Progress is stored in React state only, not `localStorage`
- `buildSubjectLevels(subject)` is the source of truth for levels
- Explicit `subject.levels` are used whenever present
- `currentLevel` and `completedLevels` are tracked per subject
- Completing the last challenge in a level:
  - increments stars and coins
  - unlocks the next level
  - auto-starts next level if there is one
  - otherwise returns to `splash`

Important functions in `App.jsx`:

- `buildSubjectLevels`
- `handleStartLevel`
- `handleCorrectChoice`
- `handleWrongChoice`
- `createSafeMathLessonSession`

## Subject-by-Subject Level Summary

## 1. Animals

Files:

- `src/data/subjects/animals.js`
- `src/data/subjectLevelOverrides.js`

Levels:

1. `Picture Find`
2. `Listen and Tap`
3. `Match and Compare`
4. `Sort and Group`
5. `Mixed Challenge`

## 2. Body

Files:

- `src/data/subjects/body.js`
- `src/data/subjects/bodyHotspots.js`
- `src/data/subjectLevelOverrides.js`

Levels:

1. `Picture Find`
2. `Listen and Tap`
3. `Match and Compare`
4. `Sort and Group`
5. `Place on Body`
6. `Mixed Challenge`

Special note:

- Body uses `hotspot-place`
- Level completion stays inside gameplay; there is no Reward route
- Body hotspot coordinates come from `bodyHotspots.js`

## 3. Fruits & Vegetables

Files:

- `src/data/subjects/fruitsVegetables.js`
- `src/data/subjectLevelOverrides.js`

Levels:

1. `Picture Find`
2. `Listen and Tap`
3. `Match and Compare`
4. `Sort and Group`
5. `Mixed Challenge`

## 4. School & Things

Files:

- `src/data/subjects/schoolThings.js`
- `src/data/subjectLevelOverrides.js`

Levels:

1. `Picture Find`
2. `Listen and Tap`
3. `Match and Compare`
4. `Sort and Group`
5. `Mixed Challenge`

## 5. Math Quest

Files:

- `src/data/subjects/math.js`
- `src/data/subjectLevelOverrides.js`
- `src/screens/MathGameplayScreen.jsx`

Levels:

1. `Count`
2. `Count More`
3. `Add`
4. `Take Away`
5. `Mixed Math Mission`

Behavior:

- Runtime-generated sessions per level
- Uses animal cards with image counting
- Supports `+` and `-`
- Level config controls:
  - `exerciseCount`
  - `operatorPool`
  - `subtractionCount`
  - `countRange`
  - `answerRange`
  - `subtractionMax`

## 6. Math Exercises

Files:

- `src/data/subjects/mathLessons.js`
- `src/screens/MathLessonGameplayScreen.jsx`

High-level structure:

- 8 lessons
- Each lesson = 50 questions
- Delivered as 5 sets x 10 questions
- Each set has a theme label and allowed mode list
- Generator validates each challenge with `isValidMathLessonChallenge`

Lessons:

1. `Number 0-5`
2. `Number 6-10`
3. `Even and Odd`
4. `Compare 2 Numbers`
5. `Addition to 9`
6. `Subtraction to 9`
7. `Number 11-50`
8. `2-Digit Add and Subtract`

Lesson set design:

- Set 1 = concrete/picture-heavy
- Set 2 = number match / before-after / direct solve
- Set 3 = missing part / structured thinking
- Set 4 = compare / true-false / decide
- Set 5 = mixed review

## 7. Thai Exercises

File:

- `src/data/subjects/thaiExercises.js`

Levels:

1. `พยัญชนะต้น`
2. `เรียงคำ`
3. `เติมตัวอักษร`
4. `ฟังและเลือก`
5. `ดูให้ดี`

## 8. Science Exercises

File:

- `src/data/subjects/scienceExercises.js`

Levels:

1. `My Body`
2. `Living Things`
3. `Sort Living and Non-living`
4. `Animal Homes`
5. `Science Review`

Important note:

- There was a runtime crash here before from incorrect `pickWords()` usage
- That issue was fixed in `scienceExercises.js`

## 9. English Exercises

File:

- `src/data/subjects/englishExercises.js`

Levels:

1. `Body and Me`
2. `Listen and Tap`
3. `School Match`
4. `Sort and Group`
5. `Mixed Review`

## 10. Thai Spelling

File:

- `src/data/subjects/thaiSpelling.js`

Levels:

1. `Short Thai Words`
2. `Beginning Letter`
3. `Arrange the Word`
4. `Missing Character`
5. `Listen and Choose`
6. `Look Carefully`

## 11. English Spelling

File:

- `src/data/subjects/englishSpelling.js`

Levels:

1. `First Letter`
2. `Short Words`
3. `Missing Letter`
4. `Word Build`
5. `Listen and Choose`
6. `Tricky Words`

## Audio / Narration System

Files:

- `src/hooks/useAudioFeedback.js`
- `src/hooks/useNarration.js`

Responsibilities:

- `useAudioFeedback.js`
  - button pop
  - success
  - oops
  - celebration
- `useNarration.js`
  - TTS voice selection
  - English US voice preference
  - Thai voice preference
  - prompt narration
  - word + phonics playback

Recent important fix:

- `Listen` sometimes failed in some levels because queued follow-up speech from a previous challenge could interfere with the next one
- Current fix in `useNarration.js`:
  - clears pending speech timeout
  - clears follow-up speech timeout
  - primes voice list
  - resumes speech engine if paused
  - uses `wordUtterance.onend` before playing phonics follow-up instead of fixed timing only

If `Listen` breaks again, check first:

- `src/hooks/useNarration.js`
- `src/screens/GameplayScreen.jsx`
- `src/screens/SpellingGameplayScreen.jsx`

## Important Screens

### `SplashScreen.jsx`

- Home / subject selection
- Uses current grouped subjects and subject chips

### `AdventureMapScreen.jsx`

- Shows levels for selected subject
- Uses level labels, `themeLabel`, `mapCaption`, progress, lock state

### `GameplayScreen.jsx`

- Vocabulary/basic subject renderer
- Handles hidden vocabulary reveal after wrong attempts
- Has `Listen` button and choice grid / sort board / hotspot board

### `SpellingGameplayScreen.jsx`

- Spelling subjects renderer
- Handles hidden word reveal after 3 misses
- Supports token placement and choice-based spelling modes

### `MathGameplayScreen.jsx`

- Math Quest renderer
- Handles count entry plus answer choice flow

### `MathLessonGameplayScreen.jsx`

- Math Exercises renderer
- Renders different lesson modes based on `challenge.mode`

### `LibraryScreen.jsx`

- Parent/Teacher content management
- Uses Supabase for persistent subject, word, image, and level data
- Child mode falls back to the bundled JavaScript library when Supabase is unavailable

## Content / Asset Notes

Real image assets are stored mainly under:

- `src/assets/animals/photo`
- `src/assets/body/photo`
- `src/assets/fruits/photo`
- `src/assets/school/photo`
- `src/assets/characters`

Body summary figure asset:

- `src/assets/characters/akin-body-learning-transparent.png`

## Where To Edit Common Requests

If the next thread asks for:

### Add or change a subject

- `src/data/contentLibrary.js`
- subject file in `src/data/subjects/`

### Change a level theme or level count

- `src/data/subjectLevelOverrides.js`
- spelling/exercise subject file if it already has explicit levels

### Change gameplay behavior

- `src/screens/GameplayScreen.jsx`
- `src/screens/SpellingGameplayScreen.jsx`
- `src/screens/MathGameplayScreen.jsx`
- `src/screens/MathLessonGameplayScreen.jsx`

### Fix voice or listen behavior

- `src/hooks/useNarration.js`

### Fix button sounds / celebration sounds

- `src/hooks/useAudioFeedback.js`

### Change level completion flow

- `src/App.jsx`
- Gameplay screens render the celebration feedback overlay

## Current Known State

- Main root should now be `D:\AI\AkinLearning`
- Build was passing from this root
- OneDrive copy should not be used as the main project anymore
- `Listen` logic was recently stabilized in `useNarration.js`

## Suggested First Prompt For a New Thread

Use something like:

`Use D:\AI\AkinLearning as the only project root. Read PROJECT_HANDOFF.md first, then continue from there.`
