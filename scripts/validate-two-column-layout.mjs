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
  const navigationSource = await readFile(
    new URL("../src/components/AppNavigation.jsx", import.meta.url),
    "utf8",
  );
  const appSource = await readFile(new URL("../src/App.jsx", import.meta.url), "utf8");
  const cssSource = await readFile(new URL("../src/index.css", import.meta.url), "utf8");

  assert(
    navigation.APP_NAV_ITEMS.map((item) => item.id).join(",") ===
      "today,worlds,arcade,rewards",
    "Activity sidebar must keep all four navigation items.",
  );
  assert(
    navigationSource.includes('layout = "top"'),
    "AppNavigation must expose the layout prop.",
  );
  assert(
    navigationSource.includes('layout === "sidebar"'),
    "AppNavigation must support sidebar layout mode.",
  );
  assert(
    navigationSource.includes("app-navigation--sidebar"),
    "Sidebar navigation class is missing.",
  );
  assert(
    navigationSource.includes("!isSidebarLayout"),
    "Sidebar layout must hide the collapsible trigger/current-section controls.",
  );
  assert(
    appSource.includes("app-shell--activity-layout"),
    "App shell activity layout class is missing.",
  );
  assert(
    appSource.includes('layout={isActivityLayout ? "sidebar" : "top"}'),
    "App must route activity screens to the sidebar navigation layout.",
  );

  for (const cssContract of [
    ".app-shell--activity-layout",
    "grid-template-columns: minmax(190px, 248px) minmax(0, 1fr)",
    ".app-navigation--sidebar",
    "grid-column: 2",
    ".choice-card__media",
    "object-fit: contain",
    "@media (min-width: 761px)",
    "@media (max-width: 760px)",
    "@media (prefers-reduced-motion: reduce)",
  ]) {
    assert(cssSource.includes(cssContract), `Missing two-column UI contract: ${cssContract}.`);
  }

  assert(
    cssSource.includes(".app-shell--activity-layout .sound-bubble-choice__image"),
    "Sound Bubble answer artwork sizing is missing.",
  );
  assert(
    cssSource.includes(".screen-shell--math-lessons") &&
      cssSource.includes(".math-lesson-scene-choice-card__thumb"),
    "Math answer artwork sizing is missing.",
  );
  assert(
    !cssSource.includes(".app-shell--activity-layout .hotspot-stage__image"),
    "Two-column artwork rules must not override Body Hotspot image geometry.",
  );

  console.log(
    JSON.stringify(
      {
        navigationItems: navigation.APP_NAV_ITEMS.length,
        activityLayout: "sidebar + gameplay",
        responsiveBreakpoints: ["761px desktop/tablet", "760px mobile"],
        status: "ok",
      },
      null,
      2,
    ),
  );
} finally {
  await server.close();
}
