import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/ui/Toast";
import { Label } from "../components/ui/Label";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../components/ui/Card";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState("admin@attendance.com");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await login({ email, password });
      toast.show({
        title: "Signed In",
        description: `Welcome back, ${res.user.name || "Administrator"}.`,
        variant: "default",
      });
      navigate("/dashboard");
    } catch (err) {
      setErrorMessage(err.message || "Invalid credentials provided.");
      toast.show({
        title: "Sign In Failed",
        description: err.message || "Invalid credentials.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Brand header */}
        <div className="text-center space-y-1">
          <div className="inline-flex h-11 w-11 rounded-xl bg-[#8ecae6] items-center justify-center text-[#023047] font-bold text-lg shadow-xs mb-2">
            AI
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AttendIQ</h1>
          <p className="text-xs text-slate-500">Attendance Management System • Admin Portal</p>
        </div>

        {/* Login Card */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Admin Sign In</CardTitle>
            <CardDescription>
              Sign in with your administrative credentials to manage students and attendance.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-xs font-semibold text-slate-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@attendance.com"
                    required
                    className="pl-9 h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <Label htmlFor="login-password" className="text-xs font-semibold text-slate-700">
                    Password
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-9 pr-9 h-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-[#023047] focus:ring-[#8ecae6] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <span className="text-[11px] text-[#219ebc] font-medium">Secured Session</span>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-[#023047] hover:bg-[#0f4c64] text-white text-sm font-medium cursor-pointer"
              >
                {isLoading ? (
                  <span>Signing in...</span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In to Dashboard <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Pre-fill Helper */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@attendance.com");
                  setPassword("admin123");
                }}
                className="text-[11px] text-[#023047] hover:underline font-mono bg-slate-100 px-2 py-0.5 rounded cursor-pointer"
              >
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
