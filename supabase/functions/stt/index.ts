import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { audio, lang = "ar" } = await req.json();

    if (!audio) {
      return new Response(JSON.stringify({ transcript: '', error: 'No audio data provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use Gemini Flash via Lovable AI Gateway for Arabic audio transcription
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
                text: `You are an Arabic Quran transcription tool. Transcribe the following audio recording of Quran recitation into Arabic text. Rules:\n- Return ONLY the Arabic text, nothing else\n- No transliteration, no translation, no explanation\n- Include diacritical marks (tashkeel) if audible\n- If you cannot hear any speech, return an empty string\n- Language: ${lang === "ar" ? "Arabic" : lang}`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:audio/webm;base64,${audio}`,
                },
              },
            ],
          },
        ],
        temperature: 0,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`AI Gateway error [${response.status}]: ${errorBody}`);
      throw new Error(`AI Gateway call failed [${response.status}]`);
    }

    const data = await response.json();
    const transcript = data.choices?.[0]?.message?.content?.trim() || '';

    return new Response(JSON.stringify({ transcript }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('STT error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ transcript: '', error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
