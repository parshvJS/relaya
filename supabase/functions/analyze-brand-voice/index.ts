import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sampleContent } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Analyze the following sample content and extract a comprehensive brand voice profile. Be precise and specific.

SAMPLE CONTENT:
${sampleContent}

Analyze and return a JSON object with the following structure:
{
  "tone": "A 1-2 sentence description of the overall tone (e.g., 'Confident and authoritative with measured optimism')",
  "vocabulary": ["word1", "word2", "word3", "word4", "word5"] // 5 characteristic words frequently used
  "sentenceStructure": "Description of typical sentence patterns (e.g., 'Complex sentences with subordinate clauses, average 15-20 words')",
  "keyPhrases": ["phrase1", "phrase2", "phrase3"] // 3-5 signature phrases or expressions
  "avoidPhrases": ["phrase1", "phrase2", "phrase3"] // 3-5 phrases this voice would never use
  "writingStyle": "Description of the writing style (e.g., 'Data-driven with strong emphasis on quantifiable outcomes')",
  "formalityLevel": "Description of formality (e.g., 'Professional but accessible, avoids jargon')",
  "recommendations": ["rec1", "rec2", "rec3"] // 3-5 actionable recommendations for maintaining this voice
}

Return ONLY the JSON object, no additional text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { 
            role: "system", 
            content: "You are a linguistics and brand voice expert. Analyze writing samples to extract precise brand voice profiles. Return only valid JSON." 
          },
          { role: "user", content: prompt }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to analyze brand voice");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated");
    }

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format");
    }

    const profile = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ profile }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-brand-voice:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
