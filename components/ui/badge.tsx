import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium uppercase tracking-wider",
  {
    variants: {
      variant: {
        default: "border-sand bg-sand/40 text-ink",
        pending: "border-amber-300 bg-amber-50 text-amber-800",
        suspicious: "border-oxblood/30 bg-oxblood/10 text-oxblood",
        verified: "border-forest/30 bg-forest/10 text-forest",
        dismissed: "border-muted/30 bg-muted/10 text-muted",
        outline: "border-sand bg-transparent text-ink",
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
