import { forwardRef } from "react";
import { cn } from "../../lib/cn";

export const Input = forwardRef(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-10 w-full rounded-xl border border-slate-200 bg-white/90 px-3.5 py-2 text-sm text-[#023047]",
      "placeholder:text-slate-400 transition-all duration-150",
      "hover:border-[#8ecae6]",
      "focus:outline-none focus:ring-2 focus:ring-[#219ebc]/40 focus:border-[#219ebc] focus:bg-white",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";