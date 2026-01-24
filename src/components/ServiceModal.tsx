import { useState } from 'react';
import { X, Loader2, CheckCircle, Copy, FileDown, FileText, File, Sparkles } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { getLayerColor, type PRService, type ServiceInput } from '@/data/prServices';
import { getServiceIcon } from '@/data/serviceIcons';
import { exportToPDF, exportToWord, generateFilename } from '@/lib/exportContent';
import FileUpload from './FileUpload';
import SeoPreview from './SeoPreview';

interface UploadedFile {
  name: string;
  type: string;
  size: number;
  content: string;
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

  const Icon = getServiceIcon(service.id);

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

    try {
      // Prepare file context for AI
      const fileContext = uploadedFiles.length > 0 
        ? uploadedFiles.map(f => `--- File: ${f.name} ---\n${f.content}`).join('\n\n')
        : null;

      const { data, error } = await supabase.functions.invoke('generate-pr-content', {
        body: { 
          serviceId: service.id,
          serviceName: service.name,
          inputs: formData,
          outputs: service.outputs,
          fileContext: fileContext,
          seoOptimization: seoOptimization,
        },
      });

      if (error) throw error;

      setOutput(data.content);
      toast({ title: 'Content Generated', description: 'Your PR content is ready!' });
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error.message || 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
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
