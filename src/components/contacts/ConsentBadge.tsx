"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConsentBadgeProps {
  consentGiven: boolean;
  className?: string;
}

export function ConsentBadge({ consentGiven, className }: ConsentBadgeProps) {
  if (consentGiven) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
          "bg-green-100 text-green-800 border border-green-200",
          className
        )}
      >
        <CheckCircle2 className="w-3 h-3" />
        Consentimiento
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        "bg-red-100 text-red-800 border border-red-200",
        className
      )}
    >
      <XCircle className="w-3 h-3" />
      Sin consentimiento
    </span>
  );
}
