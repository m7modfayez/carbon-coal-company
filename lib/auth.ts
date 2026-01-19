import { supabaseBrowser } from "./supabase";

export interface Admin {
  id: string;
  email: string;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabaseBrowser.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { data: null, error };
  }

  return { data, error: null };
}
