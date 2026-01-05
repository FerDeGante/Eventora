"use client";

import { motion } from "framer-motion";
import type { ButtonHTMLAttributes } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "ghost";
}

export function EventoraButton({ variant = "solid", children, className = "", type = "button", ...props }: Props) {
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
