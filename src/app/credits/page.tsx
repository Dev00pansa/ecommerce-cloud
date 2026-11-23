import { Suspense } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { CreditsView } from "@/components/CreditsView";
import { Footer } from "@/components/Footer";
import { PageLoader } from "@/components/PageLoader";

async function CreditsContent() {
  let isAuthenticated = false;
  let username: string | null = null;
  let email: string | null = null;
  let avatarUrl: string | null = null;
  let createdAt: string | null = null;

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      isAuthenticated = true;
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, email, avatar_url, created_at")
        .eq("id", user.id)
        .maybeSingle();

      username =
        profile?.username ??
        (typeof user.user_metadata?.username === "string"
          ? user.user_metadata.username
          : null);
      email = profile?.email ?? user.email ?? null;
      avatarUrl =
        profile?.avatar_url ??
        (typeof user.user_metadata?.avatar_url === "string"
          ? user.user_metadata.avatar_url
          : null);
      createdAt = profile?.created_at ?? user.created_at ?? null;
    }
  } catch {
    isAuthenticated = false;
  }

  return (
    <>
      <Navbar
        username={username}
        email={email}
        avatarUrl={avatarUrl}
        createdAt={createdAt}
        isAuthenticated={isAuthenticated}
      />
      <CreditsView isAuthenticated={isAuthenticated} />
      <Footer isAuthenticated={isAuthenticated} />
    </>
  );
}

export default function CreditsPage() {
  return (
    <Suspense fallback={<PageLoader label="กำลังโหลดข้อมูลเครดิตผู้จัดทำ..." />}>
      <CreditsContent />
    </Suspense>
  );
}
