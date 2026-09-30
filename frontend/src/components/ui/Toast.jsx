import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "../../lib/cn";
import { createContext, useContext, useState, useCallback, useMemo } from "react";

const ToastContext = createContext(null);

const variants = {
  default: {
    container: "border-slate-200 bg-white text-slate-800",
    icon: <Info className="h-5 w-5 text-[#219ebc] shrink-0" />,
  },
  success: {
    container: "border-emerald-200 bg-emerald-50/95 text-emerald-900",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />,
  },
  error: {
    container: "border-rose-200 bg-rose-50/95 text-rose-900",
    icon: <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />,
  },
  warning: {
    container: "border-amber-200 bg-amber-50/95 text-amber-900",
    icon: <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />,
  },
  brand: {
    container: "border-[#8ecae6] bg-[#f2f9fc]/95 text-[#023047] shadow-lg shadow-[#8ecae6]/20",
    icon: <CheckCircle2 className="h-5 w-5 text-[#219ebc] shrink-0" />,
  },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback(({ title, description, variant = "default" }) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, title, description, variant }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4200);
  }, []);

  const contextValue = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={contextValue}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => {
          const config = variants[t.variant] || variants.default;
          return (
            <ToastPrimitive.Root
              key={t.id}
              className={cn(
                "fixed bottom-5 right-5 z-50 flex items-start gap-3 w-88 max-w-[90vw] rounded-2xl border p-4 shadow-xl backdrop-blur-md",
                "animate-in slide-in-from-right-full fade-in-0 duration-300 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
                config.container
              )}
              open
            >
              {config.icon}
              <div className="flex-1 pr-4">
                {t.title && (
                  <ToastPrimitive.Title className="font-semibold text-sm">
                    {t.title}
                  </ToastPrimitive.Title>
                )}
                {t.description && (
                  <ToastPrimitive.Description className="text-xs opacity-90 mt-0.5 leading-relaxed">
                    {t.description}
                  </ToastPrimitive.Description>
                )}
              </div>
              <ToastPrimitive.Close className="rounded-lg p-1 text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors">
                <X className="h-4 w-4" />
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          );
        })}
        <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-5 outline-none pointer-events-none" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}