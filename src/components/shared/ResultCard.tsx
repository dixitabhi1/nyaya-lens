import { ReactNode } from "react";

export function ResultCard({
  title,
  children,
  className = "",
  action,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={`bg-card border rounded-lg card-elevated animate-fade-in ${className}`}>
      <div className="px-5 py-3 border-b flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}
