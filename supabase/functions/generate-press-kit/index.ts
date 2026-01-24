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
    const { pressKitData } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Generate a comprehensive, professional press kit document for the following company. The output must be enterprise-grade, suitable for distribution to journalists and media outlets.

COMPANY INFORMATION:
- Company Name: ${pressKitData.companyName}
- Tagline: ${pressKitData.tagline || 'N/A'}
- Boilerplate: ${pressKitData.boilerplate}
- Founded: ${pressKitData.foundedYear || 'N/A'}
- Headquarters: ${pressKitData.headquarters || 'N/A'}
- Industry: ${pressKitData.industry || 'N/A'}
- Employees: ${pressKitData.employees || 'N/A'}
- Funding: ${pressKitData.funding || 'N/A'}
- Website: ${pressKitData.website || 'N/A'}

EXECUTIVE INFORMATION:
- Name: ${pressKitData.executiveName || 'N/A'}
- Title: ${pressKitData.executiveTitle || 'N/A'}
- Bio: ${pressKitData.executiveBio || 'N/A'}

PRODUCTS & ACHIEVEMENTS:
- Key Products/Services: ${pressKitData.keyProducts || 'N/A'}
- Achievements: ${pressKitData.achievements || 'N/A'}

MEDIA CONTACT:
- Contact: ${pressKitData.mediaContact || 'N/A'}
- Email: ${pressKitData.mediaEmail || 'N/A'}
- Phone: ${pressKitData.mediaPhone || 'N/A'}

CRITICAL STYLE MANDATES:
1. NO emojis or symbols whatsoever
2. NO AI-sounding phrases like "I'm excited", "delighted", "thrilled", "game-changer", "leverage", "synergy"
3. Professional, authoritative, boardroom-grade language only
4. Clear section headers using all caps
5. Factual, objective tone throughout
6. Precise, actionable language
7. No hyperbole or marketing fluff

Generate the press kit with the following sections:
1. COMPANY OVERVIEW - Expanded boilerplate with company positioning
2. KEY FACTS - Bullet-pointed company facts (founded, HQ, employees, funding, etc.)
3. EXECUTIVE BIOGRAPHY - Professional bio for the executive
4. PRODUCTS AND SERVICES - Description of key offerings
5. MILESTONES AND ACHIEVEMENTS - Notable accomplishments
6. COMPANY DIFFERENTIATORS - What sets the company apart
7. MEDIA CONTACT INFORMATION - Contact details for press inquiries
8. BOILERPLATE - Standard company description for press use`;

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
            content: "You are an elite corporate communications professional creating press kit materials. Your output must be impeccable, free of AI-sounding language, and suitable for Fortune 500 distribution. Never use emojis or casual language." 
          },
          { role: "user", content: prompt }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate press kit content");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated");
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-press-kit:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
