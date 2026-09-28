import { motion } from "framer-motion";

export function HandGuide() {
  return (
    <motion.div
      className="hand-guide"
      initial={{ opacity: 0, y: 24 }}
      animate={{
        opacity: [0, 1, 1, 0],
        x: [0, 18, 0],
        y: [24, 0, 8, -4],
      }}
      transition={{ duration: 3, ease: "easeInOut" }}
    >
      <span className="hand-guide__emoji" role="img" aria-label="Tap guide">
        👆
      </span>
      <p>Find the match!</p>
    </motion.div>
  );
}
