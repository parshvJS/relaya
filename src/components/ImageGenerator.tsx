import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Image,
  Loader2,
  Sparkles,
  Copy,
  FileText,
  Clock
} from 'lucide-react';
import AIApiClient, { SSEEvent } from '@/lib/aiApiClient';

interface ImageGeneratorProps {
  onImageSaved?: () => void;
}

const ImageGenerator = ({ onImageSaved }: ImageGeneratorProps = {}) => {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [result, setResult] = useState<string>('');
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

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter a description for your image concept.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setResult('');
    outputRef.current = '';

    try {
      const prompt = `Generate a detailed, professional image concept and description based on the following request:\n\n${description}\n\nPlease provide:\n1. A refined, detailed image prompt optimized for AI image generators (DALL-E, Midjourney, Stable Diffusion)\n2. Visual composition details (lighting, colors, style, mood)\n3. Technical specifications (aspect ratio suggestions, resolution)\n4. Art style recommendations\n5. Alternative variations or concepts\n6. Keywords and tags for the image\n\nFormat the output professionally with clear sections.`;

      setLoadingStatus('Creating session...');
      const session = await AIApiClient.createSession(prompt);

      setLoadingStatus('Generating image concept...');

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
          setIsGenerating(false);
          setLoadingStatus('');
          toast({
            title: "Image Concept Generated",
            description: "Your detailed image prompt and concept is ready!",
          });
        },
        (error) => {
          setIsGenerating(false);
          setLoadingStatus('');
          toast({
            title: "Generation Failed",
            description: error.message || "An error occurred during generation.",
            variant: "destructive",
          });
        }
      );
    } catch (error) {
      console.error('Generation error:', error);
      setIsGenerating(false);
      setLoadingStatus('');
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An error occurred during generation.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      toast({
        title: "Copied",
        description: "Image concept copied to clipboard.",
      });
    }
  };

  const exampleDescriptions = [
    "Professional headshot of a confident business executive in a modern office setting",
    "Abstract visualization of data flowing through a global network",
    "Elegant product showcase with soft lighting and minimalist background",
    "Dynamic infographic style illustration representing growth and innovation"
  ];

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-warning to-destructive flex items-center justify-center">
            <Image className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle>AI Image Concept Generator</CardTitle>
            <CardDescription>
              Generate detailed image prompts and concepts for professional visuals
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Image Description */}
        <div className="space-y-2">
          <Label>Image Concept Description</Label>
          <Textarea
            placeholder="Describe the image concept you want to generate..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[120px]"
          />
          <p className="text-xs text-muted-foreground">
            {description.length} characters
          </p>
        </div>

        {/* Quick Examples */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Quick Examples</Label>
          <div className="flex flex-wrap gap-2">
            {exampleDescriptions.map((example, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-xs h-auto py-1.5 px-2"
                onClick={() => setDescription(example)}
              >
                {example.substring(0, 30)}...
              </Button>
            ))}
          </div>
        </div>

        {/* Loading Status */}
        {isGenerating && (
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
                  Processing time: 10-15 minutes for detailed concept
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !description.trim()}
          className="w-full gap-2"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating Image Concept...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Image Concept & Prompt
            </>
          )}
        </Button>


        {/* Result Display */}
        {result && !isGenerating && (
          <Card className="overflow-hidden animate-fade-in">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  Generated Image Concept
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyToClipboard}
                >
                  <Copy className="w-4 h-4" />
                </Button>
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
      </CardContent>
    </Card>
  );
};

export default ImageGenerator;
