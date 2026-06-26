import { createContext, useContext, useEffect, useState } from "react";

import { useAuth } from "./AuthContext";

import {
  getProfile,
  createProfile,
  updateProfile,
} from "../services/profileService";

const ProfileContext = createContext();

export const useProfile = () => useContext(ProfileContext);

export function ProfileProvider({ children }) {
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    loadProfile();
  }, [user]);

  async function loadProfile() {
    try {
      setLoading(true);

      let profileData = await getProfile(user.id);

      if (!profileData) {
        profileData = await createProfile({
          id: user.id,
        });
      }

      setProfile(profileData);
    } catch (error) {
      console.error("Failed to load profile:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile(updates) {
    try {
      const updatedProfile = await updateProfile(user.id, updates);

      setProfile(updatedProfile);

      return updatedProfile;
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  }

  return (
    <ProfileContext.Provider
      value={{
        profile,
        loading,
        saveProfile,
        refreshProfile: loadProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
