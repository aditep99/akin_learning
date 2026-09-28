import { GameplayScreen } from "./GameplayScreen";
import { LearningGameScreen } from "./LearningGameScreen";
import { MathGameplayScreen } from "./MathGameplayScreen";
import { MathGeniusGameplayScreen } from "./MathGeniusGameplayScreen";
import { MathLessonGameplayScreen } from "./MathLessonGameplayScreen";
import { SpellingGameplayScreen } from "./SpellingGameplayScreen";
import { FinalTestGameplayScreen } from "./FinalTestGameplayScreen";

const spellingModes = new Set([
  "spelling-order",
  "token-bank-limited",
  "missing-letter",
  "sound-to-word-choice",
  "tricky-word-pick",
  "learn-write-speak",
  "write-from-memory",
  "word-repair",
  "spelling-sprint",
]);

export function TodayMissionChallengeScreen({
  activity,
  currentChallenge,
  failedChoiceId,
  level,
  wrongAttempts = 0,
  onBack,
  onCorrectChoice,
  onFinalTestAnswer,
  onPress,
  onWrongChoice,
  stepIndex,
  totalSteps,
  track,
}) {
  if (!currentChallenge) {
    return null;
  }

  const mode = currentChallenge.mode || activity?.mode;
  const subjectId = activity?.subjectId;
  const isMath = subjectId === "math" || mode === "math-count";
  const isMathLesson = subjectId === "math-lessons" || mode === "math-lesson";
  const isMathGenius = subjectId === "math-genius" || mode === "math-genius";
  const isFinalTest =
    subjectId === "final-test" ||
    currentChallenge.type === "final-test" ||
    String(mode || "").startsWith("final-");
  const isLearningGame =
    subjectId === "learning-games" || currentChallenge.type === "learning-game";

  if (isFinalTest) {
    return (
      <FinalTestGameplayScreen
        key={`today-final-test-${currentChallenge.id}`}
        activity={activity}
        currentChallenge={currentChallenge}
        failedChoiceId={failedChoiceId}
        level={level}
        levelThemeLabel={activity?.levelConfig?.themeLabel || "Today Mission"}
        wrongAttempts={wrongAttempts}
        onBack={onBack}
        onCorrectChoice={onCorrectChoice}
        onFinalTestAnswer={onFinalTestAnswer}
        onPress={onPress}
        onWrongChoice={onWrongChoice}
        presentation="today"
        stepIndex={stepIndex}
        totalSteps={totalSteps}
      />
    );
  }

  if (isMath) {
    return (
      <MathGameplayScreen
        key={`today-math-${currentChallenge.id}`}
        currentChallenge={currentChallenge}
        failedChoiceId={failedChoiceId}
        wrongAttempts={wrongAttempts}
        level={level}
        onBack={onBack}
        onCorrectChoice={onCorrectChoice}
        onPress={onPress}
        onWrongChoice={onWrongChoice}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
      />
    );
  }

  if (isMathGenius) {
    return (
      <MathGeniusGameplayScreen
        key={`today-genius-${currentChallenge.id}`}
        currentChallenge={currentChallenge}
        failedChoiceId={failedChoiceId}
        wrongAttempts={wrongAttempts}
        level={level}
        onBack={onBack}
        onCorrectChoice={onCorrectChoice}
        onPress={onPress}
        onWrongChoice={onWrongChoice}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
        levelThemeLabel={
          activity?.levelConfig?.themeLabel ||
          track?.levels?.[Math.max(0, Number(level || 1) - 1)]?.themeLabel ||
          "Today Mission"
        }
        track={track}
      />
    );
  }

  if (isMathLesson) {
    return (
      <MathLessonGameplayScreen
        key={`today-math-lesson-${currentChallenge.id}`}
        currentChallenge={currentChallenge}
        failedChoiceId={failedChoiceId}
        wrongAttempts={wrongAttempts}
        lessonLabel={activity?.levelConfig?.label}
        level={level}
        onBack={onBack}
        onCorrectChoice={onCorrectChoice}
        onPress={onPress}
        onWrongChoice={onWrongChoice}
        setSize={activity?.levelConfig?.setSize || 10}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
      />
    );
  }

  if (isLearningGame) {
    return (
      <LearningGameScreen
        key={`today-learning-game-${currentChallenge.id}`}
        currentChallenge={currentChallenge}
        failedChoiceId={failedChoiceId}
        wrongAttempts={wrongAttempts}
        level={level}
        levelThemeLabel={activity?.levelConfig?.themeLabel || "Today Mission"}
        onCorrectChoice={onCorrectChoice}
        onPress={onPress}
        onWrongChoice={onWrongChoice}
      />
    );
  }

  if (spellingModes.has(mode)) {
    return (
      <SpellingGameplayScreen
        key={`today-spelling-${currentChallenge.id}`}
        currentChallenge={currentChallenge}
        failedChoiceId={failedChoiceId}
        wrongAttempts={wrongAttempts}
        level={level}
        levelThemeLabel={activity?.levelConfig?.themeLabel || "Today Mission"}
        onBack={onBack}
        onCorrectChoice={onCorrectChoice}
        onPress={onPress}
        onWrongChoice={onWrongChoice}
        stepIndex={stepIndex}
        totalSteps={totalSteps}
      />
    );
  }

  return (
    <GameplayScreen
      key={`today-gameplay-${currentChallenge.id}`}
      currentChallenge={{
        ...currentChallenge,
        subjectId,
        subjectName: activity?.subjectName || currentChallenge.subjectName,
        subjectIcon: activity?.subjectIcon || currentChallenge.subjectIcon,
      }}
      subjectId={subjectId}
      failedChoiceId={failedChoiceId}
      level={level}
      levelThemeLabel={activity?.levelConfig?.themeLabel || "Today Mission"}
      onBack={onBack}
      onCorrectChoice={onCorrectChoice}
      onPress={onPress}
      onWrongChoice={onWrongChoice}
      stepIndex={stepIndex}
      totalSteps={totalSteps}
    />
  );
}
