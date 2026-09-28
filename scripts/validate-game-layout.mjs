import { readFile } from "node:fs/promises";
import { createServer } from "vite";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const GAMEPLAY_MODES = [
  "picture-pick",
  "sound-pick",
  "word-to-picture",
  "odd-one-out",
  "vocab-choice",
  "sort-two-baskets",
  "hotspot-place",
];

const GAME_SCREENS = [
  "GameplayScreen.jsx",
  "LearningGameScreen.jsx",
  "SpellingGameplayScreen.jsx",
  "MathGameplayScreen.jsx",
  "MathGeniusGameplayScreen.jsx",
  "MathLessonGameplayScreen.jsx",
];

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
});

try {
  const content = await server.ssrLoadModule("/src/data/contentLibrary.js");
  const gameplaySource = await readFile(
    new URL("../src/screens/GameplayScreen.jsx", import.meta.url),
    "utf8",
  );
  const cssSource = await readFile(new URL("../src/index.css", import.meta.url), "utf8");

  for (const mode of GAMEPLAY_MODES) {
    assert(
      gameplaySource.includes(`"${mode}"`),
      `GameplayScreen is missing renderer coverage for ${mode}.`,
    );
  }

  assert(
    gameplaySource.includes("game-card--${currentChallenge.mode}"),
    "Gameplay cards need a mode class for layout targeting.",
  );
  assert(
    gameplaySource.includes("activity-board--${currentChallenge.mode}"),
    "Gameplay boards need a mode class for layout targeting.",
  );
  assert(
    gameplaySource.includes("hotspot-stage__frame"),
    "Hotspot pins must be positioned inside the image map, not its decorative frame.",
  );
  assert(
    gameplaySource.includes('data-game-layout="hotspot"'),
    "Hotspot board is missing its layout test hook.",
  );
  assert(
    gameplaySource.includes("hotspot-${hotspot.id}"),
    "A wrong hotspot must identify the individual point that was selected.",
  );

  for (const screenName of GAME_SCREENS) {
    const screenSource = await readFile(
      new URL(`../src/screens/${screenName}`, import.meta.url),
      "utf8",
    );
    assert(
      screenSource.includes("screen-shell--gameplay"),
      `${screenName} is not inside the shared gameplay shell.`,
    );
  }

  for (const cssContract of [
    "Gameplay fit contract",
    "grid-template-rows: minmax(0, 1fr)",
    "overflow-x: clip",
    ".activity-board--hotspot-place",
    ".hotspot-stage__frame",
    "aspect-ratio: 2 / 3",
    "@media (max-width: 760px)",
    "prefers-reduced-motion",
  ]) {
    assert(cssSource.includes(cssContract), `Missing gameplay layout contract: ${cssContract}.`);
  }

  const bodyImage = await readFile(
    new URL("../src/assets/characters/akin-body-learning-transparent.png", import.meta.url),
  );
  const bodyImageWidth = bodyImage.readUInt32BE(16);
  const bodyImageHeight = bodyImage.readUInt32BE(20);
  assert(
    bodyImageWidth * 3 === bodyImageHeight * 2,
    "Body image ratio changed; update the hotspot layout ratio before release.",
  );

  const bodySubject = content.defaultLibrary.find((subject) => subject.id === "body");
  assert(bodySubject, "Body Lab subject is missing.");
  const bodyLevels = content.buildSubjectLevels(bodySubject);
  const hotspotChallenges = bodyLevels.flatMap((level) =>
    (level.exercises || []).filter((challenge) => challenge.mode === "hotspot-place"),
  );

  assert(hotspotChallenges.length > 0, "Body Lab has no hotspot challenge to test.");
  for (const challenge of hotspotChallenges) {
    assert(challenge.bodyImage, `${challenge.id} has no body image.`);
    assert(Array.isArray(challenge.hotspots) && challenge.hotspots.length >= 3, `${challenge.id} needs at least three hotspots.`);
    assert(
      challenge.hotspots.filter((hotspot) => hotspot.id === challenge.targetHotspotId).length === 1,
      `${challenge.id} needs exactly one target hotspot.`,
    );
    challenge.hotspots.forEach((hotspot) => {
      assert(
        Number.isFinite(hotspot.x) && hotspot.x >= 0 && hotspot.x <= 100,
        `${challenge.id}/${hotspot.id} has an invalid horizontal coordinate.`,
      );
      assert(
        Number.isFinite(hotspot.y) && hotspot.y >= 0 && hotspot.y <= 100,
        `${challenge.id}/${hotspot.id} has an invalid vertical coordinate.`,
      );
    });
  }

  console.log(
    JSON.stringify(
      {
        gameScreens: GAME_SCREENS.length,
        rendererModes: GAMEPLAY_MODES.length,
        hotspotChallenges: hotspotChallenges.length,
        bodyImageRatio: `${bodyImageWidth}:${bodyImageHeight}`,
        status: "ok",
      },
      null,
      2,
    ),
  );
} finally {
  await server.close();
}
