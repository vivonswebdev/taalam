import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { audio_path, submission_id } = await req.json();

    if (!audio_path || !submission_id) {
      return new Response(JSON.stringify({ error: 'Missing audio_path or submission_id' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Download audio from storage
    const { data: audioData, error: downloadError } = await supabase.storage
      .from('student-audio')
      .download(audio_path);

    if (downloadError || !audioData) {
      console.error('Download error:', downloadError);
      return new Response(JSON.stringify({ error: 'Failed to download audio' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Convert to base64
    const arrayBuffer = await audioData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const audioBase64 = btoa(binary);

    // Send to AI for Tajwid scoring
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a Quran Tajwid expert. Listen to this Quran recitation audio and evaluate the Tajwid quality.
                
Score the recitation from 0 to 100 based on:
- Correct pronunciation of Arabic letters (makharij): 30 points
- Proper application of Tajwid rules (idgham, ikhfa, iqlab, izhar, ghunna, madd): 40 points  
- Fluency and rhythm (tarteel): 20 points
- Overall clarity: 10 points

You MUST respond with ONLY a JSON object in this exact format, nothing else:
{"score": <number 0-100>, "details": "<brief feedback in Arabic about tajwid quality, max 2 sentences>"}`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:audio/webm;base64,${audioBase64}`,
                },
              },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`AI Gateway error [${response.status}]: ${errorBody}`);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI Gateway call failed [${response.status}]`);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content?.trim() || '';

    // Parse the JSON response
    let score = 0;
    let details = '';
    try {
      // Remove markdown code blocks if present
      const cleaned = rawContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      score = Math.min(100, Math.max(0, Math.round(parsed.score || 0)));
      details = parsed.details || '';
    } catch {
      console.warn('Failed to parse AI response:', rawContent);
      // Try to extract a number
      const match = rawContent.match(/(\d{1,3})/);
      score = match ? Math.min(100, Math.max(0, parseInt(match[1]))) : 50;
    }

    // Update the submission with the score
    const { error: updateError } = await supabase
      .from('task_submissions')
      .update({
        score_tajwid: score,
        updated_at: new Date().toISOString(),
      })
      .eq('id', submission_id);

    if (updateError) {
      console.error('Update error:', updateError);
    }

    return new Response(JSON.stringify({ score, details }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Score tajwid error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
