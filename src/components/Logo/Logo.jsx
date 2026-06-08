import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Logo({
  compact = false,
  showTagline = true,
  className = "",
  textClassName = "",
}) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/")}
      className={`flex items-center group cursor-pointer ${
        compact ? "gap-2" : "gap-3"
      } ${className}`}
    >
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-105">
        <div className="absolute inset-0 rounded-xl bg-violet-500/20 blur-sm opacity-0 group-hover:opacity-100 transition" />
        <Zap className="w-4 h-4 text-white fill-white relative z-10" />
      </div>

      <div className="leading-tight">
        <div
          className={`text-gray-900 dark:text-white font-semibold tracking-tight ${
            compact ? "text-xs" : "text-sm"
          } ${textClassName}`}
        >
          Career <span className="text-violet-600 dark:text-violet-400">Log</span>
        </div>
        {showTagline && (
          <div className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition">
            Elite Career Suite
          </div>
        )}
      </div>
    </div>
  );
}
