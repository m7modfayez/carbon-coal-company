import { redirect } from "next/navigation";
import { supabaseServer, getUserAppId, } from "@/lib/supabase-server";
import { APP_ID } from "@/lib/app-config";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: { user } } = await supabaseServer.auth.getUser();

  if (!user) redirect("/login");

  const userAppId = await getUserAppId(user.id);
  if (userAppId !== APP_ID) {
    redirect("/login?error=unauthorized");
  }

  return <>{children}</>;
}
