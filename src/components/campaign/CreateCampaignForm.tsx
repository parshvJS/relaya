import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Check, Sparkles, Users, Mail, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
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
  senderName: string;
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
  { id: 'professional', name: 'Professional', description: 'Formal business tone' },
  { id: 'casual', name: 'Casual', description: 'Friendly conversation' },
  { id: 'enthusiastic', name: 'Enthusiastic', description: 'Energetic style' },
  { id: 'direct', name: 'Direct', description: 'Straightforward' },
  { id: 'storytelling', name: 'Storytelling', description: 'Narrative-driven' },
];

interface CreateCampaignFormProps {
  onClose: () => void;
}

const CreateCampaignForm = ({ onClose }: CreateCampaignFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [currentFieldIndex, setCurrentFieldIndex] = useState(0);

  const [leadSettings, setLeadSettings] = useState<LeadSettings>({
    leadSource: '',
    amountOfLeads: 0,
    searchTerm: '',
  });

  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    instantlyApiKey: '',
    selectedEmails: [],
    purposeOfOutreach: '',
    senderName: '',
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
  const step1Fields = ['leadSource', 'amountOfLeads', 'searchTerm'];
  const step2Fields = ['instantlyApiKey', 'emailSelection', 'purposeOfOutreach', 'senderName', 'emailStyle'];

  // Reset amountOfLeads when leadSource changes if the current selection is invalid
  useEffect(() => {
    const validOptions = leadSettings.leadSource === 'media-blog'
      ? [10, 50, 100]
      : [10, 50, 100, 200];

    if (leadSettings.amountOfLeads && !validOptions.includes(leadSettings.amountOfLeads)) {
      setLeadSettings(prev => ({ ...prev, amountOfLeads: 0 }));
    }
  }, [leadSettings.leadSource]);

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
        const response = await axios.post('https://relaya-backend-rhsy6.ondigitalocean.app/api/outreach/instantlyApiCheck', {
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

      if (currentField === 'senderName') {
        if (!emailConfig.senderName.trim()) {
          toast({
            title: "Sender Name Required",
            description: "Please enter the sender name for email signature",
            variant: "destructive",
          });
          return;
        }
        if (emailConfig.senderName.length > 100) {
          toast({
            title: "Too Long",
            description: "Sender name must be maximum 100 characters",
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

  const handleSubmit = async () => {
    console.log('=== HANDLE SUBMIT CALLED ===');
    console.log('Lead Settings:', leadSettings);
    console.log('Email Config:', emailConfig);

    if (emailConfig.customStyle && emailConfig.customStyle.length > 500) {
      toast({
        title: "Custom Style Too Long",
        description: "Custom style must be maximum 500 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare the API payload
      const payload = {
        searchTerm: leadSettings.searchTerm.trim(),
        instantlyApiKey: emailConfig.instantlyApiKey,
        numberOfLeads: leadSettings.amountOfLeads,
        senderName: emailConfig.senderName.trim(),
        instantlyEmails: emailConfig.selectedEmails,
        emailPurpose: emailConfig.purposeOfOutreach.trim(),
        emailStyle: emailConfig.customStyle.trim() || emailConfig.emailStyle,
        platform: leadSettings.leadSource === 'media-blog' ? 'media' : 'podcast',
        freshness: 'week' // Default freshness for media platform
      };

      // Get token from localStorage
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);

      if (!token) {
        console.log('No token found, redirecting to login');
        toast({
          title: "Authentication Required",
          description: "Please login to create a campaign",
          variant: "destructive",
        });
        navigate('/user/login');
        return;
      }

      // Show loading toast
      toast({
        title: "Creating Campaign...",
        description: "Please wait while we set up your outreach campaign",
      });

      console.log('Making API call with payload:', payload);

      // Make API call to create campaign
      const response = await axios.post(
        'https://relaya-backend-rhsy6.ondigitalocean.app/api/outreach/start-job',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('API Response:', response.data);

      if (response.data.success) {
        const jobId = response.data.data.jobId;
        console.log('Campaign created successfully, jobId:', jobId);

        toast({
          title: "Campaign Started!",
          description: "Redirecting to campaign status...",
        });

        // Close the modal/form
        onClose();

        // Redirect to campaign status page
        console.log('Navigating to:', `/campaign-status/${jobId}`);
        navigate(`/campaign-status/${jobId}`);
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to create campaign",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('=== ERROR IN HANDLE SUBMIT ===');
      console.error('Error creating campaign:', error);
      console.error('Error response:', error.response);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    }
  };

  const renderLeadSourceField = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">Select Lead Source</h2>
        <p className="text-muted-foreground text-lg">Choose your target platform for outreach</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <button
          onClick={() => setLeadSettings({ ...leadSettings, leadSource: 'media-blog' })}
          className={`group relative p-10 bg-card transition-all hover:bg-accent ${
            leadSettings.leadSource === 'media-blog' ? 'ring-2 ring-primary' : ''
          }`}
        >
          <div className="flex flex-col items-center gap-6">
            <div className="w-28 h-28 bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-16 h-16 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold text-foreground">Media & Blog Outreach</h3>
              <p className="text-sm text-muted-foreground">Connect with journalists, bloggers, and media outlets</p>
            </div>
          </div>
          {leadSettings.leadSource === 'media-blog' && (
            <div className="absolute top-4 right-4 bg-primary p-1">
              <Check className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
        </button>

        <button
          onClick={() => setLeadSettings({ ...leadSettings, leadSource: 'podcast' })}
          className={`group relative p-10 bg-card transition-all hover:bg-accent ${
            leadSettings.leadSource === 'podcast' ? 'ring-2 ring-primary' : ''
          }`}
        >
          <div className="flex flex-col items-center gap-6">
            <div className="w-28 h-28 bg-primary/10 flex items-center justify-center">
              <Mail className="w-16 h-16 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold text-foreground">Podcast Outreach</h3>
              <p className="text-sm text-muted-foreground">Reach podcast hosts and audio content creators</p>
            </div>
          </div>
          {leadSettings.leadSource === 'podcast' && (
            <div className="absolute top-4 right-4 bg-primary p-1">
              <Check className="w-5 h-5 text-primary-foreground" />
            </div>
          )}
        </button>
      </div>

      <div className="p-4 bg-muted/30 text-xs text-muted-foreground max-w-4xl">
        <Users className="w-4 h-4 inline mr-2" />
        Select the platform that best matches your target audience
      </div>
    </div>
  );

  const renderAmountOfLeadsField = () => {
    // Define lead options based on platform
    const leadOptions = leadSettings.leadSource === 'media-blog'
      ? [10, 50, 100] // Media: only 10, 50, 100
      : [10, 50, 100, 200]; // Podcast: 10, 50, 100, 200

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Amount of Leads</h2>
          <p className="text-muted-foreground text-lg">How many leads do you want to target?</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
          {leadOptions.map((amount) => (
            <button
              key={amount}
              onClick={() => setLeadSettings({ ...leadSettings, amountOfLeads: amount })}
              className={`p-8 bg-card transition-all hover:bg-accent ${
                leadSettings.amountOfLeads === amount ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-foreground">{amount}</div>
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

        <div className="p-4 bg-muted/30 text-xs text-muted-foreground max-w-3xl">
          <Users className="w-4 h-4 inline mr-2" />
          {leadSettings.leadSource === 'media-blog'
            ? 'Media campaigns: up to 100 leads for quality results'
            : 'Podcast campaigns: up to 200 leads available'}
        </div>
      </div>
    );
  };

  const renderSearchTermField = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">Search Term</h2>
        <p className="text-muted-foreground text-lg">Define your target niche and field</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="space-y-3">
          <Label htmlFor="searchTerm" className="text-xl font-medium">Your Search Term</Label>
          <Input
            id="searchTerm"
            placeholder="e.g., tech startup founders"
            value={leadSettings.searchTerm}
            onChange={(e) => setLeadSettings({ ...leadSettings, searchTerm: e.target.value })}
            className="text-xl h-16 bg-card"
          />
          <div className="text-sm text-muted-foreground">
            {leadSettings.searchTerm.trim() ? leadSettings.searchTerm.trim().split(/\s+/).length : 0} / 2-5 words
          </div>
        </div>

        <div className="p-4 bg-muted/30 text-xs text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">This is a search engine query, not a prompt. Keep it precise.</p>
          <p>Examples: computer engineer • AI enthusiast • music artists • tech startup founders</p>
          <p className="text-xs opacity-75">Must be 2-5 words only</p>
        </div>
      </div>
    </div>
  );

  const renderInstantlyApiField = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">Instantly API Key</h2>
        <p className="text-muted-foreground text-lg">Connect your email sending service</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="space-y-3">
          <Label htmlFor="instantlyApi" className="text-xl font-medium">API Key</Label>
          <div className="relative">
            <Input
              id="instantlyApi"
              type="password"
              placeholder="Enter your Instantly API key"
              value={emailConfig.instantlyApiKey}
              onChange={(e) => setEmailConfig({ ...emailConfig, instantlyApiKey: e.target.value })}
              className="text-xl h-16 bg-card pr-12"
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

        <div className="p-4 bg-muted/30 text-xs text-muted-foreground">
          <Mail className="w-4 h-4 inline mr-2" />
          Don't have an API key? Get one from{' '}
          <a href="https://instantly.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            instantly.ai
          </a>
        </div>
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
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-3">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Select Email Accounts</h2>
          <p className="text-muted-foreground text-lg">Choose which email accounts to use for this campaign</p>
        </div>

        <div className="max-w-4xl space-y-6">
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

          <div className="p-4 bg-muted/30 text-xs text-muted-foreground">
            <Users className="w-4 h-4 inline mr-2" />
            Only active email accounts are shown. Select the ones you want to use for outreach.
          </div>
        </div>
      </div>
    );
  };

  const renderPurposeOfOutreachField = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">Purpose of Outreach</h2>
        <p className="text-muted-foreground text-lg">Explain why you're reaching out</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="space-y-3">
          <Label htmlFor="purpose" className="text-xl font-medium">Describe Your Purpose</Label>
          <Textarea
            id="purpose"
            placeholder="I'm reaching out to promote our new AI-powered marketing tool that helps businesses automate their social media presence. We're looking for early adopters who can benefit from our solution and provide feedback."
            value={emailConfig.purposeOfOutreach}
            onChange={(e) => setEmailConfig({ ...emailConfig, purposeOfOutreach: e.target.value })}
            className="min-h-[200px] text-base bg-card"
            maxLength={1500}
          />
          <div className="text-sm text-muted-foreground text-right">
            {emailConfig.purposeOfOutreach.length} / 1500 characters
          </div>
        </div>

        <div className="p-4 bg-muted/30 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">How this works:</p>
          <p>• AI generates personalized emails based on your purpose</p>
          <p>• Each email is customized for the lead's background</p>
          <p>• Purpose is ingested into every outreach message</p>
        </div>
      </div>
    </div>
  );

  const renderSenderNameField = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">Sender Name</h2>
        <p className="text-muted-foreground text-lg">Who will the emails be signed by?</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="space-y-3">
          <Label htmlFor="senderName" className="text-xl font-medium">Your Name</Label>
          <Input
            id="senderName"
            placeholder="e.g., John Smith"
            value={emailConfig.senderName}
            onChange={(e) => setEmailConfig({ ...emailConfig, senderName: e.target.value })}
            className="text-xl h-16 bg-card"
            maxLength={100}
          />
          <div className="text-sm text-muted-foreground text-right">
            {emailConfig.senderName.length} / 100 characters
          </div>
        </div>

        <div className="p-4 bg-muted/30 text-xs text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">How this will appear:</p>
          <div className="bg-card p-3 rounded border border-border/50">
            <p className="text-foreground italic">Best regards,</p>
            <p className="text-foreground font-medium">{emailConfig.senderName || 'Your Name'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailStyleField = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">Email Style</h2>
        <p className="text-muted-foreground text-lg">Choose your communication style</p>
      </div>

      <div className="max-w-4xl space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {emailStyleTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => setEmailConfig({ ...emailConfig, emailStyle: template.id })}
              className={`p-5 bg-card transition-all hover:bg-accent ${
                emailConfig.emailStyle === template.id ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="text-center space-y-2">
                <h3 className="font-semibold text-foreground text-sm">{template.name}</h3>
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

        <div className="space-y-3">
          <Label htmlFor="customStyle" className="text-base font-medium">Custom Style (Optional)</Label>
          <Textarea
            id="customStyle"
            placeholder="Describe your own email style... e.g., Use humor and pop culture references"
            value={emailConfig.customStyle}
            onChange={(e) => setEmailConfig({ ...emailConfig, customStyle: e.target.value })}
            className="min-h-[100px] bg-card"
            maxLength={500}
          />
          <div className="text-sm text-muted-foreground text-right">
            {emailConfig.customStyle.length} / 500 characters
          </div>
        </div>

        <div className="p-4 bg-muted/30 text-xs text-muted-foreground">
          <Sparkles className="w-4 h-4 inline mr-2" />
          Select a template or describe your own unique style
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
      if (currentField === 'senderName') return renderSenderNameField();
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
    <div className="flex-1 overflow-y-auto">
      <div className="container max-w-5xl py-8 px-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create New Campaign</h1>
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps} • {currentStep === 1 ? 'Lead Settings' : 'Email Configuration'}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex gap-2">
            {[...Array(totalSteps)].map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 transition-colors ${
                  index + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Current Field */}
        <div className="mb-12">{renderCurrentField()}</div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-8 border-t border-border/50">
          <Button
            variant="ghost"
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
    </div>
  );
};

export default CreateCampaignForm;
