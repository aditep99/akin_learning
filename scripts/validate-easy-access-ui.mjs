import { readFile } from "node:fs/promises";
import { createServer } from "vite";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const server = await createServer({
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
});

try {
  const navigation = await server.ssrLoadModule("/src/components/AppNavigation.jsx");
  const splash = await server.ssrLoadModule("/src/screens/SplashScreen.jsx");
  const rewards = await server.ssrLoadModule("/src/screens/RewardsScreen.jsx");
  const navigationSource = await readFile(
    new URL("../src/components/AppNavigation.jsx", import.meta.url),
    "utf8",
  );
  const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const arcadeSource = await readFile(new URL("../src/screens/ArcadeHomeScreen.jsx", import.meta.url), "utf8");
  const cssSource = await readFile(new URL("../src/index.css", import.meta.url), "utf8");

  assert(
    navigation.APP_NAV_ITEMS.map((item) => item.id).join(",") ===
      "today,worlds,arcade,rewards",
    "easy-access navigation must contain Today, Worlds, Arcade, and Rewards.",
  );
  assert(typeof rewards.RewardsScreen === "function", "RewardsScreen export is missing.");
  assert(splash.WORLD_GROUPS.length === 4, "home must expose four world groups.");

  const subjects = [
    { id: "learning-games" },
    { id: "animals" },
    { id: "body" },
    { id: "fruits-vegetables" },
    { id: "math" },
    { id: "math-genius" },
    { id: "math-lessons" },
    { id: "school-things" },
    { id: "thai-exercises", category: "exercise" },
    { id: "science-exercises", category: "exercise" },
    { id: "english-exercises", category: "exercise" },
    { id: "thai-spelling", category: "exercise" },
    { id: "english-spelling", category: "exercise" },
  ];
  const groupedIds = new Set();

  splash.WORLD_GROUPS.forEach((group) => {
    const grouped = splash.getSubjectsForWorldGroup(subjects, group.id);
    assert(grouped.length > 0, `${group.id} group has no worlds.`);
    grouped.slice(0, 3).forEach((subject) => groupedIds.add(subject.id));
  });
  assert(groupedIds.size >= 10, "home categories do not expose the available worlds.");
  assert(
    splash.getSubjectsForWorldGroup(subjects, "all").length === subjects.length,
    "Explore Worlds All filter changed the world count.",
  );

  assert(appSource.includes("akinlearning.ui-preferences.v1"), "UI preferences storage key is missing.");
  assert(appSource.includes('screen === "rewards"'), "Rewards route is missing from App.");
  assert(appSource.includes("handleOpenWorlds"), "World Explorer route is missing from App.");
  assert(arcadeSource.includes("onStart({ modeId: mode.id })"), "Arcade game cards do not start their selected mode.");
  assert(arcadeSource.includes('role="button"'), "Arcade game cards are missing keyboard access.");
  assert(appSource.includes('modeId = ""'), "Arcade mode selection is not wired into App.");
  assert(cssSource.includes(".app-navigation"), "App navigation styles are missing.");
  assert(navigationSource.includes("collapsible"), "Responsive navigation prop is missing.");
  assert(navigationSource.includes("aria-expanded"), "Navigation toggle aria-expanded is missing.");
  assert(navigationSource.includes("aria-controls"), "Navigation toggle aria-controls is missing.");
  assert(navigationSource.includes("pointerdown"), "Outside-click menu closing is missing.");
  assert(navigationSource.includes('event.key !== "Escape"'), "Escape menu closing is missing.");
  assert(cssSource.includes("app-navigation--collapsible"), "Collapsible navigation styles are missing.");
  assert(cssSource.includes("@media (min-width: 761px)"), "Desktop responsive navigation breakpoint is missing.");
  assert(cssSource.includes("@media (max-width: 760px)"), "Mobile responsive navigation breakpoint is missing.");
  assert(cssSource.includes("prefers-reduced-motion"), "Reduced-motion styles are missing.");
  assert(cssSource.includes("min-height: 48px"), "Accessible 48px targets are missing.");

  console.log("Easy-access UI validation passed: navigation, world groups, rewards route, persistence, and accessibility styles.");
} finally {
  await server.close();
}
