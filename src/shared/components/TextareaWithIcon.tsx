import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type TextareaWithIconProps = React.ComponentProps<typeof Textarea> & {
  icon: LucideIcon;
  containerClassName?: string;
  iconClassName?: string;
};

export function TextareaWithIcon({
  icon: Icon,
  containerClassName,
  iconClassName,
  className,
  ...props
}: TextareaWithIconProps) {
  return (
    <div className={cn("relative", containerClassName)}>
      <Icon
        className={cn(
          "absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none",
          iconClassName,
        )}
      />
      <Textarea className={cn("pl-11", className)} {...props} />
    </div>
  );
}
