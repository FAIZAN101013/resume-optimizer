import { useEffect, useState } from "react";
import ProfileHeader from "../components/profile/ProfileHeader";
import PersonalInfo from "../components/profile/PersonalInfo";
import ProfessionalInfo from "../components/profile/ProfessionalInfo";
import SocialLinks from "../components/profile/SocialLinks";
import AccountSection from "../components/profile/AccountSection";
import Button from "../components/Button";
import { useProfile } from "../context/ProfileContext";

export default function Profile() {
  const { profile, saveProfile } = useProfile();
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    location: "",
    bio: "",
    job_title: "",
    open_to_work: true,
    github: "",
    linkedin: "",
    portfolio: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      location: profile.location || "",
      bio: profile.bio || "",
      job_title: profile.job_title || "",
      open_to_work: profile.open_to_work ?? true,
      github: profile.github || "",
      linkedin: profile.linkedin || "",
      portfolio: profile.portfolio || "",
    });
  }, [profile]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setMessage(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await saveProfile(formData);
      setMessage({
        type: "success",
        text: "Profile saved successfully.",
      });
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: "Failed to save profile. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-8">

      {/* Page Title */}

      <div>
        <h1 className="text-3xl font-bold">
          Profile
        </h1>

        <p className="text-zinc-400 mt-2">
          Manage your account information and preferences.
        </p>
      </div>

      {/* Header */}

      <ProfileHeader />

      {/* Grid */}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

          <PersonalInfo formData={formData} handleChange={handleChange} />

          <ProfessionalInfo formData={formData} handleChange={handleChange} />

          <SocialLinks formData={formData} handleChange={handleChange} />

          <AccountSection />

        </div>

        {message && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-green-500/30 bg-green-500/10 text-green-300"
                : "border-red-500/30 bg-red-500/10 text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <Button
          type="submit"
          disabled={saving}
          size="lg"
          className="w-full rounded-2xl px-6 py-4 text-lg"
        >
          {saving ? "Saving Profile..." : "Save Profile"}
        </Button>
      </form>

    </main>
  );
}
