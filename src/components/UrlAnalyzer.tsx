import { useState } from 'react';
import { Globe, Search, Loader2, AlertCircle, ExternalLink, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SeoPreview from './SeoPreview';

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
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
    setResult(null);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('analyze-url-seo', {
        body: { url: url.trim() },
      });

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data);
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${data.url}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze URL';
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
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

          {isAnalyzing && (
            <div className="mt-6 text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
              <p className="text-sm text-muted-foreground">
                Scraping page content and generating AI-powered SEO analysis...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This may take 15-30 seconds
              </p>
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
              <CardTitle className="text-lg">Analysis Results</CardTitle>
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {result.url}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground mt-2">
              <span className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                {result.contentLength.toLocaleString()} characters
              </span>
              <span className="flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                {result.linksCount} links
              </span>
              {result.metadata.language && (
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {result.metadata.language.toUpperCase()}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <SeoPreview content={result.analysis} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UrlAnalyzer;
