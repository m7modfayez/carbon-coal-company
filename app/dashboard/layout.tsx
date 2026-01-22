import { redirect } from "next/navigation";
import { createSupabaseServer, getUserAppId, } from "@/lib/supabase-server";
import { APP_ID } from "@/lib/app-config";

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabaseServer = createSupabaseServer();
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) redirect("/login");

  const userAppId = await getUserAppId(user.id);
  if (userAppId !== APP_ID) {
    redirect("/login?error=unauthorized");
  }

  return <>{children}</>;
}
