import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// In-memory rate limiter (per-instance)
const rateLimits = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(userId: string, maxRequests = 60, windowMs = 60000): boolean {
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
    // Optional auth: use user-based limits when available, otherwise fallback to IP-based limits.
    const authHeader = req.headers.get('Authorization');
    const forwardedFor = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const clientIp = forwardedFor || req.headers.get('x-real-ip') || 'unknown';

    let requesterKey = `anon:${clientIp}`;
    let maxRequests = 20;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        );
        const token = authHeader.replace('Bearer ', '');
        const { data: claimsData } = await supabase.auth.getUser(token);
        if (claimsData?.user?.id) {
          requesterKey = `user:${claimsData.user.id}`;
          maxRequests = 60;
        }
      } catch {
        // Keep anonymous key on auth parse failures
      }
    }

    if (!checkRateLimit(requesterKey, maxRequests)) {
      return new Response(JSON.stringify({ text: '', error: 'Rate limit exceeded' }), {
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
      return new Response(JSON.stringify({ text: '' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (audio.length > MAX_AUDIO_SIZE) {
      return new Response(JSON.stringify({ text: '', error: 'Audio data too large' }), {
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
                text: `Transcribe this short Arabic Quran audio clip. Return ONLY the Arabic words you hear. No explanation, no transliteration. If silence or unclear, return empty string. Language: ${safeLang}`,
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
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`AI Gateway error [${response.status}]: ${errorBody}`);
      throw new Error(`AI Gateway call failed [${response.status}]`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('STT chunk error:', error);
    return new Response(JSON.stringify({ text: '', error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
