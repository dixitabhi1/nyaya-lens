import { BrandMark } from "@/components/BrandMark";

export function LoadingState({ message = "Processing your request..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="animate-pulse-soft mb-4">
        <BrandMark showText={false} markClassName="h-12 w-12" imageClassName="h-6 w-6" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
