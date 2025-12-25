import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ThemeToggleProps {
  collapsed?: boolean;
  showLabel?: boolean;
}

export function ThemeToggle({ collapsed = false, showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const button = (
    <Button
      variant="ghost"
      size={showLabel ? "sm" : "icon"}
      onClick={toggleTheme}
      className={showLabel ? "w-full justify-start gap-2" : "h-8 w-8"}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
      {showLabel && (
        <span>{resolvedTheme === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>
      )}
    </Button>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">
          {resolvedTheme === "dark" ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
