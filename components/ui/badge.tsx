import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest",
  {
    variants: {
      variant: {
        default:    "border-sand bg-surface text-ink",
        pending:    "border-accent/40 bg-accent/10 text-accent",
        suspicious: "border-oxblood/40 bg-oxblood/10 text-oxblood",
        verified:   "border-forest/40 bg-forest/10 text-forest",
        dismissed:  "border-muted/30 bg-muted/10 text-muted",
        outline:    "border-sand bg-transparent text-ink",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
