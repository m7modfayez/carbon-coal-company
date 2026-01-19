import { createBrowserClient } from "@supabase/ssr";

/**
 * Client-safe Supabase instance
 * Use this ONLY in client components and middleware
 */
export const supabaseBrowser = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
