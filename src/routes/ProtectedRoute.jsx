import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { PageLoader } from "../components/common/Loader";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Normally unreachable, since AuthProvider holds the tree back until auth
  // resolves — but this stays correct if that ever changes. It used to
  // hardcode the dark background, which flashed dark in light mode.
  if (loading) {
    return <PageLoader label="Checking your session" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
