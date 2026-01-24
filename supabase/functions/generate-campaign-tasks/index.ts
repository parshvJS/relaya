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
    const { campaignName, campaignType, startDate, endDate, objectives, channels } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `Generate a detailed task timeline for a PR campaign with the following details:

CAMPAIGN: ${campaignName}
TYPE: ${campaignType}
START DATE: ${startDate}
END DATE: ${endDate}
OBJECTIVES: ${objectives || 'General campaign objectives'}
CHANNELS: ${channels?.join(', ') || 'Multiple channels'}

Generate 8-12 specific, actionable tasks that cover the full campaign lifecycle. Tasks should be distributed across the timeline from start to end date.

Return a JSON array of tasks with this structure:
[
  {
    "id": "unique-id",
    "title": "Task title",
    "dueDate": "YYYY-MM-DD",
    "status": "pending"
  }
]

Include tasks for:
- Strategy and planning phase
- Content creation
- Media preparation
- Distribution and outreach
- Monitoring and optimization
- Post-campaign analysis

Return ONLY the JSON array, no additional text.`;

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
            content: "You are a PR campaign strategist. Generate realistic, actionable task timelines for campaigns. Return only valid JSON arrays." 
          },
          { role: "user", content: prompt }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate campaign tasks");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content generated");
    }

    // Parse the JSON response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Invalid response format");
    }

    const tasks = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ tasks }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-campaign-tasks:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
