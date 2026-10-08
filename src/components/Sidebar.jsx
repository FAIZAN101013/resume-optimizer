import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BarChart2,
  FileEdit,
  Sparkles,
  CalendarDays,
  PieChart,
  LifeBuoy,
  LogOut,
  User,
  Settings as SettingsIcon,
  Sun,
  Moon,
  ChevronUp,
} from "lucide-react";

import Logo from "./Logo/Logo";
import { useAuth } from "../context/AuthContext";
import { useProfile } from "../context/ProfileContext";
import { useTheme } from "../context/ThemeContext";

const links = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Job Tracker", to: "/tracker", icon: BarChart2 },
  { label: "Resume Optimizer", to: "/optimizer", icon: FileEdit },
  { label: "AI Assistant", to: "/assistant", icon: Sparkles },
  { label: "Interviews", to: "/interviews", icon: CalendarDays },
  { label: "Analytics", to: "/analytics", icon: PieChart },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { theme, toggleTheme } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the user menu on an outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onKeyDown = (e) => e.key === "Escape" && setMenuOpen(false);

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName =
    profile?.full_name?.trim() || user?.email?.split("@")[0] || "User";

  return (
    <div className="flex h-screen w-56 flex-col border-r border-gray-200 bg-white px-3 py-5 transition-colors dark:border-white/[0.06] dark:bg-[#0d0d14]">
      <Logo className="mb-8 px-3" />

      {/* Nav */}
      <div className="flex flex-col gap-0.5 overflow-y-auto scrollbar-none">
        <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-widest text-gray-500 dark:text-gray-500">
          Main Menu
        </p>

        {links.map(({ label, to, icon: LinkIcon }) => {
          const isActive = pathname === to;

          return (
            <Link
              key={to}
              to={to}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ${
                isActive
                  ? "bg-violet-600/15 text-violet-700 dark:text-violet-300"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-500 dark:hover:bg-white/[0.04] dark:hover:text-gray-200"
              }`}
            >
              <LinkIcon
                className={`h-4 w-4 flex-shrink-0 transition-colors ${
                  isActive
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-gray-500 group-hover:text-gray-700 dark:text-gray-600 dark:group-hover:text-gray-300"
                }`}
                strokeWidth={1.75}
              />
              <span className="font-medium">{label}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-600 dark:bg-violet-400" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom */}
      <div className="mt-auto flex flex-col gap-1 border-t border-gray-200 pt-4 dark:border-white/[0.06]">
        <button className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 transition-all duration-150 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-white/[0.04] dark:hover:text-gray-300">
          <LifeBuoy
            className="h-4 w-4 text-gray-500 transition-colors group-hover:text-gray-700 dark:text-gray-600 dark:group-hover:text-gray-300"
            strokeWidth={1.75}
          />
          <span className="font-medium">Support</span>
        </button>

        {/* User menu */}
        <div ref={menuRef} className="relative">
          {menuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-white/[0.1] dark:bg-[#13131c]">
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
              >
                <User className="h-4 w-4" strokeWidth={1.75} />
                Profile
              </Link>

              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
              >
                <SettingsIcon className="h-4 w-4" strokeWidth={1.75} />
                Settings
              </Link>

              <button
                onClick={toggleTheme}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-white"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" strokeWidth={1.75} />
                ) : (
                  <Moon className="h-4 w-4" strokeWidth={1.75} />
                )}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>

              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 border-t border-gray-200 px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-rose-500/[0.08] hover:text-rose-600 dark:border-white/[0.06] dark:text-gray-400 dark:hover:text-rose-400"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.75} />
                Sign out
              </button>
            </div>
          )}

          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            className="mt-2 flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3 text-left transition-all duration-150 hover:border-gray-300 dark:border-white/[0.08] dark:bg-[#13131c] dark:hover:border-white/[0.15]"
          >
            <div className="relative flex-shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] shadow-lg shadow-violet-500/20">
                  <span className="text-sm font-bold text-white">
                    {displayName[0].toUpperCase()}
                  </span>
                </div>
              )}
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-gray-50 bg-emerald-400 dark:border-[#13131c]" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-gray-900 dark:text-gray-200">
                {displayName}
              </div>
              <div className="mt-0.5 truncate text-[10px] text-gray-500 dark:text-gray-600">
                {user?.email || ""}
              </div>
            </div>

            <ChevronUp
              className={`h-3.5 w-3.5 flex-shrink-0 text-gray-400 transition-transform dark:text-gray-600 ${
                menuOpen ? "" : "rotate-180"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
