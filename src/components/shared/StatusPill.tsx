export function StatusPill({ label, variant = "default" }: { label: string; variant?: "default" | "success" | "warning" | "error" }) {
  const colors = {
    default: "bg-secondary text-secondary-foreground",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    error: "bg-destructive/15 text-destructive",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[variant]}`}>
      {label}
    </span>
  );
}
