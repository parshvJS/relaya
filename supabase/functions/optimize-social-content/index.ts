import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlatformOptimization {
  content: string;
  hashtags: string[];
  mentions: string[];
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    platform: string;
  };
}

const platformSpecs = {
  twitter: {
    maxLength: 280,
    hashtagCount: 3,
    style: 'concise, punchy, direct, uses threads for longer content'
  },
  linkedin: {
    maxLength: 3000,
    hashtagCount: 5,
    style: 'professional, thought leadership, industry-focused, uses line breaks for readability'
  },
  facebook: {
    maxLength: 63206,
    hashtagCount: 2,
    style: 'conversational, engaging, community-focused, storytelling'
  },
  reddit: {
    maxLength: 40000,
    hashtagCount: 0,
    style: 'authentic, community-specific, no promotional language, value-first'
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, platforms } = await req.json();

    if (!content || !platforms || platforms.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Content and at least one platform are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'API configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const optimized: Record<string, PlatformOptimization> = {};

    for (const platform of platforms) {
      const specs = platformSpecs[platform as keyof typeof platformSpecs];
      if (!specs) continue;

      const systemPrompt = `You are an elite social media strategist and SEO specialist. Your task is to optimize content for ${platform.toUpperCase()} distribution.

CRITICAL STYLE MANDATES (ABSOLUTE REQUIREMENTS):
1. ZERO emojis under any circumstances
2. ZERO exclamation marks in main content (one allowed in CTA only if essential)
3. Professional, authoritative tone - boardroom-grade language
4. No AI-sounding phrases like "excited to share", "thrilled to announce", "game-changing"
5. No hyperbole or superlatives without substantiation
6. Clear, direct, factual communication

PLATFORM SPECIFICATIONS FOR ${platform.toUpperCase()}:
- Maximum character length: ${specs.maxLength}
- Recommended hashtag count: ${specs.hashtagCount}
- Platform style: ${specs.style}

OUTPUT FORMAT (JSON):
{
  "content": "The optimized post content, platform-appropriate length and style",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "mentions": ["@relevant_account1", "@industry_leader"],
  "metadata": {
    "title": "SEO-optimized title under 60 characters",
    "description": "Meta description under 160 characters",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
    "platform": "${platform}"
  }
}

HASHTAG GUIDELINES:
- Industry-relevant, trending when applicable
- Mix of broad and niche tags
- No generic tags like #business or #success
- Research-based selection for maximum discoverability

MENTION GUIDELINES:
- Only include if contextually relevant
- Tag industry publications, relevant organizations, or key figures
- Do not fabricate mentions - only suggest if genuinely applicable

METADATA REQUIREMENTS:
- Title optimized for search and click-through
- Description that compels engagement
- Keywords reflecting topic authority`;

      const userPrompt = `Optimize this content for ${platform.toUpperCase()} distribution:

---
${content}
---

Generate the optimized version following all style mandates and platform specifications. Return ONLY valid JSON.`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 2000
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI API error for ${platform}:`, errorText);
        continue;
      }

      const aiData = await response.json();
      const aiResponse = aiData.choices?.[0]?.message?.content;

      if (aiResponse) {
        try {
          // Extract JSON from response
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            optimized[platform] = {
              content: parsed.content || content.substring(0, specs.maxLength),
              hashtags: parsed.hashtags || [],
              mentions: parsed.mentions || [],
              metadata: {
                title: parsed.metadata?.title || '',
                description: parsed.metadata?.description || '',
                keywords: parsed.metadata?.keywords || [],
                platform: platform
              }
            };
          }
        } catch (parseError) {
          console.error(`Parse error for ${platform}:`, parseError);
          // Fallback with basic optimization
          optimized[platform] = {
            content: content.substring(0, specs.maxLength),
            hashtags: [],
            mentions: [],
            metadata: {
              title: content.substring(0, 60),
              description: content.substring(0, 160),
              keywords: [],
              platform: platform
            }
          };
        }
      }
    }

    return new Response(
      JSON.stringify({ optimized }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in optimize-social-content:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
