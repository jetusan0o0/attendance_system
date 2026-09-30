import { cn } from "../../lib/cn";

const variants = {
  default: "bg-slate-100 text-slate-700 border-slate-200",
  brand: "bg-[#e2f2f9] text-[#023047] border-[#8ecae6]/50 font-semibold",
  brandSky: "bg-[#8ecae6]/20 text-[#0a637d] border-[#8ecae6] font-semibold",
  present: "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold",
  late: "bg-amber-50 text-amber-800 border-amber-200 font-semibold",
  absent: "bg-rose-50 text-rose-700 border-rose-200 font-semibold",
  excused: "bg-purple-50 text-purple-700 border-purple-200 font-semibold",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
};

export function Badge({ variant = "default", className, ...props }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}