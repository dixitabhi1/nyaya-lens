import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { ReactNode } from "react";

type Variant = "warning" | "info" | "success" | "error";

const config: Record<Variant, { icon: typeof Info; bg: string; border: string; text: string }> = {
  warning: { icon: AlertTriangle, bg: "bg-warning/10", border: "border-warning/30", text: "text-warning" },
  info: { icon: Info, bg: "bg-info/10", border: "border-info/30", text: "text-info" },
  success: { icon: CheckCircle, bg: "bg-success/10", border: "border-success/30", text: "text-success" },
  error: { icon: XCircle, bg: "bg-destructive/10", border: "border-destructive/30", text: "text-destructive" },
};

export function NoticeBanner({ variant = "info", children }: { variant?: Variant; children: ReactNode }) {
  const c = config[variant];
  const Icon = c.icon;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${c.bg} ${c.border} animate-fade-in`}>
      <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${c.text}`} />
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}
