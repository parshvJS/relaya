import { useState, useEffect, useRef } from 'react';
import { X, Loader2, CheckCircle, Copy, FileDown, FileText, File, Sparkles, Upload, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { getLayerColor, type PRService, type ServiceInput } from '@/data/prServices';
import { getServiceIcon } from '@/data/serviceIcons';
import { exportToPDF, exportToWord, generateFilename } from '@/lib/exportContent';
import FileUpload from './FileUpload';
import SeoPreview from './SeoPreview';
import AIApiClient, { SSEEvent } from '@/lib/aiApiClient';

interface UploadedFile {
  name: string;
  type: string;
  size: number;
  content: string;
  file?: File; // Original File object for API uploads
}

interface ServiceModalProps {
  service: PRService;
  onClose: () => void;
}

const ServiceModal = ({ service, onClose }: ServiceModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [seoOptimization, setSeoOptimization] = useState(false);

  // AI Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [fileUploadProgress, setFileUploadProgress] = useState<{ current: number; total: number; fileName: string } | null>(null);
  const [swarmIds, setSwarmIds] = useState<number[]>([]);
  const outputRef = useRef<string>('');

  const Icon = getServiceIcon(service.id);

  // Initialize AI client on mount
  useEffect(() => {
    const initializeAI = async () => {
      try {
        await AIApiClient.initialize();
      } catch (error) {
        console.error('Failed to initialize AI client:', error);
        toast({
          title: 'Initialization Error',
          description: 'Failed to initialize AI service. Please refresh and try again.',
          variant: 'destructive',
        });
      }
    };

    initializeAI();
  }, [toast]);

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    const missingRequired = service.inputs
      .filter(input => input.required && !formData[input.name])
      .map(input => input.label);

    if (missingRequired.length > 0) {
      toast({
        title: 'Missing Required Fields',
        description: `Please fill in: ${missingRequired.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setOutput(null);
    outputRef.current = '';
    setSwarmIds([]);

    try {
      setLoadingStatus('Initializing AI session...');

      // Build comprehensive prompt from form data
      let prompt = `Service: ${service.name}\n\n`;
      prompt += `Description: ${service.description}\n\n`;

      // Add form inputs
      prompt += `Input Parameters:\n`;
      service.inputs.forEach(input => {
        const value = formData[input.name];
        if (value) {
          if (Array.isArray(value)) {
            prompt += `- ${input.label}: ${value.join(', ')}\n`;
          } else {
            prompt += `- ${input.label}: ${value}\n`;
          }
        }
      });

      // Add SEO optimization instruction
      if (seoOptimization) {
        prompt += `\nSEO Optimization: Enable advanced SEO, LLMO (Large Language Model Optimization), and AIO (AI Overviews) optimization. Include meta tags, schema markup, FAQ structures, and content optimized for Google, ChatGPT, Perplexity, and other AI search engines.\n`;
      }

      // Add expected outputs
      prompt += `\nExpected Outputs:\n`;
      service.outputs.forEach((output, idx) => {
        prompt += `${idx + 1}. ${output}\n`;
      });

      // Add file context if files uploaded
      if (uploadedFiles.length > 0) {
        prompt += `\nReference Documents:\n`;
        uploadedFiles.forEach(file => {
          prompt += `- ${file.name} (${(file.size / 1024).toFixed(2)} KB)\n`;
        });
      }

      prompt += `\nPlease generate comprehensive, high-quality PR content based on the above parameters. Ensure compliance with all regulatory requirements and follow industry best practices.`;

      // Create session
      setLoadingStatus('Creating session...');
      const session = await AIApiClient.createSession(prompt);
      setSessionId(session.sessionid);

      // Upload files sequentially if any
      if (uploadedFiles.length > 0) {
        setLoadingStatus('Uploading documents...');

        // Filter to get only files with the original File object
        const fileObjects = uploadedFiles
          .filter(uf => uf.file)
          .map(uf => uf.file!);

        if (fileObjects.length > 0) {
          await AIApiClient.vectorizeDocuments(
            session.sessionid,
            fileObjects,
            (current, total, fileName) => {
              setFileUploadProgress({ current, total, fileName });
              setLoadingStatus(`Uploading ${fileName} (${current}/${total})...`);
            }
          );
        } else if (uploadedFiles.length > 0) {
          // Fallback: if no File objects stored, log warning
          console.warn('No file objects available for upload. Files may have been loaded incorrectly.');
          toast({
            title: 'File Upload Warning',
            description: 'Some files could not be uploaded. Please try re-uploading them.',
            variant: 'destructive',
          });
        }

        setFileUploadProgress(null);
      }

      // Start chat
      setLoadingStatus('Starting AI agents...');

      await AIApiClient.startChat(
        {
          prompt,
          sessionId: session.sessionid,
        },
        (event: SSEEvent) => {
          // Handle SSE events
          if (event.type === 'loadingStatus') {
            setLoadingStatus(event.status || '');
          } else if (event.type === 'swarmId') {
            if (event.swarmId) {
              setSwarmIds(prev => [...prev, event.swarmId!]);
            }
          } else if (event.type === 'finalResponse') {
            // Append streaming response
            if (event.content) {
              outputRef.current += event.content;
              setOutput(outputRef.current);
            }
          }
        },
        () => {
          // On complete
          setIsGenerating(false);
          setLoadingStatus('Complete');
          toast({
            title: 'Content Generated',
            description: `Your PR content is ready! Processed by ${swarmIds.length} AI agents.`
          });
        },
        (error) => {
          // On error
          setIsGenerating(false);
          setLoadingStatus('');
          toast({
            title: 'Generation Failed',
            description: error.message || 'Please try again.',
            variant: 'destructive',
          });
        }
      );

    } catch (error: any) {
      console.error('Generation error:', error);
      setIsGenerating(false);
      setLoadingStatus('');
      toast({
        title: 'Generation Failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const copyToClipboard = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      toast({ title: 'Copied!', description: 'Content copied to clipboard.' });
    }
  };

  const handleExportPDF = () => {
    if (output) {
      const filename = generateFilename(service.name);
      exportToPDF(output, filename, service.name);
      toast({ title: 'PDF Downloaded', description: 'Your content has been exported as PDF.' });
    }
  };

  const handleExportWord = async () => {
    if (output) {
      const filename = generateFilename(service.name);
      await exportToWord(output, filename, service.name);
      toast({ title: 'Word Document Downloaded', description: 'Your content has been exported as DOCX.' });
    }
  };

  const renderInput = (input: ServiceInput) => {
    const commonProps = {
      id: input.name,
      placeholder: input.placeholder,
      value: formData[input.name] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => 
        handleInputChange(input.name, e.target.value),
    };

    switch (input.type) {
      case 'textarea':
        return <Textarea {...commonProps} rows={3} className="input-modern resize-none" />;
      case 'select':
        return (
          <Select value={formData[input.name] || ''} onValueChange={(v) => handleInputChange(input.name, v)}>
            <SelectTrigger className="input-modern">
              <SelectValue placeholder={input.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {input.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'multiselect':
        return (
          <div className="flex flex-wrap gap-2">
            {input.options?.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  const current = formData[input.name] || [];
                  const updated = current.includes(opt.value)
                    ? current.filter((v: string) => v !== opt.value)
                    : [...current, opt.value];
                  handleInputChange(input.name, updated);
                }}
                className={`layer-badge ${
                  (formData[input.name] || []).includes(opt.value)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        );
      case 'boolean':
        return (
          <div className="flex gap-2">
            {['Yes', 'No'].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => handleInputChange(input.name, val === 'Yes')}
                className={`layer-badge ${
                  formData[input.name] === (val === 'Yes')
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        );
      default:
        return <Input {...commonProps} type={input.type === 'number' ? 'number' : 'text'} className="input-modern" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-4xl my-8 bg-card rounded-2xl border border-border shadow-xl animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between p-6 border-b border-border bg-card rounded-t-2xl">
          <div className="flex items-start gap-4">
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${getLayerColor(service.layerNumber)} text-white`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`layer-badge ${getLayerColor(service.layerNumber)} text-white text-xs`}>
                  Layer {service.layerNumber}
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground">{service.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{service.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            {/* File Upload Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Upload Reference Documents</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Upload documents to provide additional context for content generation (optional)
              </p>
              <FileUpload 
                files={uploadedFiles}
                onFilesChange={setUploadedFiles}
              />
            </div>

            {/* Form Inputs */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Required Inputs</h3>
              <div className="space-y-4">
                {service.inputs.map(input => (
                  <div key={input.name}>
                    <label htmlFor={input.name} className="block text-sm font-medium text-foreground mb-1.5">
                      {input.label}
                      {input.required && <span className="text-destructive ml-1">*</span>}
                    </label>
                    {renderInput(input)}
                  </div>
                ))}
              </div>
            </div>

            {/* SEO Optimization Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-gradient-to-r from-primary/5 to-info/5">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">SEO & AI Search Optimization</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium cursor-help">
                            LLMO + AIO
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="text-xs">
                            Applies advanced SEO, Large Language Model Optimization (LLMO), 
                            and AI Overviews (AIO) optimization. Includes meta tags, schema markup, 
                            FAQ structures, and content optimized for Google, ChatGPT, Perplexity, and more.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Optimize for traditional SEO + AI-powered search engines
                  </p>
                </div>
              </div>
              <Switch
                checked={seoOptimization}
                onCheckedChange={setSeoOptimization}
                aria-label="Toggle SEO optimization"
              />
            </div>
            
            {/* Progress Indicators */}
            {isGenerating && (
              <div className="space-y-3">
                {/* File Upload Progress */}
                {fileUploadProgress && (
                  <div className="p-3 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Upload className="w-4 h-4 text-primary animate-pulse" />
                      <span className="text-sm font-medium">Uploading Files</span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">
                      {fileUploadProgress.fileName} ({fileUploadProgress.current}/{fileUploadProgress.total})
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(fileUploadProgress.current / fileUploadProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Loading Status */}
                {loadingStatus && (
                  <div className="p-3 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm font-medium">{loadingStatus}</span>
                    </div>
                  </div>
                )}

                {/* Time Estimate */}
                <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      Processing time: 10-15 minutes for comprehensive analysis
                    </span>
                  </div>
                </div>

                {/* Swarm Activity */}
                {swarmIds.length > 0 && (
                  <div className="p-3 rounded-lg border border-border bg-muted/30">
                    <div className="text-xs text-muted-foreground">
                      Active AI agents: {swarmIds.length}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full btn-primary">
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating{seoOptimization ? ' with SEO...' : '...'}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Generate Content{seoOptimization ? ' + SEO' : ''}
                </>
              )}
            </Button>
          </div>

          {/* Output */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Generated Output</h3>
              {output && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-1" /> Copy
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <FileDown className="w-4 h-4 mr-1" /> Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleExportPDF}>
                        <FileText className="w-4 h-4 mr-2" />
                        Download as PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportWord}>
                        <File className="w-4 h-4 mr-2" />
                        Download as Word (.docx)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
            
            <div className="rounded-xl border border-border bg-muted/30 p-4 min-h-[400px] max-h-[600px] overflow-y-auto">
              {output ? (
                seoOptimization ? (
                  <SeoPreview content={output} />
                ) : (
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap text-foreground">
                    {output}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-16">
                  <p className="text-sm">Fill in the form and click Generate to create your content.</p>
                  <div className="mt-4 text-xs">
                    <strong>Outputs:</strong>
                    <ul className="mt-2 space-y-1">
                      {service.outputs.map((o, i) => <li key={i}>- {o}</li>)}
                    </ul>
                  </div>
                  {seoOptimization && (
                    <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 text-primary">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-medium">SEO Optimization Enabled</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Output will include metadata, schema, and AI search optimizations
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
