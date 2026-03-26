import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  markClassName?: string;
  imageClassName?: string;
  showText?: boolean;
  titleClassName?: string;
  subtitle?: string;
  subtitleClassName?: string;
};

export function BrandMark({
  className,
  markClassName,
  imageClassName,
  showText = true,
  titleClassName,
  subtitle,
  subtitleClassName,
}: BrandMarkProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className={cn("shrink-0", markClassName)}>
        <img src="/nyayasetu-mark.svg" alt="NyayaSetu" className={cn("h-11 w-11", imageClassName)} />
      </div>
      {showText ? (
        <div>
          <p className={cn("font-display text-xl font-bold leading-none tracking-tight text-slate-950", titleClassName)}>
            NyayaSetu
          </p>
          {subtitle ? (
            <p className={cn("text-xs uppercase tracking-[0.32em] text-slate-500", subtitleClassName)}>{subtitle}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
