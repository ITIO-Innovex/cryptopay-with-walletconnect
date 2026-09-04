/**
 * Browser-side authentication helpers. Every auth call in the app goes through
 * this file so the rest of the codebase never talks to the auth service directly.
 */

import { supabase } from "@/integrations/supabase/client";

export interface MerchantSignUpInput {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  website?: string;
  contactPhone?: string;
}

/** Signs a merchant in with email and password. */
export async function signInWithEmailAndPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
  return data;
}

/**
 * Creates a merchant account. Profile details are stored in the auth user
 * metadata and copied into `auth_user_profile` on first sign-in.
 */
export async function signUpMerchantAccount(input: MerchantSignUpInput) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
      data: {
        full_name: input.fullName,
        company_name: input.companyName,
        website: input.website ?? "",
        contact_phone: input.contactPhone ?? "",
      },
    },
  });
  if (error) throw error;
  return data;
}

/** Sends the password reset email pointing at the /reset-password page. */
export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

/** Sets a new password for the user in a recovery session. */
export async function setNewPasswordFromRecovery(password: string) {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

/** Signs the current user out. */
export async function signOutCurrentUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
