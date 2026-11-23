import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/Navbar";
import { LandingView } from "@/components/LandingView";
import { PageLoader } from "@/components/PageLoader";

interface HomePageProps {
  searchParams: Promise<{ landing?: string | string[] }>;
}

async function HomeContent({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;
  const landingParam = resolvedSearchParams.landing;
  const allowLanding =
    landingParam === "1" ||
    (Array.isArray(landingParam) && landingParam.includes("1"));

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

  if (isAuthenticated && !allowLanding) {
    redirect("/dashboard");
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
      <LandingView isAuthenticated={isAuthenticated} />
    </>
  );
}

export default function HomePage({ searchParams }: HomePageProps) {
  return (
    <Suspense fallback={<PageLoader label="กำลังโหลดหน้าแรก..." />}>
      <HomeContent searchParams={searchParams} />
    </Suspense>
  );
}
