import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Secured via CRON_SECRET header in production or fallback for local internal job
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const { error } = await supabase.rpc("run_deadline_reminders");

    if (error) {
      console.error("Cron job run_deadline_reminders failed:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Cron handler exception:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
