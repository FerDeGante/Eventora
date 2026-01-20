// src/components/PasswordInput.tsx
import { useState } from "react";

const requirements = [
  { test: (v: string) => v.length >= 8, label: "Mínimo 8 caracteres" },
  { test: (v: string) => /[A-Z]/.test(v), label: "Al menos 1 mayúscula" },
  { test: (v: string) => /[a-z]/.test(v), label: "Al menos 1 minúscula" },
  { test: (v: string) => /\d/.test(v), label: "Al menos 1 número" },
  { test: (v: string) => /[^A-Za-z0-9]/.test(v), label: "Al menos 1 carácter especial" },
];

function passwordStrength(password: string) {
  let score = requirements.reduce((acc, req) => acc + (req.test(password) ? 1 : 0), 0);
  return Math.round((score / requirements.length) * 100);
}

export default function PasswordInput({
  value,
  onChange,
  id = "password",
  name = "password",
  placeholder = "Contraseña",
  autoFocus = false
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const strength = passwordStrength(value);
  const color =
    strength < 40 ? "#d9534f" : strength < 80 ? "#f0ad4e" : "#60bac2";

  return (
    <div>
      <input
        type="password"
        id={id}
        name={name}
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{ borderColor: color }}
        autoFocus={autoFocus}
        required
        autoComplete="new-password"
      />
      <div className="password-strength-bar" style={{
        height: 8,
        background: "#eee",
        borderRadius: 6,
        margin: "8px 0 6px",
        overflow: "hidden"
      }}>
        <div
          style={{
            width: `${strength}%`,
            height: "100%",
            background: color,
            transition: "width 0.3s"
          }}
        />
      </div>
      <ul className="password-checklist" style={{
        paddingLeft: 20,
        margin: "5px 0 0",
        fontSize: 13,
        color: "#414143"
      }}>
        {requirements.map((req, i) => (
          <li key={i}
            style={{
              color: req.test(value)
                ? "#60bac2"
                : "#bbb",
              listStyle: "none",
              marginBottom: 2,
              display: "flex",
              alignItems: "center"
            }}>
            <span
              style={{
                display: "inline-block",
                width: 16,
                marginRight: 6,
                fontWeight: "bold"
              }}>
              {req.test(value) ? "✓" : "•"}
            </span>
            {req.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
