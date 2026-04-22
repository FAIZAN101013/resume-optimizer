import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Logo() {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/")}
      className="px-3 mb-8 flex items-center gap-3 group cursor-pointer"
    >
      
      <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-105">
        <div className="absolute inset-0 rounded-xl bg-violet-500/20 blur-sm opacity-0 group-hover:opacity-100 transition" />
        <Zap className="w-4 h-4 text-white fill-white relative z-10" />
      </div>

      <div className="leading-tight">
        <div className="text-white font-semibold text-sm tracking-tight">
          Career<span className="text-violet-400">OS</span>
        </div>
        <div className="text-gray-400 text-[11px] mt-0.5 group-hover:text-gray-300 transition">
          Elite Career Suite
        </div>
      </div>
    </div>
  );
}