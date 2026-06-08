import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo/Logo";
import {
  LayoutDashboard,
  BarChart2,
  FileEdit,
  LifeBuoy,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const links = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Job Tracker",
    to: "/tracker",
    icon: BarChart2,
  },
  {
    label: "Resume Optimizer",
    to: "/optimizer",
    icon: FileEdit,
  },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

 const handleSignOut = async () => {
  await signOut();
  window.location.replace("/");
};

  return (
    <div
      className="
        w-56 h-screen flex flex-col py-5 px-3
        bg-white border-r border-gray-200
        dark:bg-[#0d0d14]
        dark:border-white/[0.06]
        transition-colors duration-300
      "
    >
      {/* Brand */}
      <Logo className="px-3 mb-8" />

      {/* Nav Links */}
      <div className="flex flex-col gap-0.5">
        <p className="text-[10px] text-gray-500 dark:text-gray-500 uppercase tracking-widest px-3 mb-2 font-medium">
          Main Menu
        </p>

        {links.map(({ label, to, icon: Icon }) => {
          const isActive = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? "bg-violet-600/15 text-violet-700 dark:text-violet-300"
                  : "text-gray-600 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isActive
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-gray-500 dark:text-gray-600 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                }`}
                strokeWidth={1.75}
              />
              <span className="font-medium">{label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-gray-200 dark:border-white/[0.06]">
        {/* Support */}
        <button className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all duration-150 w-full">
          <LifeBuoy
            className="w-4 h-4 text-gray-500 dark:text-gray-600 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors"
            strokeWidth={1.75}
          />
          <span className="font-medium">Support</span>
        </button>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/[0.08] dark:hover:bg-rose-400/[0.06] transition-all duration-150 w-full"
        >
          <LogOut
            className="w-4 h-4 text-gray-500 dark:text-gray-600 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors"
            strokeWidth={1.75}
          />
          <span className="font-medium">Sign Out</span>
        </button>

        {/* User Card */}
        <Link
          to="/profile"
          className="mt-2 p-3 rounded-xl bg-gray-50 border border-gray-200 hover:border-gray-300 dark:bg-[#13131c] dark:border-white/[0.08] dark:hover:border-white/[0.15] flex items-center gap-3 transition-all duration-150"
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <span className="text-sm font-bold text-white">
                {user?.email?.[0].toUpperCase() || "U"}
              </span>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-gray-50 dark:border-[#13131c]" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-gray-900 dark:text-gray-200 truncate">
              {user?.email?.split("@")[0] || "User"}
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-600 truncate mt-0.5">
              {user?.email || ""}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
