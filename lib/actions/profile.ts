"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { Profile } from "@/types/database.types";
import { syncDailyActivityForDate } from "@/lib/actions/daily-activity";

async function getAuthenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Unauthorized. Please log in to continue.");
  }

  return { supabase, user };
}

export async function getUserProfile(): Promise<Profile> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    // Fetch existing profile
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      return profile;
    }

    // Determine auth provider (email, google, github, etc.)
    const provider = user.app_metadata?.provider || (user.identities && user.identities[0]?.provider) || "email";
    const fullName = user.user_metadata?.full_name || user.user_metadata?.name || null;
    const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

    // Create new profile record if missing
    const newProfile = {
      id: user.id,
      email: user.email || null,
      full_name: fullName,
      avatar_url: avatarUrl,
      provider: provider,
      daily_goal: 3,
    };

    const { data: created, error: insertError } = await supabase
      .from("profiles")
      .insert(newProfile)
      .select("*")
      .single();

    if (insertError || !created) {
      // Fallback in case of race condition
      const { data: existing } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (existing) return existing;

      return {
        id: user.id,
        email: user.email || null,
        full_name: fullName,
        avatar_url: avatarUrl,
        provider: provider,
        daily_goal: 3,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    return created;
  } catch (err) {
    console.error("Error in getUserProfile:", err);
    throw err;
  }
}

export async function updateDailyGoal(
  goal: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const validGoals = [1, 2, 3, 5, 10];
    if (!validGoals.includes(goal)) {
      return { success: false, error: "Invalid daily goal. Allowed values: 1, 2, 3, 5, 10." };
    }

    const { supabase, user } = await getAuthenticatedUser();

    // Ensure profile exists or update it
    const { error } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email || null,
        daily_goal: goal,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // Sync today's activity with the new goal
    const today = new Date().toISOString().split("T")[0];
    await syncDailyActivityForDate(user.id, today, goal);

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update daily goal";
    return { success: false, error: msg };
  }
}
