import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import ImageEditor from '@/components/ImageEditor';
import { 
  Image, 
  Loader2, 
  Sparkles, 
  Download,
  Copy,
  Zap,
  Rocket,
  Save,
  Pencil
} from 'lucide-react';

interface ImageGeneratorProps {
  onImageSaved?: () => void;
}

const ImageGenerator = ({ onImageSaved }: ImageGeneratorProps = {}) => {
  const [description, setDescription] = useState('');
  const [model, setModel] = useState<'nano-banana' | 'pro'>('pro');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [result, setResult] = useState<{
    imageUrl?: string;
    textResponse?: string;
    model?: string;
  } | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter a description for your image.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt: description, model }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      
      toast({
        title: "Generation Complete",
        description: `Image generated using ${model === 'nano-banana' ? 'Nano Banana' : 'Pro'} model.`,
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An error occurred during generation.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Content copied to clipboard.",
    });
  };

  const downloadImage = async () => {
    if (!result?.imageUrl) return;
    
    try {
      const response = await fetch(result.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: "Your image is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Unable to download the image.",
        variant: "destructive",
      });
    }
  };

  const saveToGallery = async () => {
    if (!result?.imageUrl) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('generated_images')
        .insert({
          prompt: description,
          image_url: result.imageUrl,
          model: result.model || null,
        });

      if (error) throw error;

      toast({
        title: "Saved to Gallery",
        description: "Image has been saved to your gallery.",
      });

      // Notify parent component to refresh gallery
      onImageSaved?.();
    } catch (error) {
      console.error('Error saving to gallery:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save the image to gallery.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
            <CardTitle>AI Image Generator</CardTitle>
            <CardDescription>
              Generate professional PR visuals with advanced AI models
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Model Selection */}
        <div className="space-y-3">
          <Label>Select Model</Label>
          <RadioGroup
            value={model}
            onValueChange={(value) => setModel(value as 'nano-banana' | 'pro')}
            className="grid grid-cols-2 gap-4"
          >
            <div className="relative">
              <RadioGroupItem
                value="nano-banana"
                id="nano-banana"
                className="peer sr-only"
              />
              <Label
                htmlFor="nano-banana"
                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Zap className="mb-2 h-6 w-6 text-warning" />
                <span className="font-semibold">Nano Banana</span>
                <span className="text-xs text-muted-foreground text-center mt-1">
                  Fast generation, good for drafts
                </span>
              </Label>
            </div>
            <div className="relative">
              <RadioGroupItem
                value="pro"
                id="pro"
                className="peer sr-only"
              />
              <Label
                htmlFor="pro"
                className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Rocket className="mb-2 h-6 w-6 text-primary" />
                <span className="font-semibold">Pro</span>
                <span className="text-xs text-muted-foreground text-center mt-1">
                  Highest quality output
                </span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Image Description */}
        <div className="space-y-2">
          <Label>Image Description</Label>
          <Textarea
            placeholder="Describe the image you want to generate..."
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
              Generating with {model === 'nano-banana' ? 'Nano Banana' : 'Pro'}...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Image
            </>
          )}
        </Button>

        {/* Loading Skeleton */}
        {isGenerating && (
          <Card className="overflow-hidden border-dashed animate-fade-in">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-muted relative">
                <Skeleton className="w-full h-[300px]" />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Creating your image...
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    This may take a few moments
                  </p>
                </div>
              </div>
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        )}

        {/* Result Display */}
        {result && !isGenerating && (
          <Card className="overflow-hidden border-dashed animate-fade-in">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Generated Result</CardTitle>
                <div className="flex gap-2">
                  {result.textResponse && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(result.textResponse || '')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                  {result.imageUrl && (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        title="Edit image"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={downloadImage}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={saveToGallery}
                        disabled={isSaving}
                        title="Save to Gallery"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.imageUrl && (
                <div className="rounded-lg overflow-hidden bg-muted">
                  <img
                    src={result.imageUrl}
                    alt="Generated image"
                    className="w-full h-auto object-contain max-h-[400px]"
                  />
                </div>
              )}
              {result.textResponse && !result.imageUrl && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{result.textResponse}</p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Model: {result.model}
                </p>
                {result.imageUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={saveToGallery}
                    disabled={isSaving}
                    className="gap-1"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3 h-3" />
                        Save to Gallery
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Image Editor Modal */}
        {isEditing && result?.imageUrl && (
          <ImageEditor
            imageUrl={result.imageUrl}
            onClose={() => setIsEditing(false)}
            onSave={(editedImageUrl) => {
              setResult({ ...result, imageUrl: editedImageUrl });
              setIsEditing(false);
              toast({
                title: "Image updated",
                description: "Your edited image is ready to save or download.",
              });
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ImageGenerator;
