import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // Logged in, but wrong role for this page - send them to their own
    // dashboard instead of a dead end.
    if (user.role === "ADMIN") return <Navigate to="/admin-dashboard" replace />;
    if (user.role === "MENTOR") return <Navigate to="/mentor-dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
