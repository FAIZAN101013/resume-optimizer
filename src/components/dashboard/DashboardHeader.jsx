import { useAuth } from "../../context/AuthContext";

export default function DashboardHeader() {
  const { user } = useAuth();

  const name = user?.email?.split("@")[0]?.split(".")[0];
  const displayName = name
    ? name.charAt(0).toUpperCase() + name.slice(1)
    : "there";

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-white mb-1">
        Welcome back, {displayName}{" "}
        <span className="inline-block origin-bottom-right animate-wave">👋</span>
      </h1>
      <p className="text-gray-500 text-sm">
        Here's what's happening with your job search.
      </p>
    </div>
  );
}
