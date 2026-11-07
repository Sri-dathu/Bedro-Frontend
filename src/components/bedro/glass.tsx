import { useId, type ComponentType, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/** Shared motion tokens — use these everywhere for consistent timing. */
export const EASE = [0.22, 1, 0.36, 1] as const;
export const SPRING = { type: "spring", stiffness: 420, damping: 36, mass: 0.8 } as const;

export type Segment<T extends string> = { value: T; label: string; icon?: ComponentType<{ className?: string }> };

export function GlassSegmentedControl<T extends string>({
  segments, value, onChange, ariaLabel, className, size = "md",
}: { segments: Segment<T>[]; value: T; onChange: (v: T) => void; ariaLabel: string; className?: string; size?: "sm" | "md" }) {
  const id = useId();
  return (
    <div role="tablist" aria-label={ariaLabel}
      className={cn("glass-capsule inline-flex max-w-full gap-1 overflow-x-auto rounded-full p-1 [scrollbar-width:none]", className)}>
      {segments.map(({ value: v, label, icon: Icon }) => {
        const active = v === value;
        return (
          <motion.button key={v} type="button" role="tab" aria-selected={active} onClick={() => onChange(v)}
            whileTap={{ scale: 0.96 }}
            className={cn(
              "relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full font-semibold outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring",
              size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
              active ? "text-accent-foreground" : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
            )}>
            {active && <motion.span layoutId={`seg-${id}`} transition={SPRING} className="glass-segment-active absolute inset-0 rounded-full" />}
            {Icon && <Icon className="relative size-4" />}
            <span className="relative">{label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}

type BtnProps = Omit<HTMLMotionProps<"button">, "children"> & {
  variant?: "primary" | "glass"; size?: "md" | "lg"; children: ReactNode;
};
export function GlassButton({ variant = "primary", size = "md", className, children, ...p }: BtnProps) {
  return (
    <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }} transition={SPRING}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        size === "lg" ? "h-12 px-6 text-sm" : "h-10 px-5 text-sm",
        variant === "primary" ? "bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow" : "glass-capsule text-foreground hover:bg-card",
        className,
      )} {...p}>
      {children}
    </motion.button>
  );
}

export function GlassIconButton({ label, className, children, ...p }: Omit<BtnProps, "variant" | "size"> & { label: string }) {
  return (
    <motion.button aria-label={label} whileTap={{ scale: 0.92 }} transition={SPRING}
      className={cn("glass-capsule grid size-10 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring", className)} {...p}>
      {children}
    </motion.button>
  );
}
