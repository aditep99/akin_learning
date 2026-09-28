export const mathExerciseThemes = [
  {
    id: "underwater",
    label: "Underwater World",
    sceneLabel: "Bubble Bay",
    buddyIds: ["boat-bubble", "sub-splash"],
    palette: ["#0878d8", "#18c7de", "#8ff2e0"],
    effects: ["bubble", "fish", "pearl"],
  },
  {
    id: "space",
    label: "Space Station",
    sceneLabel: "Number Orbit",
    buddyIds: ["astro-aki", "rocket-rio"],
    palette: ["#342b86", "#6d62e8", "#53d8ff"],
    effects: ["star", "planet", "comet"],
  },
  {
    id: "jungle",
    label: "Jungle Quest",
    sceneLabel: "Clever Canopy",
    buddyIds: ["dino-dot", "soldier-sprout"],
    palette: ["#247b45", "#71bf55", "#f6cf62"],
    effects: ["leaf", "vine", "treasure"],
  },
  {
    id: "castle",
    label: "Castle Arena",
    sceneLabel: "Crown Challenge",
    buddyIds: ["knight-kip", "wizard-wink"],
    palette: ["#5a4f9c", "#b26ddd", "#ffd55f"],
    effects: ["crown", "flag", "spark"],
  },
  {
    id: "robot",
    label: "Robot Lab",
    sceneLabel: "Power Circuit",
    buddyIds: ["robot-beep", "builder-bolt"],
    palette: ["#276f92", "#4bbfd0", "#ffe16a"],
    effects: ["gear", "bolt", "circuit"],
  },
];

export function getMathExerciseTheme(setNumber = 1) {
  const safeIndex =
    ((Number(setNumber) || 1) - 1) % mathExerciseThemes.length;

  return mathExerciseThemes[safeIndex] || mathExerciseThemes[0];
}
