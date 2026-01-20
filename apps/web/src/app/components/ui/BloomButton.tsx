"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

interface Props extends Omit<HTMLMotionProps<"button">, "onDrag" | "onDragStart" | "onDragEnd"> {
  variant?: "solid" | "ghost";
}

export function BloomButton({ variant = "solid", children, className = "", type = "button", ...props }: Props) {
  const base = "bloom-button";
  const styles = variant === "solid" ? "bloom-button-solid" : "bloom-button-ghost";

  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${base} ${styles} ${className}`.trim()}
      {...props}
    >
      {children}
    </motion.button>
  );
}
