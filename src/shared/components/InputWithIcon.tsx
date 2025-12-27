import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type InputWithIconProps = React.ComponentProps<typeof Input> & {
  icon: LucideIcon;
  containerClassName?: string;
  iconClassName?: string;
};

export function InputWithIcon({
  icon: Icon,
  containerClassName,
  iconClassName,
  className,
  ...props
}: InputWithIconProps) {
  return (
    <div className={cn("relative", containerClassName)}>
      <Icon
        className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none",
          iconClassName,
        )}
      />
      <Input className={cn("pl-11", className)} {...props} />
    </div>
  );
}
