import { forwardRef } from "react";
import { cn } from "../../lib/cn";

const variants = {
  brand:
    "bg-gradient-to-r from-[#219ebc] to-[#023047] text-white hover:brightness-105 active:scale-[0.98] shadow-md shadow-[#8ecae6]/25 focus:ring-[#8ecae6]",
  brandSky:
    "bg-[#8ecae6] text-[#023047] font-semibold hover:bg-[#bde4f4] active:scale-[0.98] shadow-sm shadow-[#8ecae6]/40 focus:ring-[#219ebc]",
  primary:
    "bg-[#023047] text-white hover:bg-[#0b3d59] active:scale-[0.98] shadow-sm focus:ring-[#219ebc]",
  secondary:
    "bg-[#e2f2f9] text-[#023047] hover:bg-[#bde4f4] active:scale-[0.98] focus:ring-[#8ecae6]",
  outline:
    "border border-[#8ecae6]/50 bg-white text-[#023047] hover:bg-[#f2f9fc] hover:border-[#219ebc] focus:ring-[#8ecae6]",
  ghost:
    "text-[#023047] hover:bg-[#8ecae6]/15 active:scale-[0.98] focus:ring-[#8ecae6]",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.98] focus:ring-rose-400",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] focus:ring-emerald-400",
};

const sizes = {
  xs: "h-7 px-2.5 text-xs rounded-md",
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-10 px-4 text-sm rounded-lg",
  lg: "h-11 px-6 text-sm rounded-xl font-medium",
  icon: "h-9 w-9 rounded-lg p-0",
  iconSm: "h-7 w-7 rounded-md p-0",
};

export const Button = forwardRef(
  ({ variant = "primary", size = "md", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium cursor-pointer",
        "transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  )
);
Button.displayName = "Button";