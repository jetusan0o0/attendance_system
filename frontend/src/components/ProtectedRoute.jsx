import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f2f9fc]">
        <div className="relative flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-4 border-[#8ecae6]/30 border-t-[#219ebc] animate-spin" />
          <div className="absolute h-8 w-8 rounded-full bg-[#8ecae6] opacity-70 animate-pulse" />
        </div>
        <p className="mt-4 text-sm font-medium text-[#023047]">Loading AttendIQ workspace...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
