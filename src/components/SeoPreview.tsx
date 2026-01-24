import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Copy, Check, FileCode, Tags, FileText, Target, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface SeoPreviewProps {
  content: string;
}

interface ParsedSection {
  title: string;
  content: string;
  icon: React.ReactNode;
}

// Syntax highlighting for JSON/JSON-LD
const SyntaxHighlightedCode = ({ code }: { code: string }) => {
  const highlightedCode = useMemo(() => {
    // Clean up the code - remove HTML script tags if present
    let cleanCode = code
      .replace(/<script[^>]*>/gi, '')
      .replace(/<\/script>/gi, '')
      .trim();

    // Try to parse and re-format JSON for consistent display
    try {
      const parsed = JSON.parse(cleanCode);
      cleanCode = JSON.stringify(parsed, null, 2);
    } catch {
      // If it's not valid JSON, use as-is
    }

    // Tokenize and highlight
    const tokens: { type: string; value: string }[] = [];
    let remaining = cleanCode;
    
    while (remaining.length > 0) {
      // Match strings (including escaped quotes)
      const stringMatch = remaining.match(/^"(?:[^"\\]|\\.)*"/);
      if (stringMatch) {
        const value = stringMatch[0];
        // Check if this looks like a URL
        const isUrl = /^"https?:\/\//.test(value);
        // Check if this is a property key (followed by :)
        const afterMatch = remaining.slice(value.length).match(/^\s*:/);
        const isKey = afterMatch !== null;
        
        tokens.push({ 
          type: isKey ? 'key' : isUrl ? 'url' : 'string', 
          value 
        });
        remaining = remaining.slice(value.length);
        continue;
      }

      // Match numbers
      const numberMatch = remaining.match(/^-?\d+\.?\d*(?:[eE][+-]?\d+)?/);
      if (numberMatch) {
        tokens.push({ type: 'number', value: numberMatch[0] });
        remaining = remaining.slice(numberMatch[0].length);
        continue;
      }

      // Match keywords (true, false, null)
      const keywordMatch = remaining.match(/^(true|false|null)\b/);
      if (keywordMatch) {
        tokens.push({ type: 'keyword', value: keywordMatch[0] });
        remaining = remaining.slice(keywordMatch[0].length);
        continue;
      }

      // Match brackets and braces
      const bracketMatch = remaining.match(/^[\[\]{}]/);
      if (bracketMatch) {
        tokens.push({ type: 'bracket', value: bracketMatch[0] });
        remaining = remaining.slice(1);
        continue;
      }

      // Match punctuation (: ,)
      const punctMatch = remaining.match(/^[,:]/);
      if (punctMatch) {
        tokens.push({ type: 'punctuation', value: punctMatch[0] });
        remaining = remaining.slice(1);
        continue;
      }

      // Match whitespace
      const wsMatch = remaining.match(/^\s+/);
      if (wsMatch) {
        tokens.push({ type: 'whitespace', value: wsMatch[0] });
        remaining = remaining.slice(wsMatch[0].length);
        continue;
      }

      // Fallback: take one character
      tokens.push({ type: 'text', value: remaining[0] });
      remaining = remaining.slice(1);
    }

    return tokens;
  }, [code]);

  const getClassName = (type: string) => {
    switch (type) {
      case 'key':
        return 'text-primary font-medium';
      case 'string':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'url':
        return 'text-blue-600 dark:text-blue-400';
      case 'number':
        return 'text-amber-600 dark:text-amber-400';
      case 'keyword':
        return 'text-purple-600 dark:text-purple-400 font-medium';
      case 'bracket':
        return 'text-muted-foreground font-bold';
      case 'punctuation':
        return 'text-muted-foreground';
      default:
        return 'text-foreground';
    }
  };

  return (
    <pre className="text-sm font-mono leading-relaxed overflow-x-auto">
      {highlightedCode.map((token, i) => (
        <span key={i} className={getClassName(token.type)}>
          {token.value}
        </span>
      ))}
    </pre>
  );
};

const CollapsibleSection = ({ 
  title, 
  content, 
  defaultOpen = false,
  isSchema = false
}: { 
  title: string; 
  content: string; 
  defaultOpen?: boolean;
  isSchema?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast({ title: 'Copied!', description: 'Section copied to clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden mb-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
          <span className="font-medium text-sm text-foreground">{title}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCopy}
          className="h-7 px-2"
        >
          {copied ? (
            <Check className="w-3 h-3 text-primary" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>
      </button>
      {isOpen && (
        <div className="p-4 bg-background border-t border-border overflow-x-auto">
          {isSchema ? (
            <SyntaxHighlightedCode code={content} />
          ) : (
            <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
              {content}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

const SeoPreview = ({ content }: SeoPreviewProps) => {
  const { toast } = useToast();

  // Parse the content into sections
  const parseContent = (rawContent: string): {
    metadata: ParsedSection[];
    schema: ParsedSection[];
    optimization: ParsedSection[];
    aiTargets: ParsedSection[];
    fullContent: string;
  } => {
    const sections = {
      metadata: [] as ParsedSection[],
      schema: [] as ParsedSection[],
      optimization: [] as ParsedSection[],
      aiTargets: [] as ParsedSection[],
      fullContent: rawContent,
    };

    // Extract BASIC METADATA section (supports both emoji and SECTION formats)
    const metadataMatch = rawContent.match(/(?:📋\s*\*?\*?BASIC METADATA|SECTION 1[:\s]*BASIC METADATA).*?[\s\S]*?(?=💻|🎯|📊|SECTION 2|$)/i);
    if (metadataMatch) {
      const metaContent = metadataMatch[0];
      
      // Extract individual metadata fields
      const titleMatch = metaContent.match(/\*?\*?PAGE TITLE\*?\*?.*?(?:\(.*?\))?:?([\s\S]*?)(?=\*?\*?META DESCRIPTION|$)/i);
      const descMatch = metaContent.match(/\*?\*?META DESCRIPTION\*?\*?.*?(?:\(.*?\))?:?([\s\S]*?)(?=\*?\*?KEYWORDS|$)/i);
      const keywordsMatch = metaContent.match(/\*?\*?KEYWORDS\s*(?:AND\s*)?(?:\/)?TAGS\*?\*?.*?(?:\(.*?\))?:?([\s\S]*?)(?=\*?\*?PRIMARY KEYWORDS|$)/i);
      const primaryKwMatch = metaContent.match(/\*?\*?PRIMARY KEYWORDS\*?\*?.*?(?:\(.*?\))?:?([\s\S]*?)(?=\*?\*?LONG-TAIL|$)/i);
      const longTailMatch = metaContent.match(/\*?\*?LONG-TAIL.*?\*?\*?.*?(?:\(.*?\))?:?([\s\S]*?)(?=\*?\*?CONVERSATIONAL|$)/i);
      const convMatch = metaContent.match(/\*?\*?CONVERSATIONAL.*?\*?\*?.*?(?:\(.*?\))?:?([\s\S]*?)(?=\*?\*?SEMANTIC|WHERE TO PASTE|SEARCH INTENT|$)/i);
      const semanticMatch = metaContent.match(/\*?\*?SEMANTIC ENTITIES\*?\*?.*?(?:\(.*?\))?:?([\s\S]*?)(?=WHERE TO PASTE|SEARCH INTENT|SECTION|$)/i);
      const intentMatch = metaContent.match(/\*?\*?SEARCH INTENT.*?\*?\*?:?([\s\S]*?)(?=SECTION|$)/i);

      if (titleMatch) sections.metadata.push({ title: 'Page Title', content: titleMatch[1].trim(), icon: <Tags className="w-4 h-4" /> });
      if (descMatch) sections.metadata.push({ title: 'Meta Description', content: descMatch[1].trim(), icon: <FileText className="w-4 h-4" /> });
      if (keywordsMatch) sections.metadata.push({ title: 'Keywords and Tags', content: keywordsMatch[1].trim(), icon: <Tags className="w-4 h-4" /> });
      if (primaryKwMatch) sections.metadata.push({ title: 'Primary Keywords', content: primaryKwMatch[1].trim(), icon: <Tags className="w-4 h-4" /> });
      if (longTailMatch) sections.metadata.push({ title: 'Long-Tail Keywords', content: longTailMatch[1].trim(), icon: <Tags className="w-4 h-4" /> });
      if (convMatch) sections.metadata.push({ title: 'Conversational Queries', content: convMatch[1].trim(), icon: <Target className="w-4 h-4" /> });
      if (semanticMatch) sections.metadata.push({ title: 'Semantic Entities', content: semanticMatch[1].trim(), icon: <Sparkles className="w-4 h-4" /> });
      if (intentMatch) sections.metadata.push({ title: 'Search Intent Classification', content: intentMatch[1].trim(), icon: <Target className="w-4 h-4" /> });
    }

    // Extract SCHEMA section (supports both emoji and SECTION formats)
    const schemaMatch = rawContent.match(/(?:💻\s*\*?\*?ADVANCED SCHEMA|SECTION 2[:\s]*ADVANCED SCHEMA).*?[\s\S]*?(?=🎯|📊|SECTION 3|IMPLEMENTATION|EXPECTED|$)/i);
    if (schemaMatch) {
      const schemaContent = schemaMatch[0];
      const jsonMatch = schemaContent.match(/```(?:html|json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        sections.schema.push({ 
          title: 'JSON-LD Schema', 
          content: jsonMatch[1].trim(), 
          icon: <FileCode className="w-4 h-4" /> 
        });
      }
    }

    // Extract CONTENT OPTIMIZATION section (supports both emoji and SECTION formats)
    const optimizationMatch = rawContent.match(/(?:🎯\s*\*?\*?CONTENT OPTIMIZATION|SECTION 3[:\s]*CONTENT OPTIMIZATION).*?[\s\S]*?(?=📊|💻|SECTION 4|IMPLEMENTATION|EXPECTED|OUTPUT|$)/i);
    if (optimizationMatch) {
      const optContent = optimizationMatch[0];
      
      // Extract priorities (supports both "PRIORITY X:" and "PRIORITY X -" formats)
      const faqMatch = optContent.match(/\*?\*?PRIORITY 1[\s:-]+(?:FAQ)?.*?\*?\*?([\s\S]*?)(?=\*?\*?PRIORITY 2|$)/i);
      const statsMatch = optContent.match(/\*?\*?PRIORITY 2[\s:-]+(?:Numeric)?.*?\*?\*?([\s\S]*?)(?=\*?\*?PRIORITY 3|$)/i);
      const tableMatch = optContent.match(/\*?\*?PRIORITY 3[\s:-]+(?:Comparison)?.*?\*?\*?([\s\S]*?)(?=\*?\*?PRIORITY 4|$)/i);
      const headingsMatch = optContent.match(/\*?\*?PRIORITY 4[\s:-]+(?:Heading|Optimized)?.*?\*?\*?([\s\S]*?)(?=\*?\*?PRIORITY 5|$)/i);
      const listsMatch = optContent.match(/\*?\*?PRIORITY 5[\s:-]+(?:Structured)?.*?\*?\*?([\s\S]*?)(?=\*?\*?PRIORITY 6|$)/i);
      const aboutMatch = optContent.match(/\*?\*?PRIORITY 6[\s:-]+(?:Expert|Authority|About)?.*?\*?\*?([\s\S]*?)(?=\*?\*?PRIORITY 7|$)/i);
      const linksMatch = optContent.match(/\*?\*?PRIORITY 7[\s:-]+(?:Internal|Linking)?.*?\*?\*?([\s\S]*?)(?=OUTPUT|SECTION|IMPLEMENTATION|EXPECTED|$)/i);

      if (faqMatch) sections.optimization.push({ title: 'FAQ Section', content: faqMatch[1].trim(), icon: <FileText className="w-4 h-4" /> });
      if (statsMatch) sections.optimization.push({ title: 'Numeric Data Callouts', content: statsMatch[1].trim(), icon: <Target className="w-4 h-4" /> });
      if (tableMatch) sections.optimization.push({ title: 'Comparison Tables', content: tableMatch[1].trim(), icon: <FileText className="w-4 h-4" /> });
      if (headingsMatch) sections.optimization.push({ title: 'Heading Optimization', content: headingsMatch[1].trim(), icon: <Tags className="w-4 h-4" /> });
      if (listsMatch) sections.optimization.push({ title: 'Structured Lists', content: listsMatch[1].trim(), icon: <FileText className="w-4 h-4" /> });
      if (aboutMatch) sections.optimization.push({ title: 'Authority Signals', content: aboutMatch[1].trim(), icon: <FileText className="w-4 h-4" /> });
      if (linksMatch) sections.optimization.push({ title: 'Internal Linking', content: linksMatch[1].trim(), icon: <Target className="w-4 h-4" /> });
    }

    // Extract AI TARGETS section (supports both emoji and SECTION formats)
    const aiMatch = rawContent.match(/(?:📊\s*\*?\*?AI SEARCH TARGETS|SECTION 4[:\s]*AI SEARCH TARGETS).*?[\s\S]*?(?=SECTION 5|IMPLEMENTATION|EXPECTED|OUTPUT|$)/i);
    if (aiMatch) {
      sections.aiTargets.push({ 
        title: 'AI Search Targets', 
        content: aiMatch[0].trim(), 
        icon: <Sparkles className="w-4 h-4" /> 
      });
    }

    // Also check for individual AI target subsections
    const featuredMatch = rawContent.match(/FEATURED SNIPPET OPPORTUNITIES:?([\s\S]*?)(?=GOOGLE AI|CHATGPT|PERPLEXITY|VOICE|KNOWLEDGE|SECTION|$)/i);
    const googleMatch = rawContent.match(/GOOGLE AI OVERVIEW.*?:?([\s\S]*?)(?=CHATGPT|PERPLEXITY|VOICE|KNOWLEDGE|SECTION|$)/i);
    const chatgptMatch = rawContent.match(/CHATGPT.*?(?:AND\s*)?(?:CLAUDE)?.*?:?([\s\S]*?)(?=PERPLEXITY|VOICE|KNOWLEDGE|SECTION|$)/i);
    const perplexityMatch = rawContent.match(/PERPLEXITY.*?(?:AND\s*)?(?:AI\s*)?SEARCH.*?:?([\s\S]*?)(?=VOICE|KNOWLEDGE|SECTION|$)/i);
    const voiceMatch = rawContent.match(/VOICE SEARCH.*?:?([\s\S]*?)(?=KNOWLEDGE|SECTION|ISSUES|IMPLEMENTATION|$)/i);

    if (sections.aiTargets.length === 0) {
      if (featuredMatch) sections.aiTargets.push({ title: 'Featured Snippets', content: featuredMatch[1].trim(), icon: <Target className="w-4 h-4" /> });
      if (googleMatch) sections.aiTargets.push({ title: 'Google AI Overview', content: googleMatch[1].trim(), icon: <Sparkles className="w-4 h-4" /> });
      if (chatgptMatch) sections.aiTargets.push({ title: 'ChatGPT and Claude', content: chatgptMatch[1].trim(), icon: <Sparkles className="w-4 h-4" /> });
      if (perplexityMatch) sections.aiTargets.push({ title: 'Perplexity and AI Search', content: perplexityMatch[1].trim(), icon: <Sparkles className="w-4 h-4" /> });
      if (voiceMatch) sections.aiTargets.push({ title: 'Voice Search', content: voiceMatch[1].trim(), icon: <Target className="w-4 h-4" /> });
    }

    // Extract Issues and Recommendations section
    const issuesMatch = rawContent.match(/(?:📈\s*)?(?:SECTION 5[:\s]*)?ISSUES.*?(?:AND\s*)?RECOMMENDATIONS.*?[\s\S]*?(?=IMPLEMENTATION|PROJECTED|EXPECTED|$)/i);
    if (issuesMatch) {
      sections.aiTargets.push({
        title: 'Issues and Recommendations',
        content: issuesMatch[0].trim(),
        icon: <Target className="w-4 h-4" />
      });
    }

    return sections;
  };

  const sections = parseContent(content);
  const hasStructuredContent = sections.metadata.length > 0 || sections.schema.length > 0 || sections.optimization.length > 0;

  const copyAll = (sectionContent: ParsedSection[]) => {
    const text = sectionContent.map(s => `${s.title}:\n${s.content}`).join('\n\n');
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'All section content copied to clipboard.' });
  };

  if (!hasStructuredContent) {
    // Fallback to plain text display if parsing didn't find structured content
    return (
      <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
        {content}
      </div>
    );
  }

  return (
    <Tabs defaultValue="metadata" className="w-full">
      <TabsList className="w-full grid grid-cols-5 mb-4">
        <TabsTrigger value="metadata" className="text-xs">
          <Tags className="w-3 h-3 mr-1" />
          Metadata
        </TabsTrigger>
        <TabsTrigger value="schema" className="text-xs">
          <FileCode className="w-3 h-3 mr-1" />
          Schema
        </TabsTrigger>
        <TabsTrigger value="optimization" className="text-xs">
          <Target className="w-3 h-3 mr-1" />
          Content
        </TabsTrigger>
        <TabsTrigger value="ai" className="text-xs">
          <Sparkles className="w-3 h-3 mr-1" />
          AI
        </TabsTrigger>
        <TabsTrigger value="full" className="text-xs">
          <FileText className="w-3 h-3 mr-1" />
          Full
        </TabsTrigger>
      </TabsList>

      <TabsContent value="metadata" className="mt-0">
        {sections.metadata.length > 0 ? (
          <div>
            <div className="flex justify-end mb-2">
              <Button variant="outline" size="sm" onClick={() => copyAll(sections.metadata)}>
                <Copy className="w-3 h-3 mr-1" /> Copy All
              </Button>
            </div>
            {sections.metadata.map((section, i) => (
              <CollapsibleSection 
                key={i} 
                title={section.title} 
                content={section.content}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No metadata found in output.</p>
        )}
      </TabsContent>

      <TabsContent value="schema" className="mt-0">
        {sections.schema.length > 0 ? (
          <div>
            <div className="flex justify-end mb-2">
              <Button variant="outline" size="sm" onClick={() => copyAll(sections.schema)}>
                <Copy className="w-3 h-3 mr-1" /> Copy Schema
              </Button>
            </div>
            {sections.schema.map((section, i) => (
              <CollapsibleSection 
                key={i} 
                title={section.title} 
                content={section.content}
                defaultOpen={true}
                isSchema={true}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No schema markup found in output.</p>
        )}
      </TabsContent>

      <TabsContent value="optimization" className="mt-0">
        {sections.optimization.length > 0 ? (
          <div>
            <div className="flex justify-end mb-2">
              <Button variant="outline" size="sm" onClick={() => copyAll(sections.optimization)}>
                <Copy className="w-3 h-3 mr-1" /> Copy All
              </Button>
            </div>
            {sections.optimization.map((section, i) => (
              <CollapsibleSection 
                key={i} 
                title={section.title} 
                content={section.content}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No content optimization found in output.</p>
        )}
      </TabsContent>

      <TabsContent value="ai" className="mt-0">
        {sections.aiTargets.length > 0 ? (
          <div>
            <div className="flex justify-end mb-2">
              <Button variant="outline" size="sm" onClick={() => copyAll(sections.aiTargets)}>
                <Copy className="w-3 h-3 mr-1" /> Copy All
              </Button>
            </div>
            {sections.aiTargets.map((section, i) => (
              <CollapsibleSection 
                key={i} 
                title={section.title} 
                content={section.content}
                defaultOpen={true}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">No AI search targets found in output.</p>
        )}
      </TabsContent>

      <TabsContent value="full" className="mt-0">
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground bg-muted/20 rounded-lg p-4 max-h-[500px] overflow-y-auto">
          {content}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default SeoPreview;
