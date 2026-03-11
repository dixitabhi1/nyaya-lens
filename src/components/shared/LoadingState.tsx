import { Scale } from "lucide-react";

export function LoadingState({ message = "Processing your request..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="h-12 w-12 rounded-xl gradient-accent flex items-center justify-center animate-pulse-soft mb-4">
        <Scale className="h-6 w-6 text-accent-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
