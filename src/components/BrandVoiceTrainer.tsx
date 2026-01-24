import { useState, useEffect, useRef } from 'react';
import { Sparkles, Upload, CheckCircle, Loader2, Copy, RefreshCw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import AIApiClient, { SSEEvent } from '@/lib/aiApiClient';

interface BrandVoiceProfile {
  tone: string;
  vocabulary: string[];
  sentenceStructure: string;
  keyPhrases: string[];
  avoidPhrases: string[];
  writingStyle: string;
  formalityLevel: string;
  recommendations: string[];
}

const BrandVoiceTrainer = () => {
  const [sampleContent, setSampleContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [voiceProfile, setVoiceProfile] = useState<BrandVoiceProfile | null>(null);
  const [testInput, setTestInput] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
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

  const analyzeVoice = async () => {
    if (!sampleContent.trim() || sampleContent.length < 200) {
      toast.error('Please provide at least 200 characters of sample content');
      return;
    }

    setIsAnalyzing(true);
    outputRef.current = '';
    try {
      const prompt = `Analyze the following brand voice sample and create a comprehensive voice profile:\n\n${sampleContent}\n\nPlease provide:\n1. Tone analysis (professional, casual, technical, friendly, etc.)\n2. Common vocabulary patterns and frequently used words\n3. Sentence structure patterns\n4. Key phrases that define the voice\n5. Phrases to avoid\n6. Overall writing style\n7. Formality level\n8. Recommendations for maintaining consistency\n\nFormat the output as a structured JSON profile with these fields: tone, vocabulary, sentenceStructure, keyPhrases, avoidPhrases, writingStyle, formalityLevel, recommendations.`;

      setLoadingStatus('Creating analysis session...');
      const session = await AIApiClient.createSession(prompt);

      setLoadingStatus('Analyzing brand voice...');

      await AIApiClient.startChat(
        { prompt, sessionId: session.sessionid },
        (event: SSEEvent) => {
          if (event.type === 'loadingStatus') {
            setLoadingStatus(event.status || '');
          } else if (event.type === 'finalResponse') {
            if (event.content) {
              outputRef.current += event.content;
            }
          }
        },
        () => {
          setIsAnalyzing(false);
          setLoadingStatus('');

          // Parse the AI response to extract profile
          try {
            const jsonMatch = outputRef.current.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const profile = JSON.parse(jsonMatch[0]);
              setVoiceProfile(profile);
              toast.success('Brand voice profile created successfully');
            } else {
              // Fallback: create a basic profile from the text response
              setVoiceProfile({
                tone: 'Analyzed from sample',
                vocabulary: [],
                sentenceStructure: 'Analyzed from sample',
                keyPhrases: [],
                avoidPhrases: [],
                writingStyle: outputRef.current.substring(0, 200),
                formalityLevel: 'Medium',
                recommendations: [outputRef.current],
              });
              toast.success('Brand voice profile created successfully');
            }
          } catch (error) {
            console.error('Error parsing voice profile:', error);
            toast.error('Failed to parse voice profile');
          }
        },
        (error) => {
          setIsAnalyzing(false);
          setLoadingStatus('');
          toast.error('Failed to analyze brand voice');
          console.error('Error analyzing brand voice:', error);
        }
      );
    } catch (error) {
      console.error('Error analyzing brand voice:', error);
      toast.error('Failed to analyze brand voice');
      setIsAnalyzing(false);
      setLoadingStatus('');
    }
  };

  const generateWithVoice = async () => {
    if (!testInput.trim() || !voiceProfile) {
      toast.error('Please enter test instructions and analyze your brand voice first');
      return;
    }

    setIsGenerating(true);
    setGeneratedContent('');
    outputRef.current = '';

    try {
      const prompt = `Generate content based on the following instructions while maintaining this brand voice profile:\n\nBrand Voice:\n- Tone: ${voiceProfile.tone}\n- Writing Style: ${voiceProfile.writingStyle}\n- Formality: ${voiceProfile.formalityLevel}\n- Sentence Structure: ${voiceProfile.sentenceStructure}\n${voiceProfile.keyPhrases.length > 0 ? `- Key Phrases: ${voiceProfile.keyPhrases.join(', ')}` : ''}\n${voiceProfile.avoidPhrases.length > 0 ? `- Avoid: ${voiceProfile.avoidPhrases.join(', ')}` : ''}\n\nUser Instructions:\n${testInput}\n\nPlease generate content that strictly follows the brand voice characteristics above.`;

      setLoadingStatus('Creating session...');
      const session = await AIApiClient.createSession(prompt);

      setLoadingStatus('Generating content...');

      await AIApiClient.startChat(
        { prompt, sessionId: session.sessionid },
        (event: SSEEvent) => {
          if (event.type === 'loadingStatus') {
            setLoadingStatus(event.status || '');
          } else if (event.type === 'finalResponse') {
            if (event.content) {
              outputRef.current += event.content;
              setGeneratedContent(outputRef.current);
            }
          }
        },
        () => {
          setIsGenerating(false);
          setLoadingStatus('');
          toast.success('Content generated with your brand voice');
        },
        (error) => {
          setIsGenerating(false);
          setLoadingStatus('');
          toast.error('Failed to generate content');
          console.error('Error generating content:', error);
        }
      );
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
      setIsGenerating(false);
      setLoadingStatus('');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Brand Voice Training
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Upload sample content to train the AI on your unique writing style and voice
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sampleContent">Sample Content (minimum 200 characters)</Label>
            <Textarea
              id="sampleContent"
              value={sampleContent}
              onChange={(e) => setSampleContent(e.target.value)}
              placeholder="Paste 2-3 examples of your best writing. This could be blog posts, press releases, marketing copy, or any content that represents your brand voice..."
              className="input-modern min-h-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              {sampleContent.length} characters | For optimal results, provide 500+ characters from multiple content pieces
            </p>
          </div>

          {/* Loading Status for Analysis */}
          {isAnalyzing && (
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
                    Analysis typically takes 10-15 minutes
                  </span>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={analyzeVoice}
            disabled={isAnalyzing || sampleContent.length < 200}
            className="btn-primary w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Brand Voice...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Analyze Voice Profile
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {voiceProfile && (
        <Card className="border-border/50 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Brand Voice Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-2">Tone</h4>
                  <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                    {voiceProfile.tone}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-2">Writing Style</h4>
                  <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                    {voiceProfile.writingStyle}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-2">Formality Level</h4>
                  <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                    {voiceProfile.formalityLevel}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-2">Sentence Structure</h4>
                  <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                    {voiceProfile.sentenceStructure}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-2">Key Vocabulary</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {voiceProfile.vocabulary.map((word, i) => (
                      <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-2">Signature Phrases</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {voiceProfile.keyPhrases.map((phrase, i) => (
                      <span key={i} className="px-2 py-1 bg-green-500/10 text-green-600 text-xs rounded-full">
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground mb-2">Phrases to Avoid</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {voiceProfile.avoidPhrases.map((phrase, i) => (
                      <span key={i} className="px-2 py-1 bg-destructive/10 text-destructive text-xs rounded-full">
                        {phrase}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-foreground mb-2">Recommendations</h4>
              <ul className="space-y-2">
                {voiceProfile.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border/50 pt-6 space-y-4">
              <h4 className="font-semibold text-foreground">Test Your Brand Voice</h4>
              <div className="space-y-2">
                <Label htmlFor="testInput">Enter instructions to generate content with your voice</Label>
                <Textarea
                  id="testInput"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  placeholder="Write a short announcement about our new product launch..."
                  className="input-modern min-h-[80px]"
                />
              </div>

              {/* Loading Status for Generation */}
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
                        Generation typically takes 10-15 minutes
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={generateWithVoice}
                disabled={isGenerating || !testInput.trim()}
                className="btn-primary"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Generate with Brand Voice
                  </>
                )}
              </Button>

              {generatedContent && (
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-sm text-foreground">Generated Content</h5>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedContent)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{generatedContent}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BrandVoiceTrainer;
