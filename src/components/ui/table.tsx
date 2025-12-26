import * as React from "react";

import { cn } from "@/lib/utils";

// Wrapper responsivo para tablas
const TableWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { mobileCards?: boolean }
>(({ className, mobileCards, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative w-full",
      // En mobile, scroll horizontal con indicador visual
      "overflow-x-auto scrollbar-thin",
      // Gradiente sutil para indicar scroll en mobile
      "md:overflow-visible",
      className
    )}
    {...props}
  >
    {children}
  </div>
));
TableWrapper.displayName = "TableWrapper";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-x-auto">
      <table 
        ref={ref} 
        className={cn(
          "w-full caption-bottom text-sm",
          // En mobile, asegurar que la tabla tenga un ancho mínimo
          "min-w-[640px] md:min-w-0",
          className
        )} 
        {...props} 
      />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead 
      ref={ref} 
      className={cn(
        "[&_tr]:border-b",
        // Header sticky en mobile para mejor navegación
        "sticky top-0 z-10 bg-background",
        className
      )} 
      {...props} 
    />
  ),
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
  ),
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tfoot ref={ref} className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />
  ),
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b transition-colors data-[state=selected]:bg-muted hover:bg-muted/50",
        // En mobile, filas más altas para mejor touch
        "min-h-[56px]",
        className
      )}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
        // En mobile, texto más pequeño y padding reducido
        "text-xs md:text-sm",
        "px-3 md:px-4",
        "whitespace-nowrap",
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td 
      ref={ref} 
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0",
        // En mobile, padding y texto ajustados
        "p-3 md:p-4",
        "text-sm",
        className
      )} 
      {...props} 
    />
  ),
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ className, ...props }, ref) => (
    <caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props} />
  ),
);
TableCaption.displayName = "TableCaption";

// Componente de card para vista mobile alternativa
interface MobileCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const MobileCard = React.forwardRef<HTMLDivElement, MobileCardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card p-4 shadow-sm",
        "md:hidden", // Solo visible en mobile
        className
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
MobileCard.displayName = "MobileCard";

const MobileCardRow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { label?: string }
>(({ className, label, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex justify-between items-center py-2 border-b border-border/50 last:border-0", className)}
    {...props}
  >
    {label && <span className="text-xs font-medium text-muted-foreground">{label}</span>}
    <span className="text-sm text-foreground">{children}</span>
  </div>
));
MobileCardRow.displayName = "MobileCardRow";

export { 
  Table, 
  TableWrapper,
  TableHeader, 
  TableBody, 
  TableFooter, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableCaption,
  MobileCard,
  MobileCardRow,
};
