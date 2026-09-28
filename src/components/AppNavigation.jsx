import { useEffect, useRef, useState } from "react";

const APP_NAV_ITEMS = [
  { id: "today", label: "Today", icon: "✦" },
  { id: "worlds", label: "Worlds", icon: "⌂" },
  { id: "arcade", label: "Arcade", icon: "🎮" },
  { id: "rewards", label: "Rewards", icon: "★" },
];

export { APP_NAV_ITEMS };

const DESKTOP_MEDIA_QUERY = "(min-width: 761px)";
const APP_NAVIGATION_MENU_ID = "app-navigation-menu";

function getInitialWideScreen() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(DESKTOP_MEDIA_QUERY).matches
  );
}

export function AppNavigation({
  activeItem = "",
  collapsible = false,
  layout = "top",
  onNavigate,
  onPress,
}) {
  const navigationRef = useRef(null);
  const toggleRef = useRef(null);
  const [isWideScreen, setIsWideScreen] = useState(getInitialWideScreen);
  const isSidebarLayout = layout === "sidebar";
  const [isExpanded, setIsExpanded] = useState(
    !collapsible || isSidebarLayout,
  );
  const activeNavigationItem =
    APP_NAV_ITEMS.find((item) => item.id === activeItem) || APP_NAV_ITEMS[0];
  const canCollapse = collapsible && !isSidebarLayout && isWideScreen;
  const menuIsExpanded = !canCollapse || isExpanded;

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }

    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const handleMediaChange = (event) => {
      setIsWideScreen(event.matches);
    };

    setIsWideScreen(mediaQuery.matches);
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleMediaChange);
    } else {
      mediaQuery.addListener?.(handleMediaChange);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", handleMediaChange);
      } else {
        mediaQuery.removeListener?.(handleMediaChange);
      }
    };
  }, []);

  useEffect(() => {
    setIsExpanded(!collapsible || isSidebarLayout || !isWideScreen);
  }, [activeItem, collapsible, isSidebarLayout, isWideScreen]);

  useEffect(() => {
    if (!canCollapse || !menuIsExpanded) {
      return undefined;
    }

    const handlePointerDown = (event) => {
      if (!navigationRef.current?.contains(event.target)) {
        setIsExpanded(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") {
        return;
      }

      setIsExpanded(false);
      window.setTimeout(() => toggleRef.current?.focus(), 0);
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [canCollapse, menuIsExpanded]);

  const toggleMenu = () => {
    onPress?.();
    if (canCollapse) {
      setIsExpanded((currentValue) => !currentValue);
    }
  };

  const navigate = (itemId) => {
    onPress?.();
    setIsExpanded(false);
    onNavigate?.(itemId);
  };

  const navigationClassName = [
    "app-navigation",
    isSidebarLayout ? "app-navigation--sidebar" : "",
    collapsible ? "app-navigation--collapsible" : "",
    collapsible && canCollapse && menuIsExpanded
      ? "is-expanded"
      : collapsible && canCollapse
        ? "is-collapsed"
        : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <nav
      ref={navigationRef}
      className={navigationClassName}
      aria-label="Main navigation"
    >
      <div className="app-navigation__inner">
        {collapsible && !isSidebarLayout ? (
          <button
            ref={toggleRef}
            type="button"
            className="app-navigation__toggle"
            aria-controls={APP_NAVIGATION_MENU_ID}
            aria-expanded={menuIsExpanded}
            aria-label={
              menuIsExpanded ? "Collapse main navigation" : "Open main navigation"
            }
            onClick={toggleMenu}
          >
            <span className="app-navigation__toggle-icon" aria-hidden="true">
              {menuIsExpanded ? "×" : "☰"}
            </span>
            <span>Menu</span>
          </button>
        ) : null}

        <div className="app-navigation__brand" aria-label="AkinLearning">
          <span className="app-navigation__brand-mark" aria-hidden="true">A</span>
          <span>AkinLearning</span>
        </div>

        {collapsible && !isSidebarLayout ? (
          <div
            className="app-navigation__current"
            aria-label={`Current section: ${activeNavigationItem.label}`}
          >
            <span className="app-navigation__icon" aria-hidden="true">
              {activeNavigationItem.icon}
            </span>
            <span>{activeNavigationItem.label}</span>
          </div>
        ) : null}

        <div
          id={APP_NAVIGATION_MENU_ID}
          className="app-navigation__items"
          aria-hidden={canCollapse && !menuIsExpanded ? "true" : undefined}
        >
          {APP_NAV_ITEMS.map((item) => {
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                type="button"
                className={`app-navigation__item ${isActive ? "is-active" : ""}`.trim()}
                aria-current={isActive ? "page" : undefined}
                aria-label={item.label}
                onClick={() => navigate(item.id)}
              >
                <span className="app-navigation__icon" aria-hidden="true">
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
