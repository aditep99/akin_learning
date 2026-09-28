import { motion, useReducedMotion } from "framer-motion";

export function ActionButton({
  ariaLabel,
  ariaPressed,
  busy = false,
  children,
  className = "",
  color = "orange",
  disabled = false,
  onClick,
  icon,
  title,
  wide = false,
  type = "button",
}) {
  const shouldReduceMotion = useReducedMotion();
  const isDisabled = disabled || busy;

  return (
    <motion.button
      whileHover={
        !isDisabled && !shouldReduceMotion ? { y: -2 } : undefined
      }
      whileTap={!isDisabled && !shouldReduceMotion ? { scale: 0.98 } : undefined}
      className={`action-button action-button--${color} ${wide ? "action-button--wide" : ""} ${className}`.trim()}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-busy={busy || undefined}
      title={title}
      data-busy={busy ? "true" : undefined}
    >
      {icon ? <span className="action-button__icon">{icon}</span> : null}
      <span className="action-button__label">{children}</span>
      {busy ? <span className="action-button__spinner" aria-hidden="true" /> : null}
    </motion.button>
  );
}
