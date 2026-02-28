import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const fcmServerKey = Deno.env.get("FCM_SERVER_KEY");

  if (!fcmServerKey) {
    return new Response(JSON.stringify({ error: "FCM_SERVER_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const now = new Date();
  const currentHour = now.getUTCHours();
  const today = now.toISOString().split("T")[0];
  const results: string[] = [];

  try {
    // 1. Hifz daily reminders
    const { data: hifzPrefs } = await supabase
      .from("notification_preferences")
      .select("user_id, reminder_hour")
      .eq("hifz_reminder", true);

    for (const pref of hifzPrefs || []) {
      // Simple hour-based check (UTC)
      if (pref.reminder_hour !== currentHour) continue;

      // Check if user has pending hifz tasks today
      const { data: tasks } = await supabase
        .from("hifz_plan_tasks")
        .select("id")
        .eq("user_id", pref.user_id)
        .eq("task_date", today)
        .eq("is_completed", false)
        .limit(1);

      if (tasks && tasks.length > 0) {
        await sendPush(supabase, fcmServerKey, pref.user_id, "hifz_reminder", 
          "📖 Rappel Hifz", "Tu as des tâches Hifz à faire aujourd'hui. Garde ton streak ! 🔥");
        results.push(`hifz_reminder:${pref.user_id}`);
      }
    }

    // 2. Assignment reminders (due in next 2 days)
    const { data: assignPrefs } = await supabase
      .from("notification_preferences")
      .select("user_id")
      .eq("assignment_reminder", true);

    const twoDaysLater = new Date(now);
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    const twoDaysStr = twoDaysLater.toISOString().split("T")[0];

    for (const pref of assignPrefs || []) {
      // Get user's classrooms
      const { data: memberships } = await supabase
        .from("classroom_members")
        .select("classroom_id")
        .eq("user_id", pref.user_id);

      if (!memberships || memberships.length === 0) continue;

      const classIds = memberships.map((m: any) => m.classroom_id);

      const { data: assignments } = await supabase
        .from("class_assignments")
        .select("id, title, due_date")
        .in("class_id", classIds)
        .eq("is_active", true)
        .gte("due_date", today)
        .lte("due_date", twoDaysStr);

      if (assignments && assignments.length > 0) {
        const titles = assignments.map((a: any) => a.title).join(", ");
        await sendPush(supabase, fcmServerKey, pref.user_id, "assignment_reminder",
          "📝 Devoir bientôt dû", `${assignments.length} devoir(s) à rendre bientôt : ${titles}`);
        results.push(`assignment_reminder:${pref.user_id}`);
      }
    }

    // 3. Nudge (no activity for X days)
    const { data: nudgePrefs } = await supabase
      .from("notification_preferences")
      .select("user_id, nudge_after_days")
      .eq("nudge_enabled", true);

    for (const pref of nudgePrefs || []) {
      const cutoff = new Date(now);
      cutoff.setDate(cutoff.getDate() - pref.nudge_after_days);
      const cutoffStr = cutoff.toISOString();

      const { data: recentActivity } = await supabase
        .from("app_events")
        .select("id")
        .eq("user_id", pref.user_id)
        .gte("created_at", cutoffStr)
        .limit(1);

      if (!recentActivity || recentActivity.length === 0) {
        // Check we haven't already nudged recently
        const { data: recentNudge } = await supabase
          .from("notification_log")
          .select("id")
          .eq("user_id", pref.user_id)
          .eq("type", "nudge")
          .gte("sent_at", cutoffStr)
          .limit(1);

        if (!recentNudge || recentNudge.length === 0) {
          await sendPush(supabase, fcmServerKey, pref.user_id, "nudge",
            "🌙 Tu nous manques", "Reviens lire quelques versets, même un seul verset compte. Allah facilite le chemin de celui qui cherche le savoir 💚");
          results.push(`nudge:${pref.user_id}`);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, sent: results.length, details: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("check-notifications error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function sendPush(
  supabase: any,
  fcmServerKey: string,
  userId: string,
  type: string,
  title: string,
  body: string
) {
  // Get user's FCM tokens
  const { data: tokens } = await supabase
    .from("fcm_tokens")
    .select("token")
    .eq("user_id", userId);

  if (!tokens || tokens.length === 0) return;

  // Log notification
  await supabase.from("notification_log").insert({
    user_id: userId,
    type,
    title,
    body,
  });

  // Send via FCM
  for (const t of tokens) {
    try {
      await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${fcmServerKey}`,
        },
        body: JSON.stringify({
          to: t.token,
          notification: { title, body },
          data: { type, click_action: "FLUTTER_NOTIFICATION_CLICK" },
        }),
      });
    } catch (err) {
      console.error(`FCM send failed for token ${t.token}:`, err);
    }
  }
}
