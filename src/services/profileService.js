import { supabase } from "../lib/supabase";

// Get the current user's profile
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  // No profile found
  if (error?.code === "PGRST116") {
    return null;
  }

  // Real database error
  if (error) throw error;

  return data;
}
// Create a new profile
export async function createProfile(profile) {
  const { data, error } = await supabase
    .from("profiles")
    .insert(profile)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// Update an existing profile
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;

  return data;
}
