import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore, getUserRole } from "../../stores/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && getUserRole(user) !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
