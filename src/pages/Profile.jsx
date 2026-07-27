import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Check,
  Loader2,
  User,
  FileText,
  Shield,
} from "lucide-react";

import ProfileHeader from "../components/profile/ProfileHeader";
import PersonalInfo from "../components/profile/PersonalInfo";
import ProfessionalInfo from "../components/profile/ProfessionalInfo";
import SocialLinks from "../components/profile/SocialLinks";
import AccountSection from "../components/profile/AccountSection";
import ExperienceSection from "../components/profile/ExperienceSection";
import EducationSection from "../components/profile/EducationSection";
import ProjectsSection from "../components/profile/ProjectsSection";
import CertificationsSection from "../components/profile/CertificationsSection";

import Tabs from "../components/common/Tabs";
import Button from "../components/Button";
import ThemeToggle from "../components/ThemeToggle";
import { useProfile } from "../context/ProfileContext";

const EMPTY_FORM = {
  full_name: "",
  phone: "",
  location: "",
  bio: "",
  job_title: "",
  open_to_work: true,
  github: "",
  linkedin: "",
  portfolio: "",
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
};

// The profile row is the source of truth; this only shapes it for the form,
// filling in nulls so inputs stay controlled.
function toFormState(profile) {
  if (!profile) return EMPTY_FORM;

  return {
    full_name: profile.full_name || "",
    phone: profile.phone || "",
    location: profile.location || "",
    bio: profile.bio || "",
    job_title: profile.job_title || "",
    open_to_work: profile.open_to_work ?? true,
    github: profile.github || "",
    linkedin: profile.linkedin || "",
    portfolio: profile.portfolio || "",
    skills: profile.skills || [],
    experience: profile.experience || [],
    education: profile.education || [],
    projects: profile.projects || [],
    certifications: profile.certifications || [],
  };
}

export default function Profile() {
  const { profile, loading, error, saveProfile } = useProfile();

  const [tab, setTab] = useState("about");
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Re-seed the form whenever the saved profile changes (initial load, or
  // after an avatar upload replaces the profile object).
  useEffect(() => {
    // Seeding editable state from the saved row is the intent here — the row
    // stays the source of truth, this is just the working copy.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData(toFormState(profile));
  }, [profile]);

  const isDirty = useMemo(() => {
    if (!profile) return false;
    return JSON.stringify(formData) !== JSON.stringify(toFormState(profile));
  }, [formData, profile]);

  const resumeCount =
    formData.experience.length +
    formData.education.length +
    formData.projects.length +
    formData.certifications.length;

  const TABS = [
    { key: "about", label: "About", icon: User },
    { key: "resume", label: "Resume", icon: FileText, badge: resumeCount },
    { key: "account", label: "Account", icon: Shield },
  ];

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setMessage(null);
  }

  // For the array-valued sections, which don't emit DOM events.
  function setField(name, value) {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await saveProfile(formData);
      setMessage({ type: "success", text: "Profile saved." });
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.message || "Failed to save profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3.5 text-sm text-rose-700 dark:text-rose-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Could not load your profile</p>
            <p className="mt-0.5 text-xs opacity-80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">

      {/* Page header — matches the tracker and dashboard */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Powers your resume, cover letters and interview prep.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isDirty && (
            <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Unsaved
            </span>
          )}

          <Button
            type="submit"
            form="profile-form"
            disabled={saving || loading || !isDirty}
          >
            {saving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </div>
      </div>

      <ProfileHeader />

      <Tabs tabs={TABS} active={tab} onChange={setTab} className="mb-6" />

      {message && (
        <div
          className={`mb-5 flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm ${
            message.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-300"
          }`}
        >
          {message.type === "success" ? (
            <Check className="h-3.5 w-3.5 shrink-0" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      <form id="profile-form" onSubmit={handleSubmit}>

        {tab === "about" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <PersonalInfo formData={formData} handleChange={handleChange} />

            <div className="space-y-5">
              <ProfessionalInfo
                formData={formData}
                handleChange={handleChange}
                setField={setField}
              />
              <SocialLinks formData={formData} handleChange={handleChange} />
            </div>
          </div>
        )}

        {tab === "resume" && (
          <div className="space-y-5">
            <ExperienceSection
              items={formData.experience}
              onChange={(v) => setField("experience", v)}
            />
            <EducationSection
              items={formData.education}
              onChange={(v) => setField("education", v)}
            />
            <ProjectsSection
              items={formData.projects}
              onChange={(v) => setField("projects", v)}
            />
            <CertificationsSection
              items={formData.certifications}
              onChange={(v) => setField("certifications", v)}
            />
          </div>
        )}

        {tab === "account" && (
          <div className="max-w-xl">
            <AccountSection />
          </div>
        )}
      </form>
    </div>
  );
}
