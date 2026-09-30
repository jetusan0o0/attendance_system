import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import { cn } from "../../lib/cn";
import { forwardRef } from "react";
import { Button } from "./Button";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

export const AlertDialogContent = forwardRef(({ className, children, ...props }, ref) => (
  <AlertDialogPrimitive.Portal>
    <AlertDialogPrimitive.Overlay className="fixed inset-0 z-40 bg-slate-900/50" />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2",
        "rounded-lg bg-white p-6 shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </AlertDialogPrimitive.Content>
  </AlertDialogPrimitive.Portal>
));
AlertDialogContent.displayName = "AlertDialogContent";

export function AlertDialogHeader({ className, ...props }) {
  return <div className={cn("mb-4", className)} {...props} />;
}

export function AlertDialogFooter({ className, ...props }) {
  return <div className={cn("flex justify-end gap-2 mt-6", className)} {...props} />;
}

export const AlertDialogTitle = forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

export const AlertDialogDescription = forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-slate-500 mt-1", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

export function AlertDialogAction({ className, children, ...props }) {
  return (
    <AlertDialogPrimitive.Action asChild>
      <Button variant="danger" className={className} {...props}>
        {children}
      </Button>
    </AlertDialogPrimitive.Action>
  );
}

export function AlertDialogCancel({ className, children, ...props }) {
  return (
    <AlertDialogPrimitive.Cancel asChild>
      <Button variant="outline" className={className} {...props}>
        {children}
      </Button>
    </AlertDialogPrimitive.Cancel>
  );
}