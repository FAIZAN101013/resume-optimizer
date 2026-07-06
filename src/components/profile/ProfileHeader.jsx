import {
  Camera,
  Briefcase,
  Mail,
  MapPin,
  GitBranch,
  Link2,
  Globe,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";

export default function ProfileHeader() {
  const { user } = useAuth();
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 animate-pulse">
        <div className="flex items-center gap-6">
          <div className="w-28 h-28 rounded-full bg-zinc-800" />

          <div className="flex-1 space-y-4">
            <div className="h-7 w-56 bg-zinc-800 rounded" />
            <div className="h-4 w-40 bg-zinc-800 rounded" />
            <div className="h-4 w-64 bg-zinc-800 rounded" />
            <div className="h-4 w-36 bg-zinc-800 rounded" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

        {/* Left Side */}

        <div className="flex items-center gap-6">

          {/* Avatar */}

          <div className="relative">

            <img
              src={
                profile?.avatar_url ||
                "https://ui-avatars.com/api/?name=User&background=27272a&color=ffffff"
              }
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-zinc-800"
            />

            <button
              className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 transition flex items-center justify-center"
            >
              <Camera size={18} />
            </button>

          </div>

          {/* User Information */}

          <div>

            <h1 className="text-3xl font-bold">
              {profile?.full_name || "Complete Your Profile"}
            </h1>

            <div className="flex items-center gap-2 text-zinc-400 mt-2">
              <Briefcase size={16} />
              <span>
                {profile?.job_title || "No Job Title"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-zinc-400 mt-2">
              <Mail size={16} />
              <span>{user?.email}</span>
            </div>

            <div className="flex items-center gap-2 text-zinc-400 mt-2">
              <MapPin size={16} />
              <span>{profile?.location || "No Location"}</span>
            </div>

            {/* Social Links */}

            <div className="flex items-center gap-4 mt-5">

              {profile?.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-400 hover:text-white transition"
                >
                  <GitBranch size={20} />
                </a>
              )}

              {profile?.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-400 hover:text-white transition"
                >
                  <Link2 size={20} />
                </a>
              )}

              {profile?.portfolio && (
                <a
                  href={profile.portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-400 hover:text-white transition"
                >
                  <Globe size={20} />
                </a>
              )}

            </div>

          </div>

        </div>

        {/* Right Side */}

        <div className="flex flex-col items-start lg:items-end gap-4">

          <span
            className={`px-4 py-2 rounded-full text-sm font-medium border ${
              profile?.open_to_work
                ? "bg-green-500/20 text-green-400 border-green-500/30"
                : "bg-zinc-800 text-zinc-400 border-zinc-700"
            }`}
          >
            {profile?.open_to_work
              ? "Open to Work"
              : "Not Looking"}
          </span>

          <button className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition">
            Change Photo
          </button>

        </div>

      </div>
    </section>
  );
}
