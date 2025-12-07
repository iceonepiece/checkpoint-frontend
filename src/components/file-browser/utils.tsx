"use client";

import { Icon } from "@/components/Icon";

export function LockIcon({ className }: { className?: string }) {
  return <Icon className={className}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></Icon>;
}

export function mimeBadge(type: string) {
  if (type === "folder") return { label: "Folder", dot: "bg-yellow-500" };
  if (type.startsWith("image/")) return { label: "Image", dot: "bg-blue-500" };
  if (type.startsWith("video/")) return { label: "Video", dot: "bg-purple-500" };
  if (type.includes("pdf")) return { label: "PDF", dot: "bg-red-500" };
  if (type.includes("model") || type.includes("fbx")) return { label: "Model", dot: "bg-orange-500" };
  return { label: "File", dot: "bg-gray-400" };
}

export function fmtBytes(n: number) {
  if (!n) return "-";
  const u = ["B", "KB", "MB", "GB"]; let i = 0; let x = n;
  while (x >= 1024 && i < u.length - 1) { x /= 1024; i++; }
  return `${x.toFixed(x < 10 && i > 0 ? 1 : 0)} ${u[i]}`;
}

export function Kebab() {
  return (
    <Icon className="size-4 text-gray-400">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </Icon>
  );
}

export function CustomCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onChange(); }} 
      className="group cursor-pointer relative size-5 grid place-items-center"
    >
       <div className={`size-6 rounded-md border transition-all duration-200 flex items-center justify-center ${
         checked ? "bg-blue-600 border-blue-600" : "bg-card border-default group-hover:border-gray-400"
       }`}>
         <Icon className={`size-3 text-white transition-transform duration-200 ${checked ? "scale-100" : "scale-0"}`} strokeWidth="3"><path d="M5 13l4 4L19 7" /></Icon>
       </div>
    </div>
  );
}