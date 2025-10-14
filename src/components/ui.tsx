export function Card({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-lg border border-[#30363d] bg-[#161b22] ${className}`} {...props} />;
}
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold text-gray-200">{children}</h3>;
}
export function KeyRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1">
      <div className="text-xs text-gray-400">{k}</div>
      <div className="text-sm text-gray-200">{v}</div>
    </div>
  );
}