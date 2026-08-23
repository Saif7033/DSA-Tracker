"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema, LoginInput, RegisterInput } from "@/lib/validations/auth";

export async function loginAction(data: LoginInput) {
  const result = loginSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function registerAction(data: RegisterInput) {
  const result = registerSchema.safeParse(data);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || "Invalid input" };
  }

  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // If email confirmation is disabled in Supabase, user session is automatically created
  const sessionActive = !!authData.session;
  return {
    success: true,
    sessionActive,
    message: sessionActive
      ? "Account created successfully! Redirecting..."
      : "Account registered! Please check your email for confirmation or log in.",
  };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
