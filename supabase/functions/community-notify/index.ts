import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const fcmServerKey = Deno.env.get("FCM_SERVER_KEY");

  // Auth check
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.replace("Bearer ", "");
  const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
  if (claimsErr || !claimsData?.claims) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const userId = claimsData.claims.sub as string;

  if (!fcmServerKey) {
    return new Response(JSON.stringify({ error: "FCM not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { type, community_id, community_name, author_name, message_preview } = await req.json();

    if (type === "join_request") {
      // Notify all admins of the community
      const { data: admins } = await admin
        .from("community_members")
        .select("user_id")
        .eq("community_id", community_id)
        .eq("role", "admin");

      const sent: string[] = [];
      for (const a of admins || []) {
        if (a.user_id === userId) continue; // Don't notify yourself
        await sendPush(
          admin,
          fcmServerKey,
          a.user_id,
          "community_join_request",
          "👋 Nouvelle demande",
          `Quelqu'un demande à rejoindre « ${community_name || "votre groupe"} »`
        );
        sent.push(a.user_id);
      }
      return new Response(JSON.stringify({ ok: true, notified: sent.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "new_message") {
      // Notify all members except the author
      const { data: members } = await admin
        .from("community_members")
        .select("user_id")
        .eq("community_id", community_id);

      const sent: string[] = [];
      for (const m of members || []) {
        if (m.user_id === userId) continue;
        await sendPush(
          admin,
          fcmServerKey,
          m.user_id,
          "community_message",
          `💬 ${author_name || "Nouveau message"}`,
          `${community_name ? community_name + " : " : ""}${(message_preview || "").slice(0, 100)}`
        );
        sent.push(m.user_id);
      }
      return new Response(JSON.stringify({ ok: true, notified: sent.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("community-notify error:", error);
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
  const { data: tokens } = await supabase
    .from("fcm_tokens")
    .select("token")
    .eq("user_id", userId);

  if (!tokens || tokens.length === 0) return;

  await supabase.from("notification_log").insert({
    user_id: userId,
    type,
    title,
    body,
  });

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
      console.error(`FCM send failed:`, err);
    }
  }
}
