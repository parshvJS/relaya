import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import {
  Send,
  Settings,
  Copy,
  Sparkles,
  Link as LinkIcon,
  Check,
  X,
  Hash,
  AtSign,
  Globe,
  FileText,
  Loader2,
  ExternalLink,
  Clock
} from 'lucide-react';
import AIApiClient, { SSEEvent } from '@/lib/aiApiClient';

interface WebhookConfig {
  id: string;
  name: string;
  platform: 'twitter' | 'linkedin' | 'facebook' | 'reddit';
  webhookUrl: string;
  enabled: boolean;
  icon: React.ElementType;
  color: string;
  description: string;
}

interface OptimizedContent {
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

const PLATFORM_CONFIGS: Omit<WebhookConfig, 'webhookUrl' | 'enabled'>[] = [
  {
    id: 'twitter',
    name: 'Twitter / X',
    platform: 'twitter',
    icon: Globe,
    color: 'bg-zinc-900',
    description: 'Post to Twitter/X with optimized hashtags and mentions'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    platform: 'linkedin',
    icon: Globe,
    color: 'bg-blue-700',
    description: 'Share professional content with industry hashtags'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    platform: 'facebook',
    icon: Globe,
    color: 'bg-blue-600',
    description: 'Publish to Facebook with engaging metadata'
  },
  {
    id: 'reddit',
    name: 'Reddit',
    platform: 'reddit',
    icon: Globe,
    color: 'bg-orange-600',
    description: 'Submit to Reddit with community-optimized formatting'
  }
];

const SocialMediaPublisher = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(
    PLATFORM_CONFIGS.map(config => ({
      ...config,
      webhookUrl: '',
      enabled: false
    }))
  );
  const [content, setContent] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const [optimizedContent, setOptimizedContent] = useState<Record<string, OptimizedContent>>({});
  const [activeTab, setActiveTab] = useState('compose');
  const [showSettings, setShowSettings] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [optimizedText, setOptimizedText] = useState<string>('');
  const outputRef = useRef<string>('');

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

  const handleWebhookChange = (platformId: string, url: string) => {
    setWebhooks(prev => 
      prev.map(w => w.id === platformId ? { ...w, webhookUrl: url } : w)
    );
  };

  const handleTogglePlatform = (platformId: string) => {
    setWebhooks(prev => 
      prev.map(w => w.id === platformId ? { ...w, enabled: !w.enabled } : w)
    );
  };

  const saveWebhooks = () => {
    // Store webhooks in localStorage for persistence
    const webhooksToSave = webhooks.map(({ id, webhookUrl, enabled }) => ({ id, webhookUrl, enabled }));
    localStorage.setItem('social_webhooks', JSON.stringify(webhooksToSave));
    toast({
      title: "Configuration Saved",
      description: "Your webhook settings have been saved locally.",
    });
    setShowSettings(false);
  };

  // Load webhooks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('social_webhooks');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setWebhooks(prev => prev.map(w => {
          const savedConfig = parsed.find((s: { id: string }) => s.id === w.id);
          return savedConfig ? { ...w, webhookUrl: savedConfig.webhookUrl, enabled: savedConfig.enabled } : w;
        }));
      } catch (e) {
        console.error('Failed to parse saved webhooks:', e);
      }
    }
  }, []);

  const optimizeForPlatforms = async () => {
    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please enter content to optimize.",
        variant: "destructive",
      });
      return;
    }

    const enabledPlatforms = webhooks.filter(w => w.enabled);
    if (enabledPlatforms.length === 0) {
      toast({
        title: "No Platforms Enabled",
        description: "Enable at least one platform in settings.",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);
    setOptimizedText('');
    outputRef.current = '';

    try {
      const platformNames = enabledPlatforms.map(p => p.name).join(', ');
      const prompt = `Optimize the following content for social media posting across multiple platforms: ${platformNames}

Original Content:
${content}

Please generate platform-specific optimized versions with:
1. Platform-appropriate content length and formatting
2. Relevant hashtags for each platform (${platformNames})
3. Suggested mentions and tags
4. Engagement-optimized language
5. Call-to-action recommendations
6. Best posting times and strategies

For each platform (${platformNames}), provide:
- Optimized content text
- Recommended hashtags
- Suggested mentions
- Metadata (title, description, keywords)
- Platform-specific tips

Format the output with clear sections for each platform.`;

      setLoadingStatus('Creating social media optimization session...');
      const session = await AIApiClient.createSession(prompt);

      setLoadingStatus('Optimizing content for platforms...');

      await AIApiClient.startChat(
        { prompt, sessionId: session.sessionid },
        (event: SSEEvent) => {
          if (event.type === 'loadingStatus') {
            setLoadingStatus(event.status || '');
          } else if (event.type === 'finalResponse') {
            if (event.content) {
              outputRef.current += event.content;
              setOptimizedText(outputRef.current);
            }
          }
        },
        () => {
          setIsOptimizing(false);
          setLoadingStatus('');
          setActiveTab('preview');
          toast({
            title: "Content Optimized",
            description: `Generated optimized content for ${enabledPlatforms.length} platform(s).`,
          });
        },
        (error) => {
          setIsOptimizing(false);
          setLoadingStatus('');
          toast({
            title: "Optimization Failed",
            description: error.message || "An error occurred during optimization.",
            variant: "destructive",
          });
          console.error('Optimization error:', error);
        }
      );
    } catch (error) {
      console.error('Optimization error:', error);
      setIsOptimizing(false);
      setLoadingStatus('');
      toast({
        title: "Optimization Failed",
        description: error instanceof Error ? error.message : "An error occurred during optimization.",
        variant: "destructive",
      });
    }
  };

  const publishToPlatform = async (platform: WebhookConfig) => {
    const optimized = optimizedContent[platform.platform];
    if (!optimized) {
      toast({
        title: "Content Not Optimized",
        description: `Please optimize content for ${platform.name} first.`,
        variant: "destructive",
      });
      return;
    }

    if (!platform.webhookUrl) {
      toast({
        title: "Webhook Not Configured",
        description: `Please configure the webhook URL for ${platform.name}.`,
        variant: "destructive",
      });
      return;
    }

    setIsPublishing(platform.id);

    try {
      const response = await fetch(platform.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          platform: platform.platform,
          content: optimized.content,
          hashtags: optimized.hashtags,
          mentions: optimized.mentions,
          metadata: optimized.metadata,
          timestamp: new Date().toISOString(),
          source: 'RELAYA PR Platform'
        })
      });

      toast({
        title: "Request Sent",
        description: `Content sent to ${platform.name} webhook. Check your automation history to confirm delivery.`,
      });
    } catch (error) {
      console.error('Publish error:', error);
      toast({
        title: "Publish Failed",
        description: `Failed to send content to ${platform.name}. Please verify the webhook URL.`,
        variant: "destructive",
      });
    } finally {
      setIsPublishing(null);
    }
  };

  const publishToAll = async () => {
    const enabledPlatforms = webhooks.filter(w => w.enabled && w.webhookUrl && optimizedContent[w.platform]);
    
    if (enabledPlatforms.length === 0) {
      toast({
        title: "No Platforms Ready",
        description: "Ensure platforms are enabled, configured, and content is optimized.",
        variant: "destructive",
      });
      return;
    }

    for (const platform of enabledPlatforms) {
      await publishToPlatform(platform);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard.",
    });
  };

  const enabledCount = webhooks.filter(w => w.enabled).length;
  const configuredCount = webhooks.filter(w => w.enabled && w.webhookUrl).length;

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Send className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>Social Media Distribution</CardTitle>
              <CardDescription>
                Publish content with AI-optimized hashtags, tags, and metadata
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowSettings(!showSettings)}
            className="gap-2"
          >
            <Settings className="w-4 h-4" />
            Configure
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Platform Status */}
        <div className="flex flex-wrap gap-2">
          {webhooks.map(webhook => (
            <Badge 
              key={webhook.id}
              variant={webhook.enabled && webhook.webhookUrl ? "default" : "secondary"}
              className={`gap-1.5 ${webhook.enabled && webhook.webhookUrl ? webhook.color : ''}`}
            >
              {webhook.enabled && webhook.webhookUrl ? (
                <Check className="w-3 h-3" />
              ) : (
                <X className="w-3 h-3" />
              )}
              {webhook.name}
            </Badge>
          ))}
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Webhook Configuration</CardTitle>
              <CardDescription>
                Connect your Zapier or Make webhooks for each platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {webhooks.map(webhook => (
                <div key={webhook.id} className="space-y-2 p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded ${webhook.color} flex items-center justify-center`}>
                        <webhook.icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <Label className="font-medium">{webhook.name}</Label>
                    </div>
                    <Switch
                      checked={webhook.enabled}
                      onCheckedChange={() => handleTogglePlatform(webhook.id)}
                    />
                  </div>
                  {webhook.enabled && (
                    <div className="pt-2">
                      <Label className="text-xs text-muted-foreground">Webhook URL</Label>
                      <Input
                        placeholder="https://hooks.zapier.com/... or https://hook.make.com/..."
                        value={webhook.webhookUrl}
                        onChange={(e) => handleWebhookChange(webhook.id, e.target.value)}
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">{webhook.description}</p>
                    </div>
                  )}
                </div>
              ))}
              <Button onClick={saveWebhooks} className="w-full">
                Save Configuration
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Content Area */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="compose" className="gap-2">
              <FileText className="w-4 h-4" />
              Compose
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Optimized Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-4">
            <div className="space-y-2">
              <Label>Content to Distribute</Label>
              <Textarea
                placeholder="Enter your press release, announcement, or content to distribute across social platforms..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px]"
              />
              <p className="text-xs text-muted-foreground">
                {content.length} characters
              </p>
            </div>

            {/* Loading Status */}
            {isOptimizing && (
              <div className="space-y-3">
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
                      Processing time: 10-15 minutes for platform optimization
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button
              onClick={optimizeForPlatforms}
              disabled={isOptimizing || !content.trim() || enabledCount === 0}
              className="w-full gap-2"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Optimizing for {enabledCount} Platform{enabledCount !== 1 ? 's' : ''}...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Optimize for {enabledCount} Platform{enabledCount !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {!optimizedText && Object.keys(optimizedContent).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No optimized content yet.</p>
                <p className="text-sm">Compose content and click "Optimize" to generate platform-specific versions.</p>
              </div>
            ) : optimizedText ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Optimized Social Media Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted/30 rounded-lg p-6 prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                      {optimizedText}
                    </pre>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      navigator.clipboard.writeText(optimizedText);
                      toast({
                        title: "Copied!",
                        description: "Optimized content copied to clipboard.",
                      });
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy All Content
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {webhooks.filter(w => w.enabled && optimizedContent[w.platform]).map(webhook => {
                  const optimized = optimizedContent[webhook.platform];
                  return (
                    <Card key={webhook.id} className="overflow-hidden">
                      <div className={`${webhook.color} px-4 py-2 flex items-center justify-between`}>
                        <div className="flex items-center gap-2 text-white">
                          <webhook.icon className="w-4 h-4" />
                          <span className="font-medium text-sm">{webhook.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-white hover:text-white hover:bg-white/20"
                            onClick={() => copyToClipboard(
                              `${optimized.content}\n\n${optimized.hashtags.join(' ')}`
                            )}
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-white hover:text-white hover:bg-white/20"
                            onClick={() => publishToPlatform(webhook)}
                            disabled={isPublishing === webhook.id || !webhook.webhookUrl}
                          >
                            {isPublishing === webhook.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <ExternalLink className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-4 space-y-3">
                        {/* Content */}
                        <div className="text-sm whitespace-pre-wrap">
                          {optimized.content}
                        </div>

                        {/* Hashtags */}
                        {optimized.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            <Hash className="w-4 h-4 text-muted-foreground" />
                            {optimized.hashtags.map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Mentions */}
                        {optimized.mentions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            <AtSign className="w-4 h-4 text-muted-foreground" />
                            {optimized.mentions.map((mention, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {mention}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="pt-2 border-t border-border/50">
                          <p className="text-xs font-medium text-muted-foreground mb-1">SEO Metadata</p>
                          <div className="text-xs space-y-1">
                            <p><span className="text-muted-foreground">Title:</span> {optimized.metadata.title}</p>
                            <p><span className="text-muted-foreground">Description:</span> {optimized.metadata.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {/* Publish All Button */}
                <Button
                  onClick={publishToAll}
                  disabled={isPublishing !== null || configuredCount === 0}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Send className="w-4 h-4" />
                  Publish to All Configured Platforms ({configuredCount})
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SocialMediaPublisher;
