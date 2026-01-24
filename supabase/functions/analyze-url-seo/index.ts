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
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!FIRECRAWL_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "Firecrawl connector not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log("Scraping URL:", formattedUrl);

    // Step 1: Scrape the URL with Firecrawl
    const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ["markdown", "html", "links"],
        onlyMainContent: false,
      }),
    });

    const scrapeData = await scrapeResponse.json();

    if (!scrapeResponse.ok || !scrapeData.success) {
      console.error("Firecrawl error:", scrapeData);
      return new Response(
        JSON.stringify({ success: false, error: scrapeData.error || "Failed to scrape URL" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const pageContent = scrapeData.data?.markdown || scrapeData.markdown || "";
    const pageHtml = scrapeData.data?.html || scrapeData.html || "";
    const pageLinks = scrapeData.data?.links || scrapeData.links || [];
    const metadata = scrapeData.data?.metadata || scrapeData.metadata || {};

    console.log("Scraped content length:", pageContent.length);

    // Step 2: Analyze with AI for SEO optimization - Publicist-grade precision
    const analysisPrompt = `You function as a senior-level search optimization strategist delivering SEO, LLMO (Large Language Model Optimization), AIO (AI Overviews), and GEO (Generative Engine Optimization) analysis.

CRITICAL STYLE MANDATES:
- NEVER use emojis, emoticons, or decorative symbols of any kind
- NEVER use casual, colloquial, or AI-sounding language (avoid: "dive into," "explore," "exciting," "amazing," "powerful," "game-changing," "leverage," "utilize," "delve," "crucial," "robust," "seamless," "cutting-edge")
- Write with the precision and authority of a senior communications director at a Fortune 100 firm
- Every sentence must be direct, substantive, and actionable
- Favor active voice, concrete nouns, and specific data over vague descriptors
- Section headers use uppercase text only—no symbols or decorative elements

Analyze this webpage and generate comprehensive optimization recommendations:

URL: ${formattedUrl}
Current Title: ${metadata.title || "Not found"}
Current Description: ${metadata.description || "Not found"}
Language: ${metadata.language || "Unknown"}
Links Found: ${pageLinks.length}

PAGE CONTENT:
${pageContent.substring(0, 15000)}

ANALYSIS FRAMEWORK:

1. CURRENT STATE ASSESSMENT: Evaluate existing SEO elements, content quality, E-E-A-T signals
2. MULTI-ALGORITHM OPTIMIZATION: Target Traditional SEO, LLMO, AIO, and GEO simultaneously
3. SEARCH INTENT ANALYSIS: Identify primary and secondary intents
4. COMPETITIVE POSITIONING: Suggest differentiation strategies

GENERATE ALL OUTPUTS:

SECTION 1: BASIC METADATA - OPTIMIZED RECOMMENDATIONS

PAGE TITLE (50-60 characters):
Optimized title with primary keyword front-loaded

META DESCRIPTION (150-160 characters):
Compelling description with keywords, value proposition, and call-to-action

KEYWORDS AND TAGS (20 tags):
Comma-separated relevant terms extracted from content

PRIMARY KEYWORDS (20-25 terms):
Bullet list with indicators: [HIGH] for high priority, [MED] for medium, [OPP] for opportunity

LONG-TAIL KEYWORD PHRASES (20 phrases):
Natural language, 3-6 words each

CONVERSATIONAL SEARCH QUERIES (15 questions):
Voice search and AI assistant optimized

SEMANTIC ENTITIES (10 entities):
Named entities for knowledge graph alignment

SEARCH INTENT CLASSIFICATION:
Primary and secondary intents with user journey stage

SECTION 2: ADVANCED SCHEMA MARKUP

Generate complete, valid JSON-LD with @graph structure:
- Auto-detected @type based on page content
- FAQPage with 8-10 Q&A pairs derived from content
- BreadcrumbList
- Organization/Person with credentials
- datePublished: ${new Date().toISOString().split('T')[0]}
- All relevant Schema.org properties

SECTION 3: CONTENT OPTIMIZATION BLUEPRINT

PRIORITY 1 - FAQ SECTION:
10-12 Q&A pairs based on page content, optimized for featured snippets

PRIORITY 2 - NUMERIC DATA CALLOUTS:
5 statistics or metrics found or suggested

PRIORITY 3 - COMPARISON TABLES:
Structured comparison if applicable

PRIORITY 4 - HEADING OPTIMIZATION:
Current to optimized heading mappings

PRIORITY 5 - STRUCTURED LISTS:
Key benefits and features as bullet points

PRIORITY 6 - AUTHORITY SIGNALS:
E-E-A-T enhancement recommendations

PRIORITY 7 - INTERNAL LINKING:
10 anchor text recommendations

SECTION 4: AI SEARCH TARGETS

FEATURED SNIPPET OPPORTUNITIES:
5 queries with snippet type (paragraph/list/table)

GOOGLE AI OVERVIEW TARGETS:
5 queries for SGE inclusion

CHATGPT AND CLAUDE PATTERNS:
5 conversational queries

PERPLEXITY AND AI SEARCH:
5 research-style queries

VOICE SEARCH OPTIMIZATION:
5 natural spoken queries

SECTION 5: ISSUES AND RECOMMENDATIONS

CRITICAL ISSUES: List any major SEO problems found
WARNINGS: List moderate issues
OPPORTUNITIES: List quick wins and improvements

IMPLEMENTATION ROADMAP:
Prioritized steps with time estimates

PROJECTED OUTCOMES:
30/60/90 day projections with specific metrics`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a senior search optimization strategist providing actionable, production-ready recommendations. Write with precision and authority. Never use emojis, casual language, or AI-sounding phrases. Every recommendation must be specific, measurable, and immediately actionable." },
          { role: "user", content: analysisPrompt },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);

      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "AI credits depleted. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error("Failed to analyze content");
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices?.[0]?.message?.content || "Analysis failed";

    return new Response(
      JSON.stringify({
        success: true,
        url: formattedUrl,
        metadata,
        linksCount: pageLinks.length,
        contentLength: pageContent.length,
        analysis,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Analysis failed";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
