import { useState, useEffect, useRef } from 'react';
import { Globe, Search, Loader2, AlertCircle, ExternalLink, FileText, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import AIApiClient, { SSEEvent } from '@/lib/aiApiClient';

interface AnalysisResult {
  success: boolean;
  url: string;
  metadata: {
    title?: string;
    description?: string;
    language?: string;
  };
  linksCount: number;
  contentLength: number;
  analysis: string;
}

const UrlAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const outputRef = useRef<string>('');
  const { toast } = useToast();

  // Initialize AI client
  useEffect(() => {
    const init = async () => {
      try {
        await AIApiClient.initialize();
      } catch (error) {
        console.error('Failed to initialize AI client:', error);
      }
    };
    init();
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult('');
    setError(null);
    outputRef.current = '';

    try {
      const prompt = `Perform a comprehensive SEO, LLMO (Large Language Model Optimization), AIO (AI Overviews), and GEO (Generative Engine Optimization) analysis for the following URL:

URL: ${url.trim()}

Please provide:
1. **SEO Analysis**
   - Meta tags evaluation (title, description, keywords)
   - Header structure analysis (H1, H2, etc.)
   - Content quality assessment
   - Internal and external linking
   - Mobile-friendliness
   - Page speed considerations
   - Schema markup recommendations

2. **LLMO (Large Language Model Optimization)**
   - Content optimization for AI language models
   - Natural language processing considerations
   - Question-answer format optimization
   - Entity recognition and linking

3. **AIO (AI Overviews Optimization)**
   - Optimization for Google AI Overviews
   - Featured snippet opportunities
   - People Also Ask optimization
   - AI-friendly content structure

4. **GEO (Generative Engine Optimization)**
   - Content optimization for ChatGPT, Perplexity, Claude
   - Citation-worthy content structure
   - Authoritative source positioning
   - Context-rich content recommendations

5. **Technical Recommendations**
   - Critical issues to fix
   - Quick wins for improvement
   - Long-term optimization strategy
   - Competitive advantages

6. **Content Strategy**
   - Topic gaps and opportunities
   - Keyword optimization recommendations
   - Content freshness suggestions
   - User intent alignment

Provide actionable, specific recommendations for each section.`;

      setLoadingStatus('Creating SEO analysis session...');
      const session = await AIApiClient.createSession(prompt);

      setLoadingStatus('Analyzing URL and generating recommendations...');

      await AIApiClient.startChat(
        { prompt, sessionId: session.sessionid },
        (event: SSEEvent) => {
          if (event.type === 'loadingStatus') {
            setLoadingStatus(event.status || '');
          } else if (event.type === 'finalResponse') {
            if (event.content) {
              outputRef.current += event.content;
              setResult(outputRef.current);
            }
          }
        },
        () => {
          setIsAnalyzing(false);
          setLoadingStatus('');
          toast({
            title: "Analysis Complete",
            description: `Successfully analyzed ${url.trim()}`,
          });
        },
        (error) => {
          setIsAnalyzing(false);
          setLoadingStatus('');
          const errorMessage = error.message || 'Failed to analyze URL';
          setError(errorMessage);
          toast({
            title: "Analysis Failed",
            description: errorMessage,
            variant: "destructive",
          });
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze URL';
      setError(errorMessage);
      setIsAnalyzing(false);
      setLoadingStatus('');
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            URL SEO Analyzer
          </CardTitle>
          <CardDescription>
            Enter any URL to get comprehensive SEO, LLMO, AIO, and GEO optimization recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com or example.com"
                className="pl-10"
                disabled={isAnalyzing}
              />
            </div>
            <Button type="submit" disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </form>

          {/* Loading Status */}
          {isAnalyzing && (
            <div className="mt-6 space-y-3">
              {loadingStatus && (
                <div className="p-3 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm font-medium">{loadingStatus}</span>
                  </div>
                </div>
              )}
              <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium">
                    Processing time: 10-15 minutes for comprehensive SEO analysis
                  </span>
                </div>
              </div>
            </div>
          )}

          {error && !isAnalyzing && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Analysis Failed</p>
                <p className="text-sm text-muted-foreground mt-1">{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {result && !isAnalyzing && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                SEO Analysis Results
              </CardTitle>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {url}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-lg p-6 prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                {result}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UrlAnalyzer;
