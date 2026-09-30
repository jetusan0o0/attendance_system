import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "../../lib/cn";
import { forwardRef } from "react";

export const Tabs = TabsPrimitive.Root;

export const TabsList = forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-xl bg-slate-100/90 p-1 text-slate-600 transition-all",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#219ebc]",
      "disabled:pointer-events-none disabled:opacity-50",
      "text-slate-600 hover:text-[#023047] hover:bg-white/60",
      "data-[state=active]:bg-white data-[state=active]:text-[#023047] data-[state=active]:shadow-sm data-[state=active]:font-semibold",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("focus-visible:outline-none animate-in fade-in-50 duration-200", className)}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";