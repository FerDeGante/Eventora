"use client";

export interface EventoraButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function EventoraButton({ 
  children, 
  onClick, 
  variant = "primary",
  className = "",
  disabled = false,
  type = "button"
}: EventoraButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center
    px-6 py-3.5
    rounded-full
    font-medium text-[15px] leading-tight
    transition-all duration-300 ease-out
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
    active:scale-95
    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
  `;
  
  const variantStyles = variant === "primary" 
    ? `bg-[#1A73E8] hover:bg-[#1557B0] 
       text-white
       shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)]
       hover:shadow-[0_3px_6px_rgba(0,0,0,0.16),0_3px_6px_rgba(0,0,0,0.23)]`
    : `bg-transparent hover:bg-black/5 dark:hover:bg-white/10
       text-[#1A73E8] dark:text-[#8AB4F8]
       border border-[#DADCE0] dark:border-[#5F6368]`;
  
  return (
    <button 
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      {children}
    </button>
  );
}
