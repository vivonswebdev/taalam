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
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ results: [], error: 'Unauthorized' }), {
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
      return new Response(JSON.stringify({ results: [], error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { audio, scope } = await req.json();

    if (!audio) {
      return new Response(JSON.stringify({ error: 'No audio data provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Transcribe the audio
    const transcribeRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Transcribe this Arabic Quran audio clip. Return ONLY the Arabic words you hear, nothing else. No explanation, no transliteration. If silence or unclear, return empty string.`,
            },
            {
              type: 'image_url',
              image_url: { url: `data:audio/webm;base64,${audio}` },
            },
          ],
        }],
        temperature: 0,
        max_tokens: 500,
      }),
    });

    if (!transcribeRes.ok) {
      const err = await transcribeRes.text();
      console.error(`Transcription error [${transcribeRes.status}]: ${err}`);
      throw new Error(`Transcription failed [${transcribeRes.status}]`);
    }

    const transcribeData = await transcribeRes.json();
    const transcript = transcribeData.choices?.[0]?.message?.content?.trim() || '';

    if (!transcript) {
      return new Response(JSON.stringify({ results: [], transcript: '' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 2: Identify ayah
    const scopeHint = scope?.type === 'surah' ? `The recitation is from Surah number ${scope.surah}.`
      : scope?.type === 'juz' ? `The recitation is from Juz ${scope.juz}.`
      : 'The recitation could be from anywhere in the Quran.';

    const identifyRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{
          role: 'user',
          content: `You are a Quran expert. Given this Arabic transcription of a Quran recitation, identify which surah and ayah it belongs to.

Transcription: "${transcript}"

${scopeHint}

Return a JSON array of up to 3 most likely matches, ordered by confidence (highest first).
Each object must have:
- surahNumber (integer 1-114)
- ayahNumber (integer, the verse number within the surah)
- surahNameArabic (string, Arabic name of the surah)
- surahNameEnglish (string, English transliteration)  
- ayahText (string, the full Arabic text of the identified ayah)
- confidence (number 0-100, how confident you are)

Return ONLY the JSON array, no markdown, no explanation.
Example: [{"surahNumber":1,"ayahNumber":2,"surahNameArabic":"الفاتحة","surahNameEnglish":"Al-Fatiha","ayahText":"ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ","confidence":95}]`,
        }],
        temperature: 0,
        max_tokens: 1000,
      }),
    });

    if (!identifyRes.ok) {
      const err = await identifyRes.text();
      console.error(`Identification error [${identifyRes.status}]: ${err}`);
      throw new Error(`Identification failed [${identifyRes.status}]`);
    }

    const identifyData = await identifyRes.json();
    let rawContent = identifyData.choices?.[0]?.message?.content?.trim() || '[]';
    rawContent = rawContent.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    
    let results = [];
    try {
      results = JSON.parse(rawContent);
      if (!Array.isArray(results)) results = [results];
    } catch {
      console.error('Failed to parse identification result:', rawContent);
      results = [];
    }

    return new Response(JSON.stringify({ results, transcript }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('find-ayah error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ results: [], error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
