import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest",
  {
    variants: {
      variant: {
        default:    "border-sand bg-surface text-ink",
        pending:    "border-amber-200 bg-amber-50 text-amber-700",
        suspicious: "border-red-200 bg-red-50 text-red-700",
        verified:   "border-green-200 bg-green-50 text-green-700",
        dismissed:  "border-gray-200 bg-gray-50 text-gray-500",
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
