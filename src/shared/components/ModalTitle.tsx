import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface ModalTitleProps {
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
  iconClassName?: string;
}

export function ModalTitle({
  icon: Icon,
  children,
  className,
  iconClassName,
}: ModalTitleProps) {
  return (
    <DialogTitle className={cn("flex items-center gap-2 text-xl text-primary", className)}>
      <Icon className={cn("h-6 w-6", iconClassName)} />
      {children}
    </DialogTitle>
  );
}
