import { useState } from 'react';
import { Plus, X, Loader2, AlertCircle, Trophy, TrendingUp, Target, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import SeoPreview from './SeoPreview';

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
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [activeTab, setActiveTab] = useState('0');
  const { toast } = useToast();

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
    setResults([]);

    try {
      // Analyze all URLs in parallel
      const analysisPromises = validUrls.map(async (url) => {
        try {
          const { data, error } = await supabase.functions.invoke('analyze-url-seo', {
            body: { url: url.trim() },
          });

          if (error) {
            return { url, success: false, error: error.message };
          }

          if (!data.success) {
            return { url, success: false, error: data.error };
          }

          return {
            url: data.url,
            success: true,
            metadata: data.metadata,
            linksCount: data.linksCount,
            contentLength: data.contentLength,
            analysis: data.analysis,
          };
        } catch (err) {
          return {
            url,
            success: false,
            error: err instanceof Error ? err.message : 'Analysis failed',
          };
        }
      });

      const analysisResults = await Promise.all(analysisPromises);
      setResults(analysisResults);
      setActiveTab('0');

      const successCount = analysisResults.filter(r => r.success).length;
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${successCount} of ${validUrls.length} URLs`,
      });
    } catch (err) {
      toast({
        title: "Analysis Failed",
        description: "An error occurred during analysis",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getComparisonStats = () => {
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length === 0) return null;

    return successfulResults.map(r => ({
      url: r.url,
      domain: new URL(r.url).hostname.replace('www.', ''),
      contentLength: r.contentLength || 0,
      linksCount: r.linksCount || 0,
      title: r.metadata?.title || 'N/A',
      hasDescription: !!r.metadata?.description,
    }));
  };

  const stats = getComparisonStats();

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

          {isAnalyzing && (
            <div className="text-center py-8 border-t border-border mt-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
              <p className="text-sm text-muted-foreground">
                Scraping and analyzing multiple pages...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This may take 30-60 seconds for all URLs
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comparison Overview */}
      {stats && stats.length > 0 && !isAnalyzing && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Quick Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">Metric</th>
                    {stats.map((s, i) => (
                      <th key={i} className="text-center py-3 px-2 font-medium">
                        <span className="text-foreground">{s.domain}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-2 text-muted-foreground">Content Length</td>
                    {stats.map((s, i) => {
                      const max = Math.max(...stats.map(st => st.contentLength));
                      const isMax = s.contentLength === max;
                      return (
                        <td key={i} className={`text-center py-3 px-2 ${isMax ? 'text-primary font-medium' : ''}`}>
                          {s.contentLength.toLocaleString()} chars
                          {isMax && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-2 text-muted-foreground">Internal Links</td>
                    {stats.map((s, i) => {
                      const max = Math.max(...stats.map(st => st.linksCount));
                      const isMax = s.linksCount === max;
                      return (
                        <td key={i} className={`text-center py-3 px-2 ${isMax ? 'text-primary font-medium' : ''}`}>
                          {s.linksCount} links
                          {isMax && <Trophy className="w-3 h-3 inline ml-1 text-primary" />}
                        </td>
                      );
                    })}
                  </tr>
                  <tr className="border-b border-border/50">
                    <td className="py-3 px-2 text-muted-foreground">Has Meta Description</td>
                    {stats.map((s, i) => (
                      <td key={i} className={`text-center py-3 px-2 ${s.hasDescription ? 'text-green-600' : 'text-red-500'}`}>
                        {s.hasDescription ? '✓ Yes' : '✗ Missing'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-2 text-muted-foreground">Title Tag</td>
                    {stats.map((s, i) => (
                      <td key={i} className="text-center py-3 px-2 text-xs max-w-[200px] truncate" title={s.title}>
                        {s.title.length > 30 ? s.title.substring(0, 30) + '...' : s.title}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results Tabs */}
      {results.length > 0 && !isAnalyzing && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Detailed Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full flex flex-wrap h-auto gap-1 mb-4">
                {results.map((result, index) => {
                  const domain = result.success 
                    ? new URL(result.url).hostname.replace('www.', '')
                    : `URL ${index + 1}`;
                  return (
                    <TabsTrigger
                      key={index}
                      value={index.toString()}
                      className="flex-1 min-w-[120px] text-xs"
                    >
                      <span className={`w-2 h-2 rounded-full mr-2 ${result.success ? 'bg-green-500' : 'bg-red-500'}`} />
                      {domain.length > 15 ? domain.substring(0, 15) + '...' : domain}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {results.map((result, index) => (
                <TabsContent key={index} value={index.toString()} className="mt-0">
                  {result.success ? (
                    <div>
                      <div className="flex gap-4 text-sm text-muted-foreground mb-4 pb-4 border-b border-border">
                        <span>📄 {result.contentLength?.toLocaleString()} characters</span>
                        <span>🔗 {result.linksCount} links</span>
                        {result.metadata?.language && (
                          <span>🌐 {result.metadata.language.toUpperCase()}</span>
                        )}
                      </div>
                      <SeoPreview content={result.analysis || ''} />
                    </div>
                  ) : (
                    <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-destructive">Analysis Failed</p>
                        <p className="text-sm text-muted-foreground mt-1">{result.error}</p>
                        <p className="text-xs text-muted-foreground mt-2">URL: {result.url}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompetitorAnalyzer;
