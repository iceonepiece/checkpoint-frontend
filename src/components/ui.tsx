import React from "react";

// --- Card Component ---
export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-lg surface-card ${className}`} {...props} />;
}

// --- Button Component ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "danger" | "ghost";
  size?: "sm" | "md" | "icon";
}

export function Button({ 
  className = "", 
  variant = "default", 
  size = "md", 
  ...props 
}: ButtonProps) {
  
  const variantClass = {
    default: "btn-default",
    primary: "btn-primary",
    danger: "btn-danger",
    ghost: "btn-ghost",
  }[variant];

  const sizeClass = {
    sm: "h-8 px-2 text-xs",
    md: "h-9 px-3 text-sm",
    icon: "h-8 w-8 p-0", 
  }[size];

  return (
    <button 
      className={`btn ${variantClass} ${sizeClass} ${className}`} 
      {...props} 
    />
  );
}

// --- Typography & Layout ---
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-gray-200 mb-2">{children}</h3>;
}

export function KeyRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-b border-default/50 last:border-0">
      <div className="text-xs text-gray-400">{k}</div>
      <div className="text-sm text-gray-200 font-medium">{v}</div>
    </div>
  );
}

// --- NEW: Reusable Loading Spinner ---
export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-gray-500 gap-3">
      <div className="size-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-sm font-medium animate-pulse">{text}</span>
    </div>
  );
}