import { motion, useReducedMotion } from "framer-motion";

const SHELL_CLASSES = {
  FocusSessionShell: "screen-shell--focus-session",
  LearningShell: "screen-shell--learning",
  ParentToolShell: "screen-shell--parent-tool",
};

export function ScreenShell({
  children,
  className = "",
  variant = "LearningShell",
}) {
  const shouldReduceMotion = useReducedMotion();
  const variantClass = SHELL_CLASSES[variant] || SHELL_CLASSES.LearningShell;

  return (
    <motion.main
      className={`screen-shell ${variantClass} ${className}`.trim()}
      data-shell-variant={variant}
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -18 }}
      transition={{ duration: shouldReduceMotion ? 0.1 : 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.main>
  );
}
