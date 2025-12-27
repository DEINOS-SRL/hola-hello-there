import * as React from "react";
import type { LucideIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SelectWithIconProps = React.ComponentProps<typeof Select> & {
  icon: LucideIcon;
  placeholder?: string;
  containerClassName?: string;
  iconClassName?: string;
  triggerClassName?: string;
  children: React.ReactNode;
};

export function SelectWithIcon({
  icon: Icon,
  placeholder,
  containerClassName,
  iconClassName,
  triggerClassName,
  children,
  ...props
}: SelectWithIconProps) {
  return (
    <Select {...props}>
      <div className={cn("relative", containerClassName)}>
        <Icon
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10",
            iconClassName,
          )}
        />
        <SelectTrigger className={cn("pl-11", triggerClassName)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
      </div>
      <SelectContent>
        {children}
      </SelectContent>
    </Select>
  );
}
