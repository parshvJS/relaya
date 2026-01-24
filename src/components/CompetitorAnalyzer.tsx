import { useState, useEffect, useRef } from 'react';
import { Plus, X, Loader2, AlertCircle, Trophy, TrendingUp, Target, BarChart3, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import AIApiClient, { SSEEvent } from '@/lib/aiApiClient';

interface AnalysisResult {
  url: string;
  success: boolean;
  error?: string;
  metadata?: {
    title?: string;
    description?: string;
    language?: string;
  };
  linksCount?: number;
  contentLength?: number;
  analysis?: string;
}

const CompetitorAnalyzer = () => {
  const [urls, setUrls] = useState<string[]>(['', '']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
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

  const addUrl = () => {
    if (urls.length < 5) {
      setUrls([...urls, '']);
    }
  };

  const removeUrl = (index: number) => {
    if (urls.length > 2) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleAnalyze = async () => {
    const validUrls = urls.filter(url => url.trim());

    if (validUrls.length < 2) {
      toast({
        title: "More URLs Required",
        description: "Please enter at least 2 URLs to compare.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult('');
    outputRef.current = '';

    try {
      const urlList = validUrls.map((url, idx) => `${idx + 1}. ${url.trim()}`).join('\n');

      const prompt = `Perform a comprehensive competitive analysis comparing the following ${validUrls.length} competitor websites:

${urlList}

Please provide a detailed competitive analysis including:

1. **Overview Comparison**
   - Brief description of each competitor
   - Primary target audience
   - Key value propositions
   - Market positioning

2. **SEO & Content Strategy Comparison**
   - Content quality and depth
   - Keyword targeting strategies
   - Content freshness and update frequency
   - On-page SEO implementation
   - Meta tags and schema markup

3. **Technical SEO Comparison**
   - Page speed and performance
   - Mobile optimization
   - Site structure and navigation
   - Internal linking strategy
   - Technical implementation quality

4. **Competitive Strengths & Weaknesses**
   For each competitor:
   - Top 3 strengths
   - Top 3 weaknesses
   - Unique differentiators
   - Areas of vulnerability

5. **Market Opportunities**
   - Content gaps to exploit
   - Keyword opportunities
   - Areas where competitors are weak
   - Differentiation strategies

6. **Recommendations**
   - How to outrank each competitor
   - Quick wins and long-term strategies
   - Content topics to prioritize
   - Technical improvements needed

7. **Competitive Scoring** (Rate each on scale of 1-10)
   - Overall SEO strength
   - Content quality
   - Technical implementation
   - User experience
   - Brand authority

Format the output with clear sections and actionable insights for each competitor.`;

      setLoadingStatus('Creating competitive analysis session...');
      const session = await AIApiClient.createSession(prompt);

      setLoadingStatus('Analyzing competitors and generating comparison...');

      await AIApiClient.startChat(
        { prompt, sessionId: session.sessionid },
        (event: SSEEvent) => {
          if (event.type === 'loadingStatus') {
            setLoadingStatus(event.status || '');
          } else if (event.type === 'finalResponse') {
            if (event.content) {
              outputRef.current += event.content;
              setAnalysisResult(outputRef.current);
            }
          }
        },
        () => {
          setIsAnalyzing(false);
          setLoadingStatus('');
          toast({
            title: "Analysis Complete",
            description: `Successfully analyzed ${validUrls.length} competitors`,
          });
        },
        (error) => {
          setIsAnalyzing(false);
          setLoadingStatus('');
          toast({
            title: "Analysis Failed",
            description: error.message || "An error occurred during analysis",
            variant: "destructive",
          });
        }
      );
    } catch (err) {
      setIsAnalyzing(false);
      setLoadingStatus('');
      toast({
        title: "Analysis Failed",
        description: "An error occurred during analysis",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Competitor SEO Comparison
          </CardTitle>
          <CardDescription>
            Enter 2-5 competitor URLs to analyze and compare their SEO optimization side-by-side
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {urls.map((url, index) => (
            <div key={index} className="flex gap-3 items-center">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
                {index + 1}
              </div>
              <Input
                type="text"
                value={url}
                onChange={(e) => updateUrl(index, e.target.value)}
                placeholder={`https://competitor${index + 1}.com`}
                disabled={isAnalyzing}
                className="flex-1"
              />
              {urls.length > 2 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeUrl(index)}
                  disabled={isAnalyzing}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            {urls.length < 5 && (
              <Button
                variant="outline"
                onClick={addUrl}
                disabled={isAnalyzing}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add URL ({urls.length}/5)
              </Button>
            )}
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || urls.filter(u => u.trim()).length < 2}
              className="flex-1"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing {urls.filter(u => u.trim()).length} URLs...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Compare SEO
                </>
              )}
            </Button>
          </div>

          {/* Loading Status */}
          {isAnalyzing && (
            <div className="space-y-3 border-t border-border mt-4 pt-4">
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
                    Processing time: 10-15 minutes for comprehensive competitive analysis
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Competitive Analysis Results */}
      {analysisResult && !isAnalyzing && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Competitive Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-lg p-6 prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                {analysisResult}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompetitorAnalyzer;
