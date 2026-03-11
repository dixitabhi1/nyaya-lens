import { ReactNode } from "react";

export function ResultCard({ title, children, className = "" }: { title: string; children: ReactNode; className?: string }) {
  return (
    <div className={`bg-card border rounded-lg card-elevated animate-fade-in ${className}`}>
      <div className="px-5 py-3 border-b">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
