import { supabase } from "../lib/supabase";

// Columns the client may write. Keeps derived/server-owned fields (id,
// created_at, updated_at) out of updates even if they ride along on form state.
const WRITABLE = [
  "full_name", "phone", "location", "job_title", "bio",
  "github", "linkedin", "portfolio", "avatar_url", "open_to_work",
  "skills", "education", "experience", "projects", "certifications",
];

function toRow(updates) {
  const row = {};
  for (const key of WRITABLE) {
    if (updates[key] !== undefined) row[key] = updates[key];
  }
  return row;
}

// Get the current user's profile.
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  // No profile row yet.
  if (error?.code === "PGRST116") {
    return null;
  }

  if (error) throw error;

  return data;
}

// Create a new profile. The database also creates one on signup, so this is
// only a fallback for accounts that predate that trigger.
export async function createProfile(profile) {
  const { data, error } = await supabase
    .from("profiles")
    .insert(profile)
    .select()
    .single();

  if (error) throw error;

  return data;
}

// Update an existing profile.
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from("profiles")
    .update(toRow(updates))
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Uploads to the `avatars` bucket and returns the public URL.
// Storage policy requires the path to start with the user's id.
export async function uploadAvatar(userId, file) {
  if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
    throw new Error("Please choose a JPG, PNG, WEBP or GIF image.");
  }

  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error("That image is larger than 2 MB. Please pick a smaller one.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/avatar.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);

  // The path is stable across uploads, so browsers would keep serving the
  // cached image. A version query busts that without orphaning files.
  return `${data.publicUrl}?v=${Date.now()}`;
}

export async function removeAvatar(userId, avatarUrl) {
  if (!avatarUrl) return;

  // Recover the storage path from the public URL, ignoring any cache-buster.
  const match = avatarUrl.split("?")[0].match(/\/avatars\/(.+)$/);
  if (!match) return;

  const path = match[1];
  if (!path.startsWith(`${userId}/`)) return;

  const { error } = await supabase.storage.from("avatars").remove([path]);
  if (error) throw error;
}
