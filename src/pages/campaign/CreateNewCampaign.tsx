import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Check, Sparkles, Users, Mail, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import axios from 'axios';

interface LeadSettings {
  leadSource: string;
  amountOfLeads: number;
  searchTerm: string;
}

interface EmailConfig {
  instantlyApiKey: string;
  selectedEmails: string[];
  purposeOfOutreach: string;
  emailStyle: string;
  customStyle: string;
}

interface InstantlyEmail {
  email: string;
  provider: string;
  warmupStatus: string;
  status: string;
  dailyLimit: number;
}

const emailStyleTemplates = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Formal and business-oriented tone',
  },
  {
    id: 'casual',
    name: 'Casual',
    description: 'Friendly and conversational approach',
  },
  {
    id: 'enthusiastic',
    name: 'Enthusiastic',
    description: 'Energetic and engaging style',
  },
  {
    id: 'direct',
    name: 'Direct',
    description: 'Straightforward and concise',
  },
  {
    id: 'storytelling',
    name: 'Storytelling',
    description: 'Narrative-driven and compelling',
  },
];

const CreateNewCampaign = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);

  // Lead Settings State
  const [leadSettings, setLeadSettings] = useState<LeadSettings>({
    leadSource: '',
    amountOfLeads: 0,
    searchTerm: '',
  });

  // Email Config State
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    instantlyApiKey: '',
    selectedEmails: [],
    purposeOfOutreach: '',
    emailStyle: '',
    customStyle: '',
  });

  const [apiValidation, setApiValidation] = useState<{
    loading: boolean;
    success: boolean;
    error: string | null;
    emailCount: number;
  }>({
    loading: false,
    success: false,
    error: null,
    emailCount: 0,
  });

  const [availableEmails, setAvailableEmails] = useState<InstantlyEmail[]>([]);

  const totalSteps = 2;

  // Step 1 fields
  const step1Fields = ['leadSource', 'amountOfLeads', 'searchTerm'];

  // Step 2 fields
  const step2Fields = ['instantlyApiKey', 'emailSelection', 'purposeOfOutreach', 'emailStyle'];

  // Debounced API call to check instantly API key
  useEffect(() => {
    if (!emailConfig.instantlyApiKey || emailConfig.instantlyApiKey.length < 10) {
      setApiValidation({ loading: false, success: false, error: null, emailCount: 0 });
      setAvailableEmails([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setApiValidation({ loading: true, success: false, error: null, emailCount: 0 });

      try {
        const response = await axios.post('http://localhost:3000/api/outreach/instantlyApiCheck', {
          instantlyApiKey: emailConfig.instantlyApiKey,
        });

        if (response.data.success) {
          const activeEmails = response.data.data.filter(
            (email: InstantlyEmail) => email.status === 'active'
          );
          setAvailableEmails(activeEmails);
          setApiValidation({
            loading: false,
            success: true,
            error: null,
            emailCount: activeEmails.length,
          });
        } else {
          setApiValidation({
            loading: false,
            success: false,
            error: 'Invalid API key',
            emailCount: 0,
          });
          setAvailableEmails([]);
        }
      } catch (error) {
        setApiValidation({
          loading: false,
          success: false,
          error: 'Failed to validate API key',
          emailCount: 0,
        });
        setAvailableEmails([]);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [emailConfig.instantlyApiKey]);

  const handleNextField = () => {
    if (currentStep === 1) {
      const currentField = step1Fields[currentFieldIndex];

      // Validation
      if (currentField === 'leadSource' && !leadSettings.leadSource) {
        toast({
          title: "Selection Required",
          description: "Please select a lead source",
          variant: "destructive",
        });
        return;
      }

      if (currentField === 'amountOfLeads' && !leadSettings.amountOfLeads) {
        toast({
          title: "Selection Required",
          description: "Please select the amount of leads",
          variant: "destructive",
        });
        return;
      }

      if (currentField === 'searchTerm') {
        const wordCount = leadSettings.searchTerm.trim().split(/\s+/).length;
        if (!leadSettings.searchTerm.trim()) {
          toast({
            title: "Input Required",
            description: "Please enter a search term",
            variant: "destructive",
          });
          return;
        }
        if (wordCount < 2 || wordCount > 5) {
          toast({
            title: "Invalid Word Count",
            description: "Search term must be 2-5 words",
            variant: "destructive",
          });
          return;
        }
      }

      if (currentFieldIndex < step1Fields.length - 1) {
        setCurrentFieldIndex(currentFieldIndex + 1);
      }
    } else if (currentStep === 2) {
      const currentField = step2Fields[currentFieldIndex];

      // Validation
      if (currentField === 'instantlyApiKey') {
        if (!emailConfig.instantlyApiKey) {
          toast({
            title: "API Key Required",
            description: "Please enter your Instantly API key",
            variant: "destructive",
          });
          return;
        }
        if (apiValidation.loading) {
          toast({
            title: "Validating...",
            description: "Please wait while we validate your API key",
            variant: "destructive",
          });
          return;
        }
        if (!apiValidation.success || apiValidation.emailCount === 0) {
          toast({
            title: "Invalid API Key",
            description: "Please enter a valid API key with active emails",
            variant: "destructive",
          });
          return;
        }
      }

      if (currentField === 'emailSelection' && emailConfig.selectedEmails.length === 0) {
        toast({
          title: "Email Selection Required",
          description: "Please select at least one email account",
          variant: "destructive",
        });
        return;
      }

      if (currentField === 'purposeOfOutreach') {
        if (!emailConfig.purposeOfOutreach.trim()) {
          toast({
            title: "Purpose Required",
            description: "Please describe the purpose of your outreach",
            variant: "destructive",
          });
          return;
        }
        if (emailConfig.purposeOfOutreach.length > 1500) {
          toast({
            title: "Too Long",
            description: "Purpose must be maximum 1500 characters",
            variant: "destructive",
          });
          return;
        }
      }

      if (currentField === 'emailStyle' && !emailConfig.emailStyle) {
        toast({
          title: "Style Required",
          description: "Please select an email style",
          variant: "destructive",
        });
        return;
      }

      if (currentFieldIndex < step2Fields.length - 1) {
        setCurrentFieldIndex(currentFieldIndex + 1);
      }
    }
  };

  const handlePreviousField = () => {
    if (currentFieldIndex > 0) {
      setCurrentFieldIndex(currentFieldIndex - 1);
    }
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      setCurrentFieldIndex(0);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setCurrentFieldIndex(step1Fields.length - 1);
    }
  };

  const handleSubmit = () => {
    // Validate custom style if provided
    if (emailConfig.customStyle && emailConfig.customStyle.length > 500) {
      toast({
        title: "Custom Style Too Long",
        description: "Custom style must be maximum 500 characters",
        variant: "destructive",
      });
      return;
    }

    // Submit the campaign
    toast({
      title: "Campaign Created!",
      description: "Your outreach campaign has been successfully created",
    });

    // Navigate back or to campaign dashboard
    navigate('/campaign');
  };

  const renderLeadSourceField = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Users className="w-4 h-4" />
          Lead Settings
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Select Lead Source</h2>
        <p className="text-muted-foreground">Choose your target platform for outreach</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <button
          onClick={() => {
            setLeadSettings({ ...leadSettings, leadSource: 'media-blog' });
          }}
          className={`group relative p-8 border-2 transition-all hover:border-primary hover:shadow-lg ${
            leadSettings.leadSource === 'media-blog'
              ? 'border-primary bg-primary/5'
              : 'border-border/50 bg-card'
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 bg-muted/50 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Media & Blog Outreach
              </h3>
              <p className="text-sm text-muted-foreground">
                Connect with journalists, bloggers, and media outlets
              </p>
            </div>
          </div>
          {leadSettings.leadSource === 'media-blog' && (
            <div className="absolute top-4 right-4">
              <Check className="w-6 h-6 text-primary" />
            </div>
          )}
        </button>

        <button
          onClick={() => {
            setLeadSettings({ ...leadSettings, leadSource: 'podcast' });
          }}
          className={`group relative p-8 border-2 transition-all hover:border-primary hover:shadow-lg ${
            leadSettings.leadSource === 'podcast'
              ? 'border-primary bg-primary/5'
              : 'border-border/50 bg-card'
          }`}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-24 h-24 bg-muted/50 flex items-center justify-center">
              <Mail className="w-12 h-12 text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Podcast Outreach
              </h3>
              <p className="text-sm text-muted-foreground">
                Reach podcast hosts and audio content creators
              </p>
            </div>
          </div>
          {leadSettings.leadSource === 'podcast' && (
            <div className="absolute top-4 right-4">
              <Check className="w-6 h-6 text-primary" />
            </div>
          )}
        </button>
      </div>
    </div>
  );

  const renderAmountOfLeadsField = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Users className="w-4 h-4" />
          Lead Settings
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Amount of Leads</h2>
        <p className="text-muted-foreground">How many leads do you want to target?</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        {[50, 100, 500, 1000].map((amount) => (
          <button
            key={amount}
            onClick={() => {
              setLeadSettings({ ...leadSettings, amountOfLeads: amount });
            }}
            className={`group p-6 border-2 transition-all hover:border-primary hover:shadow-lg ${
              leadSettings.amountOfLeads === amount
                ? 'border-primary bg-primary/5'
                : 'border-border/50 bg-card'
            }`}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">{amount}</div>
              <div className="text-sm text-muted-foreground">leads</div>
            </div>
            {leadSettings.amountOfLeads === amount && (
              <div className="mt-3 flex justify-center">
                <Check className="w-5 h-5 text-primary" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  const renderSearchTermField = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Users className="w-4 h-4" />
          Lead Settings
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Search Term</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          This is a search engine query, not a prompt. Keep it small and precise.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="p-6 border-border/50 bg-muted/30">
          <div className="space-y-3 text-sm">
            <p className="text-foreground font-medium">What niche and field do you want to find leads in?</p>
            <div className="space-y-2 text-muted-foreground">
              <p>Examples:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>computer engineer</li>
                <li>AI enthusiast</li>
                <li>music artists</li>
                <li>tech startup founders</li>
              </ul>
            </div>
            <p className="text-xs text-muted-foreground border-t border-border/50 pt-3 mt-3">
              <strong>Important:</strong> Must be 2-5 words only
            </p>
          </div>
        </Card>

        <div className="space-y-2">
          <Label htmlFor="searchTerm" className="text-base">Your Search Term</Label>
          <Input
            id="searchTerm"
            placeholder="e.g., tech startup founders"
            value={leadSettings.searchTerm}
            onChange={(e) => {
              setLeadSettings({ ...leadSettings, searchTerm: e.target.value });
            }}
            className="text-lg h-14"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {leadSettings.searchTerm.trim() ? leadSettings.searchTerm.trim().split(/\s+/).length : 0} / 2-5 words
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInstantlyApiField = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Mail className="w-4 h-4" />
          Email Configuration
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Instantly API Key</h2>
        <p className="text-muted-foreground">Enter your Instantly.ai API key to enable email sending</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <div className="space-y-2">
          <Label htmlFor="instantlyApi" className="text-base">API Key</Label>
          <div className="relative">
            <Input
              id="instantlyApi"
              type="password"
              placeholder="Enter your Instantly API key"
              value={emailConfig.instantlyApiKey}
              onChange={(e) => {
                setEmailConfig({ ...emailConfig, instantlyApiKey: e.target.value });
              }}
              className="text-lg h-14 pr-12"
            />
            {apiValidation.loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              </div>
            )}
            {apiValidation.success && !apiValidation.loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
            )}
            {apiValidation.error && !apiValidation.loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <AlertCircle className="w-5 h-5 text-destructive" />
              </div>
            )}
          </div>

          {apiValidation.success && !apiValidation.loading && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded">
              <CheckCircle2 className="w-4 h-4" />
              <span>API key valid - {apiValidation.emailCount} active email{apiValidation.emailCount !== 1 ? 's' : ''} found</span>
            </div>
          )}

          {apiValidation.error && !apiValidation.loading && (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded">
              <AlertCircle className="w-4 h-4" />
              <span>{apiValidation.error}</span>
            </div>
          )}
        </div>

        <Card className="p-4 border-border/50 bg-muted/30">
          <p className="text-sm text-muted-foreground">
            Don't have an API key? Get one from{' '}
            <a
              href="https://instantly.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              instantly.ai
            </a>
          </p>
        </Card>
      </div>
    </div>
  );

  const renderEmailSelectionField = () => {
    const handleEmailToggle = (email: string) => {
      setEmailConfig((prev) => ({
        ...prev,
        selectedEmails: prev.selectedEmails.includes(email)
          ? prev.selectedEmails.filter((e) => e !== email)
          : [...prev.selectedEmails, email],
      }));
    };

    const handleSelectAll = () => {
      if (emailConfig.selectedEmails.length === availableEmails.length) {
        setEmailConfig({ ...emailConfig, selectedEmails: [] });
      } else {
        setEmailConfig({
          ...emailConfig,
          selectedEmails: availableEmails.map((e) => e.email),
        });
      }
    };

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
            <Mail className="w-4 h-4" />
            Email Configuration
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Select Email Accounts</h2>
          <p className="text-muted-foreground">Choose which email accounts to use for this campaign</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {emailConfig.selectedEmails.length} of {availableEmails.length} selected
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="gap-2"
            >
              {emailConfig.selectedEmails.length === availableEmails.length ? (
                <>
                  <X className="w-4 h-4" />
                  Deselect All
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Select All
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableEmails.map((email) => (
              <button
                key={email.email}
                type="button"
                onClick={() => handleEmailToggle(email.email)}
                className={`relative p-6 text-left transition-all border-2 ${
                  emailConfig.selectedEmails.includes(email.email)
                    ? 'border-primary bg-primary/5'
                    : 'border-border/50 bg-card hover:border-primary/50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-foreground break-all">
                        {email.email}
                      </div>
                    </div>
                    {emailConfig.selectedEmails.includes(email.email) && (
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-primary rounded-sm flex items-center justify-center">
                          <Check className="w-3 h-3 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Provider:</span>
                      <div className="font-medium text-foreground">{email.provider}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Daily Limit:</span>
                      <div className="font-medium text-foreground">{email.dailyLimit}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      email.warmupStatus === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-xs text-muted-foreground capitalize">
                      Warmup: {email.warmupStatus}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {availableEmails.length === 0 && (
            <div className="p-8 text-center bg-muted/30 rounded">
              <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No active emails found for this API key</p>
            </div>
          )}

          <Card className="p-4 border-border/50 bg-muted/30">
            <p className="text-xs text-muted-foreground">
              <Users className="w-4 h-4 inline mr-2" />
              Only active email accounts are shown. Select the ones you want to use for outreach.
            </p>
          </Card>
        </div>
      </div>
    );
  };

  const renderPurposeOfOutreachField = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Mail className="w-4 h-4" />
          Email Configuration
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Purpose of Outreach</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explain the purpose of your outreach to help AI generate personalized emails
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="p-6 border-border/50 bg-muted/30">
          <div className="space-y-3 text-sm">
            <p className="text-foreground font-medium">How this works:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
              <li>This purpose will be ingested into every email that leads receive</li>
              <li>Our AI will generate emails based on your description and purpose</li>
              <li>Each email will be personalized for every lead based on their content and background</li>
            </ul>
          </div>
        </Card>

        <div className="space-y-2">
          <Label htmlFor="purpose" className="text-base">Describe Your Purpose</Label>
          <Textarea
            id="purpose"
            placeholder="e.g., I'm reaching out to promote our new AI-powered marketing tool that helps businesses automate their social media presence. We're looking for early adopters who can benefit from our solution and provide feedback."
            value={emailConfig.purposeOfOutreach}
            onChange={(e) => {
              setEmailConfig({ ...emailConfig, purposeOfOutreach: e.target.value });
            }}
            className="min-h-[200px] text-base"
            maxLength={1500}
          />
          <div className="flex justify-end text-xs text-muted-foreground">
            <span>{emailConfig.purposeOfOutreach.length} / 1500 characters</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailStyleField = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
          <Mail className="w-4 h-4" />
          Email Configuration
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Email Style</h2>
        <p className="text-muted-foreground">Choose a style template or describe your own</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {emailStyleTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => {
                setEmailConfig({ ...emailConfig, emailStyle: template.id });
              }}
              className={`group p-4 border-2 transition-all hover:border-primary hover:shadow-lg ${
                emailConfig.emailStyle === template.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border/50 bg-card'
              }`}
            >
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-foreground">{template.name}</h3>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </div>
              {emailConfig.emailStyle === template.id && (
                <div className="mt-2 flex justify-center">
                  <Check className="w-4 h-4 text-primary" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customStyle" className="text-base">
            Custom Style (Optional)
          </Label>
          <Textarea
            id="customStyle"
            placeholder="Describe your own email style here... e.g., Use humor and pop culture references, keep it short and punchy"
            value={emailConfig.customStyle}
            onChange={(e) => {
              setEmailConfig({ ...emailConfig, customStyle: e.target.value });
            }}
            className="min-h-[120px]"
            maxLength={500}
          />
          <div className="flex justify-end text-xs text-muted-foreground">
            <span>{emailConfig.customStyle.length} / 500 characters</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCurrentField = () => {
    if (currentStep === 1) {
      const currentField = step1Fields[currentFieldIndex];
      if (currentField === 'leadSource') return renderLeadSourceField();
      if (currentField === 'amountOfLeads') return renderAmountOfLeadsField();
      if (currentField === 'searchTerm') return renderSearchTermField();
    } else if (currentStep === 2) {
      const currentField = step2Fields[currentFieldIndex];
      if (currentField === 'instantlyApiKey') return renderInstantlyApiField();
      if (currentField === 'emailSelection') return renderEmailSelectionField();
      if (currentField === 'purposeOfOutreach') return renderPurposeOfOutreachField();
      if (currentField === 'emailStyle') return renderEmailStyleField();
    }
    return null;
  };

  const isLastFieldInStep = () => {
    if (currentStep === 1) return currentFieldIndex === step1Fields.length - 1;
    if (currentStep === 2) return currentFieldIndex === step2Fields.length - 1;
    return false;
  };

  const isLastStep = () => currentStep === totalSteps;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Create New Campaign - RELAYA</title>
        <meta name="description" content="Create a new outreach campaign" />
      </Helmet>

      <Header />

      <main className="flex-1 py-12">
        <div className="container max-w-6xl">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate('/campaign')}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Campaign
              </button>
              <div className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </div>
            </div>
            <div className="flex gap-2">
              {[...Array(totalSteps)].map((_, index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 transition-colors ${
                    index + 1 <= currentStep ? 'bg-primary' : 'bg-border/50'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Current Field */}
          <div className="mb-12">{renderCurrentField()}</div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <Button
              variant="outline"
              onClick={handlePreviousField}
              disabled={currentFieldIndex === 0 && currentStep === 1}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-3">
              {currentStep > 1 && currentFieldIndex === 0 && (
                <Button variant="outline" onClick={handlePreviousStep} className="gap-2">
                  Previous Step
                </Button>
              )}

              {!isLastFieldInStep() && (
                <Button onClick={handleNextField} className="gap-2">
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}

              {isLastFieldInStep() && !isLastStep() && (
                <Button onClick={handleNextStep} className="gap-2">
                  Next Step
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}

              {isLastFieldInStep() && isLastStep() && (
                <Button onClick={handleSubmit} className="gap-2">
                  <Check className="w-4 h-4" />
                  Create Campaign
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateNewCampaign;
