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
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { student_id, status, assignment_title, teacher_note, class_id } = await req.json();

    if (!student_id || !status) {
      return new Response(JSON.stringify({ error: "Missing student_id or status" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find parent(s) of this student via family_members
    const { data: studentFamilies } = await supabase
      .from("family_members")
      .select("family_id")
      .eq("user_id", student_id);

    if (!studentFamilies || studentFamilies.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0, reason: "no_family" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const familyIds = studentFamilies.map(f => f.family_id);

    // Get parents in those families
    const { data: parents } = await supabase
      .from("family_members")
      .select("user_id, role_in_family")
      .in("family_id", familyIds)
      .in("role_in_family", ["parent", "guardian"]);

    const parentIds = [...new Set((parents || []).filter(p => p.user_id !== student_id).map(p => p.user_id))];

    if (parentIds.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0, reason: "no_parents" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get student name
    const { data: studentProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", student_id)
      .single();

    const studentName = studentProfile?.display_name || "Votre enfant";
    const title = status === "approved"
      ? `✅ Devoir validé`
      : `❌ Devoir à corriger`;
    const body = status === "approved"
      ? `${studentName} a réussi le devoir "${assignment_title || "?"}". Bravo ! 🎉`
      : `Le devoir "${assignment_title || "?"}" de ${studentName} nécessite une correction.${teacher_note ? ` Note: ${teacher_note}` : ""}`;

    let sentCount = 0;

    for (const parentId of parentIds) {
      // 1. In-app message via teacher_parent_messages
      if (class_id) {
        // Get teacher_id (the one who reviewed)
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.replace("Bearer ", "");
        let teacherId: string | null = null;
        if (token) {
          const { data: { user: caller } } = await supabase.auth.getUser(token);
          teacherId = caller?.id || null;
        }

        if (teacherId) {
          await supabase.from("teacher_parent_messages").insert({
            class_id,
            sender_id: teacherId,
            receiver_id: parentId,
            student_id,
            message: `${title} — ${body}`,
            message_type: "auto",
          });
        }
      }

      // 2. Push notification via FCM
      if (fcmServerKey) {
        const { data: tokens } = await supabase
          .from("fcm_tokens")
          .select("token")
          .eq("user_id", parentId);

        if (tokens && tokens.length > 0) {
          // Log notification
          await supabase.from("notification_log").insert({
            user_id: parentId,
            type: "review_result",
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
                  data: { type: "review_result", student_id, class_id },
                }),
              });
            } catch (err) {
              console.error(`FCM send failed:`, err);
            }
          }
        }
      }

      sentCount++;
    }

    return new Response(JSON.stringify({ ok: true, sent: sentCount, parents: parentIds.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("notify-parent-review error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
