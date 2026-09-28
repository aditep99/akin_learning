import { motion } from "framer-motion";

export function LevelNode({
  level,
  caption,
  themeLabel,
  left,
  top,
  active,
  locked,
  completed,
  onSelect,
}) {
  const statusClass = locked
    ? "level-node--locked"
    : active
      ? "level-node--active"
      : completed
        ? "level-node--completed"
        : "";

  const statusText = locked ? "Lock" : completed ? "Done" : themeLabel || caption || "Go";

  return (
    <motion.button
      className={`level-node ${statusClass}`.trim()}
      style={{ left, top }}
      onClick={onSelect}
      disabled={locked}
      animate={
        active
          ? {
              y: [0, -8, 0],
              boxShadow: [
                "0 18px 32px rgba(255, 127, 80, 0.26)",
                "0 20px 42px rgba(255, 127, 80, 0.38)",
                "0 18px 32px rgba(255, 127, 80, 0.26)",
              ],
            }
          : {}
      }
      transition={{
        duration: 1.8,
        repeat: active ? Number.POSITIVE_INFINITY : 0,
      }}
      whileHover={!locked ? { scale: 1.05, rotate: -2 } : {}}
      whileTap={!locked ? { scale: 0.97 } : {}}
    >
      <span className="level-node__glow" aria-hidden="true" />
      <span className="level-node__ring" aria-hidden="true" />
      <span className="level-node__number">{level}</span>
      <span className="level-node__label">{statusText}</span>
      {caption && !locked ? <small className="level-node__caption">{caption}</small> : null}
    </motion.button>
  );
}
