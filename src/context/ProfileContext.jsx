import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { useAuth } from "./AuthContext";

import {
  getProfile,
  createProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
} from "../services/profileService";

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export function ProfileProvider({ children }) {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let profileData = await getProfile(user.id);

      // The signup trigger normally creates this row; this covers accounts
      // created before that existed.
      if (!profileData) {
        profileData = await createProfile({ id: user.id, email: user.email });
      }

      setProfile(profileData);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError(err.message || "Could not load your profile.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Standard fetch-on-mount; the loading flag has to flip before the await.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile();
  }, [loadProfile]);

  async function saveProfile(updates) {
    const updated = await updateProfile(user.id, updates);
    setProfile(updated);
    return updated;
  }

  // Upload first, then persist the URL — so a failed upload never leaves the
  // profile pointing at an image that doesn't exist.
  async function changeAvatar(file) {
    const avatarUrl = await uploadAvatar(user.id, file);
    return saveProfile({ avatar_url: avatarUrl });
  }

  async function clearAvatar() {
    await removeAvatar(user.id, profile?.avatar_url);
    return saveProfile({ avatar_url: null });
  }

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        error,
        saveProfile,
        changeAvatar,
        clearAvatar,
        refreshProfile: loadProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
