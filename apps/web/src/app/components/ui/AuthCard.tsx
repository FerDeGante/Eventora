"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function AuthCard({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <motion.section
      className="glass-panel max-w-md w-full p-8 flex flex-col gap-6 auth-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div>
        <p className="auth-eyebrow">Eventora</p>
        <h1 className="auth-title">{title}</h1>
        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
      </div>
      {children}
    </motion.section>
  );
}
