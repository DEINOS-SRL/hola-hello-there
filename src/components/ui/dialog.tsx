import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;

const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = DialogPrimitive.Portal;

const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px]",
      "data-[state=open]:animate-dialog-overlay-in data-[state=closed]:animate-dialog-overlay-out",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const dialogContentVariants = cva(
  // Base styles
  cn(
    "fixed z-50 flex flex-col border bg-background shadow-xl",
    // Mobile: full width con bordes redondeados arriba, desde abajo
    "inset-x-0 bottom-0 max-h-[90vh] rounded-t-2xl p-4 pt-6",
    "data-[state=open]:animate-in data-[state=closed]:animate-out",
    "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
    "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    "duration-300",
    // Desktop: centrado normal con animaciones suaves
    "sm:inset-auto sm:left-[50%] sm:top-[50%] sm:bottom-auto sm:right-auto",
    "sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-xl sm:p-6",
    "sm:max-h-[90vh] sm:w-full",
    "sm:data-[state=open]:animate-dialog-content-show sm:data-[state=closed]:animate-dialog-content-hide",
    "sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=closed]:slide-out-to-bottom-0",
  ),
  {
    variants: {
      size: {
        sm: "sm:max-w-sm",
        md: "sm:max-w-md",
        default: "sm:max-w-lg",
        lg: "sm:max-w-[720px]",
        xl: "sm:max-w-[900px]",
        "2xl": "sm:max-w-[1100px]",
        full: "sm:max-w-[95vw] sm:max-h-[95vh]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, children, size, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(dialogContentVariants({ size }), className)}
      {...props}
    >
      {/* Handle visual para mobile */}
      <div className="absolute left-1/2 top-2 -translate-x-1/2 h-1 w-10 rounded-full bg-muted sm:hidden" />
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 z-10 rounded-full p-1.5 opacity-70 ring-offset-background transition-all hover:opacity-100 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
        <X className="h-4 w-4" />
        <span className="sr-only">Cerrar</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      "pb-4 mb-4 border-b border-border/50",
      className
    )} 
    {...props} 
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn(
      "flex-1 overflow-y-auto",
      className
    )} 
    {...props} 
  />
);
DialogBody.displayName = "DialogBody";

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3",
      "pt-4 mt-4 border-t border-border/50",
      className
    )} 
    {...props} 
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description 
    ref={ref} 
    className={cn("text-sm text-muted-foreground mt-1.5", className)} 
    {...props} 
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  dialogContentVariants,
};
