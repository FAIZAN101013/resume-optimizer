import { useRef, useState } from "react";
// lucide-react v1 dropped brand marks, so these are the closest generic icons.
import {
  Camera,
  MapPin,
  GitBranch,
  Link2,
  Globe,
  Loader2,
  Trash2,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";

function initials(name, email) {
  const source = name?.trim() || email?.split("@")[0] || "U";
  return source
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

// Honest completeness: each item is checked against what is actually stored.
function completeness(profile) {
  if (!profile) return { percent: 0, missing: [] };

  const checks = [
    ["a name", !!profile.full_name],
    ["a headline", !!profile.job_title],
    ["a location", !!profile.location],
    ["a bio", !!profile.bio],
    ["a photo", !!profile.avatar_url],
    ["skills", (profile.skills || []).length > 0],
    ["experience", (profile.experience || []).length > 0],
    ["education", (profile.education || []).length > 0],
    ["projects", (profile.projects || []).length > 0],
    ["a link", !!(profile.github || profile.linkedin || profile.portfolio)],
  ];

  const done = checks.filter(([, ok]) => ok).length;

  return {
    percent: Math.round((done / checks.length) * 100),
    missing: checks.filter(([, ok]) => !ok).map(([label]) => label),
  };
}

export default function ProfileHeader() {
  const { user } = useAuth();
  const { profile, loading, changeAvatar, clearAvatar } = useProfile();

  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    // Reset immediately so picking the same file twice still fires onChange.
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    setAvatarError("");
    try {
      await changeAvatar(file);
    } catch (err) {
      console.error(err);
      setAvatarError(err.message || "Could not upload that image.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    setAvatarError("");
    try {
      await clearAvatar();
    } catch (err) {
      console.error(err);
      setAvatarError(err.message || "Could not remove your photo.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="mb-6 animate-pulse rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-xl bg-gray-100 dark:bg-white/[0.06]" />
          <div className="flex-1 space-y-2.5">
            <div className="h-4 w-44 rounded bg-gray-100 dark:bg-white/[0.06]" />
            <div className="h-3 w-64 rounded bg-gray-100 dark:bg-white/[0.06]" />
            <div className="h-3 w-32 rounded bg-gray-100 dark:bg-white/[0.06]" />
          </div>
        </div>
      </div>
    );
  }

  const { percent, missing } = completeness(profile);

  const socials = [
    { key: "github", href: profile?.github, Icon: GitBranch, label: "GitHub" },
    { key: "linkedin", href: profile?.linkedin, Icon: Link2, label: "LinkedIn" },
    { key: "portfolio", href: profile?.portfolio, Icon: Globe, label: "Portfolio" },
  ].filter((s) => s.href);

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">

        {/* Avatar */}
        <div className="relative shrink-0">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="h-16 w-16 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] text-lg font-bold text-white">
              {initials(profile?.full_name, user?.email)}
            </div>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            aria-label="Change profile photo"
            className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 shadow-sm transition-colors hover:text-violet-600 disabled:opacity-60 dark:border-white/[0.1] dark:bg-[#13131c] dark:text-gray-400 dark:hover:text-violet-400"
          >
            {busy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Camera className="h-3.5 w-3.5" strokeWidth={1.75} />
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Identity */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {profile?.full_name || "Complete your profile"}
            </h2>

            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                profile?.open_to_work
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                  : "border-gray-200 bg-gray-100 text-gray-500 dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-white/40"
              }`}
            >
              {profile?.open_to_work ? "Open to work" : "Not looking"}
            </span>
          </div>

          <p className="mt-1 truncate text-sm text-gray-600 dark:text-gray-400">
            {profile?.job_title || "No headline yet"}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-white/35">
            <span className="truncate">{user?.email}</span>

            {profile?.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" strokeWidth={1.75} />
                {profile.location}
              </span>
            )}

            {socials.map(({ key, href, Icon, label }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="transition-colors hover:text-violet-600 dark:hover:text-violet-400"
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              </a>
            ))}

            {profile?.avatar_url && (
              <button
                type="button"
                onClick={handleRemove}
                disabled={busy}
                className="flex items-center gap-1 transition-colors hover:text-rose-600 disabled:opacity-60 dark:hover:text-rose-400"
              >
                <Trash2 className="h-3 w-3" />
                Remove photo
              </button>
            )}
          </div>
        </div>

        {/* Completeness */}
        <div className="w-full shrink-0 sm:w-44">
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[10px] font-medium uppercase tracking-widest text-gray-500 dark:text-white/35">
              Strength
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {percent}%
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>

          {missing.length > 0 && (
            <p className="mt-1.5 text-[10px] leading-relaxed text-gray-400 dark:text-white/25">
              Add {missing.slice(0, 2).join(" and ")}
              {missing.length > 2 && ` +${missing.length - 2} more`}
            </p>
          )}
        </div>
      </div>

      {avatarError && (
        <p className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-700 dark:text-rose-300">
          {avatarError}
        </p>
      )}
    </div>
  );
}
