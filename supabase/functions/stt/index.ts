import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// In-memory rate limiter (per-instance)
const rateLimits = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(userId: string, maxRequests = 30, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimits.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const ALLOWED_LANGS = ['ar', 'en', 'fr'];
const MAX_AUDIO_SIZE = 10 * 1024 * 1024 * 4 / 3; // ~10MB base64

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check – require authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ transcript: '', error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(JSON.stringify({ transcript: '', error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!checkRateLimit(claimsData.user.id)) {
      return new Response(JSON.stringify({ transcript: '', error: 'Rate limit exceeded' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { audio, lang = "ar" } = await req.json();

    // Input validation
    if (!audio || typeof audio !== 'string') {
      return new Response(JSON.stringify({ transcript: '', error: 'No audio data provided' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (audio.length > MAX_AUDIO_SIZE) {
      return new Response(JSON.stringify({ transcript: '', error: 'Audio data too large' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const safeLang = ALLOWED_LANGS.includes(lang) ? lang : 'ar';

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
                text: `You are an Arabic Quran transcription tool. Transcribe the following audio recording of Quran recitation into Arabic text. Rules:\n- Return ONLY the Arabic text, nothing else\n- No transliteration, no translation, no explanation\n- Include diacritical marks (tashkeel) if audible\n- If you cannot hear any speech, return an empty string\n- Language: ${safeLang === "ar" ? "Arabic" : safeLang}`,
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
    return new Response(JSON.stringify({ transcript: '', error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
