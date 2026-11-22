import { Suspense } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { LandingView } from "@/components/LandingView";

async function HomeContent() {
  let isAuthenticated = false;
  let username: string | null = null;

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      isAuthenticated = true;
      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("id", user.id)
        .maybeSingle();

      username =
        profile?.username ??
        (typeof user.user_metadata?.username === "string"
          ? user.user_metadata.username
          : null);
    }
  } catch {
    isAuthenticated = false;
  }

  return (
    <>
      <Navbar username={username} isAuthenticated={isAuthenticated} />
      <LandingView isAuthenticated={isAuthenticated} />
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
          กำลังโหลดหน้าแรก...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
