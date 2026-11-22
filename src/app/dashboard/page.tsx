import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { EcommerceCalculationRecord } from "@/types";
import { Navbar } from "@/components/Navbar";
import { DashboardClient } from "@/components/DashboardClient";

async function DashboardContent() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profile }, { data: historyRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, email")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("ecommerce_calculations")
      .select(
        "id, user_id, product_name, platform, cost_price, packaging_cost, ads_cost, platform_fee_percent, selling_price, fixed_cost, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const resolvedUsername =
    profile?.username ??
    (typeof user.user_metadata?.username === "string"
      ? user.user_metadata.username
      : "user");
  const resolvedEmail = profile?.email ?? user.email ?? "";

  return (
    <>
      <Navbar username={resolvedUsername} isAuthenticated />
      <DashboardClient
        userId={user.id}
        username={resolvedUsername}
        email={resolvedEmail}
        initialRecords={(historyRows as EcommerceCalculationRecord[]) ?? []}
      />
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
          กำลังตรวจสอบสิทธิ์และโหลดเครื่องมือคำนวณ...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
