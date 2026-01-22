import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { APP_ID } from "./app-config";


/**
 * Server-side Supabase instance
 * Use this ONLY in server components and API routes
 */
export const supabaseServer = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      async getAll() {
        const cookieStore = await cookies();
        return cookieStore.getAll();
      },
      async setAll(cookiesToSet) {
        const cookieStore = await cookies();
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  }
);

/**
 * Get current user's app_id from profiles table
 * Returns null if user not found or not assigned to any app
 */
export async function getUserAppId(userId: string): Promise<string | null> {
  const { data, error } = await supabaseServer
    .from('profiles')
    .select('app_id')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.app_id;
}
