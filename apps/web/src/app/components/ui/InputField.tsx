"use client";

import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function InputField({ label, error, ...props }: Props) {
  return (
    <label className="input-field">
      <span>{label}</span>
      <input
        className="input-surface"
        {...props}
      />
      {error && <span className="input-error">{error}</span>}
    </label>
  );
}
