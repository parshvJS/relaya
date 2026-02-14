import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, Mail, AlertCircle, CheckCircle2, ExternalLink, User, Calendar, Link as LinkIcon, Trash2, Linkedin, Twitter, Phone, Newspaper, ArrowLeft, LogOut, ChevronDown, Check, Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import axios from 'axios';

interface ProgressData {
  leadsFound: {
    current: number;
    target: number;
    percentage: number;
  };
  personalizedEmails: {
    generated: number;
    total: number;
    percentage: number;
  };
}

interface Author {
  id: number;
  authorName: string;
  authorEmail: string;
  authorLinkedin: string | null;
  authorTwitter: string | null;
  authorPosition: string | null;
  authorPhoneNumber: string | null;
  confidenceScore: number;
  pitchDeskEmail: string | null;
  hasPersonalizedEmail: boolean;
  sources?: any[];
}

interface Article {
  id: number;
  articleLink: string;
  contentSnippet: string;
  articleCreationDate: string;
  authors: Author[];
}

interface Podcast {
  id: number;
  podcastId: string;
  title: string;
  publisher: string;
  email: string;
  website: string | null;
  listenNodeUrl: string;
  podcastImage: string;
  publishDate: string;
  content: string;
  country: string;
  language: string;
  twitterHandle: string | null;
  facebookHandle: string | null;
  instagramHandle: string | null;
  ytHandle: string | null;
  linkedHandle: string | null;
  spotifyHandle: string | null;
  lookingForGuest: boolean;
  lookingForSponsor: boolean;
  lookingForCoHost: boolean;
  lookingforCrossPromotion: boolean;
  pitchDeskEmail: string | null;
  hasPersonalizedEmail: boolean;
  genres: string[];
}

interface CampaignData {
  jobId: number;
  searchTerm: string;
  platform: 'media' | 'podcast';
  amountOfResults: number;
  isCompleted: boolean;
  isError: boolean;
  createdAt: string;
  totalLeadsFound: number;
  personalizedEmailSubject: string | null;
  senderName: string;
  instantlyCampaignId: string | null;
  progress: ProgressData;
  articles?: Article[];
  podcasts?: Podcast[];
}

const CampaignStatus = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [campaignData, setCampaignData] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isGeneratingEmails, setIsGeneratingEmails] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPollingActive, setIsPollingActive] = useState(true);
  const [hasCompletedFinalPoll, setHasCompletedFinalPoll] = useState(false);
  const [isStartingInstantly, setIsStartingInstantly] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Get user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/');
  };

  const getInitials = () => {
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  // Polling function - extracted so it can be called manually
  const pollCampaign = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to view campaign status",
          variant: "destructive",
        });
        navigate('/user/login');
        return true;
      }

      const response = await axios.get(
        `http://localhost:3000/api/outreach/poll/${id}?includeLeads=true&limit=10000`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (response.data.success) {
        const data = response.data.data;
        console.log('Poll data received:', {
          jobId: data.jobId,
          instantlyCampaignId: data.instantlyCampaignId,
          hasInstantlyId: !!data.instantlyCampaignId
        });
        setCampaignData(data);
        setLoading(false);

        // Check if leads finding is complete
        const leadsComplete = data.progress.leadsFound.current >= data.progress.leadsFound.target;

        // Check if email generation is complete
        const emailsComplete = data.progress.personalizedEmails.generated >= data.progress.personalizedEmails.total && data.progress.personalizedEmails.total > 0;

        // Stop polling immediately on error
        if (data.isError) {
          setIsGeneratingEmails(false);
          return true; // Stop polling
        }

        // If both are complete but we haven't done the final poll yet
        if (leadsComplete && emailsComplete && !hasCompletedFinalPoll) {
          console.log('Both progress complete - will do one more poll to fetch actual leads data');
          setHasCompletedFinalPoll(true);
          setIsGeneratingEmails(false);
          return false; // Keep polling for one more cycle
        }

        // If both are complete and we've done the final poll, stop
        if (leadsComplete && emailsComplete && hasCompletedFinalPoll) {
          console.log('Final poll completed - stopping polling');
          return true; // Stop polling
        }

        // Continue polling if either progress is incomplete
        return false; // Keep polling
      } else {
        setError(response.data.message || 'Failed to fetch campaign data');
        setLoading(false);
        return true; // Stop polling
      }
    } catch (err: any) {
      console.error('Polling error:', err);
      if (err.response?.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive",
        });
        navigate('/user/login');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch campaign data');
      }
      setLoading(false);
      return true; // Stop polling on error
    }
  };

  // Polling logic
  useEffect(() => {
    if (!id) {
      setError('Campaign ID is missing');
      setLoading(false);
      return;
    }

    if (!isPollingActive) {
      return;
    }

    // Initial poll
    pollCampaign();

    // Set up polling interval (15 seconds)
    const intervalId = setInterval(async () => {
      const shouldStop = await pollCampaign();
      if (shouldStop) {
        clearInterval(intervalId);
        setIsPollingActive(false);
      }
    }, 15000);

    // Cleanup
    return () => clearInterval(intervalId);
  }, [id, navigate, toast, isPollingActive, isGeneratingEmails, hasCompletedFinalPoll]);

  const handleGenerateEmails = async () => {
    if (!campaignData) return;

    setIsGeneratingEmails(true);
    setHasCompletedFinalPoll(false); // Reset final poll flag when starting new generation

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/outreach/continue-outreach',
        { jobId: campaignData.jobId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast({
          title: "Email Generation Started",
          description: "Personalized emails are being generated. Watch the progress above.",
        });

        // Restart polling to show real-time progress
        setIsPollingActive(true);

        // Poll immediately to get updated status
        setTimeout(() => {
          pollCampaign();
        }, 2000); // Give backend 2 seconds to start processing
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to start email generation",
          variant: "destructive",
        });
        setIsGeneratingEmails(false);
      }
    } catch (err: any) {
      console.error('Error generating emails:', err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to start email generation",
        variant: "destructive",
      });
      setIsGeneratingEmails(false);
    }
  };

  const handleStartInstantly = async () => {
    if (!campaignData) return;

    // Check if campaign already exists
    if (campaignData.instantlyCampaignId) {
      toast({
        title: "Campaign Already Active",
        description: "This campaign has already been started on Instantly.",
        variant: "destructive",
      });
      return;
    }

    setIsStartingInstantly(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:3000/api/outreach/continue-instantly',
        { jobId: campaignData.jobId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        toast({
          title: "Campaign Started!",
          description: `Successfully activated campaign on Instantly. Campaign ID: ${response.data.data.campaignId}`,
        });

        // Update local state to reflect the new campaign ID
        setCampaignData({
          ...campaignData,
          instantlyCampaignId: response.data.data.campaignId
        });
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to start Instantly campaign",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error('Error starting Instantly:', err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to start Instantly campaign",
        variant: "destructive",
      });
    } finally {
      setIsStartingInstantly(false);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!id) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Authentication Required",
          description: "Please login to delete campaigns",
          variant: "destructive",
        });
        navigate('/user/login');
        return;
      }

      const response = await axios.delete(
        `http://localhost:3000/api/outreach/jobs/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (response.data.success) {
        toast({
          title: "Campaign Deleted",
          description: "Your campaign has been successfully deleted",
        });
        navigate('/campaign');
      } else {
        toast({
          title: "Error",
          description: response.data.message || "Failed to delete campaign",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error('Error deleting campaign:', err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to delete campaign",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!campaignData) return;

    const leads = campaignData.platform === 'media'
      ? (campaignData.articles || []).flatMap(article =>
          article.authors.map(author => ({
            type: 'media',
            name: author.authorName,
            email: author.authorEmail,
            position: author.authorPosition || '',
            linkedin: author.authorLinkedin || '',
            twitter: author.authorTwitter || '',
            phoneNumber: author.authorPhoneNumber || '',
            confidenceScore: author.confidenceScore,
            articleLink: article.articleLink,
            articleSnippet: article.contentSnippet?.substring(0, 200) || '',
            articleDate: article.articleCreationDate,
            personalizedEmail: author.pitchDeskEmail || '',
            hasPersonalizedEmail: author.hasPersonalizedEmail
          }))
        )
      : (campaignData.podcasts || []).map(podcast => ({
          type: 'podcast',
          name: podcast.publisher,
          email: podcast.email,
          title: podcast.title,
          website: podcast.website || '',
          listenUrl: podcast.listenNodeUrl,
          country: podcast.country,
          language: podcast.language,
          twitter: podcast.twitterHandle || '',
          facebook: podcast.facebookHandle || '',
          instagram: podcast.instagramHandle || '',
          youtube: podcast.ytHandle || '',
          linkedin: podcast.linkedHandle || '',
          spotify: podcast.spotifyHandle || '',
          lookingForGuest: podcast.lookingForGuest,
          lookingForSponsor: podcast.lookingForSponsor,
          lookingForCoHost: podcast.lookingForCoHost,
          lookingForCrossPromotion: podcast.lookingforCrossPromotion,
          content: podcast.content?.substring(0, 200) || '',
          publishDate: podcast.publishDate,
          personalizedEmail: podcast.pitchDeskEmail || '',
          hasPersonalizedEmail: podcast.hasPersonalizedEmail
        }));

    if (leads.length === 0) {
      toast({
        title: "No Leads Available",
        description: "There are no leads to download yet.",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = Object.keys(leads[0]);
    const csvContent = [
      headers.join(','),
      ...leads.map(lead =>
        headers.map(header => {
          const value = lead[header as keyof typeof lead];
          // Escape quotes and wrap in quotes if contains comma or newline
          const stringValue = String(value ?? '');
          if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `campaign-${id}-leads-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "CSV Downloaded",
      description: `Successfully downloaded ${leads.length} leads`,
    });
  };

  const openLeadDetail = (lead: any) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);
  };

  const closeLeadDetail = () => {
    setIsDetailOpen(false);
    setSelectedLead(null);
  };

  const renderLeadDetail = () => {
    if (!selectedLead) return null;

    if (campaignData?.platform === 'media') {
      return (
        <div className="space-y-6">
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Author Name</h3>
              <p className="text-base text-foreground">{selectedLead.authorName}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
              <a href={`mailto:${selectedLead.authorEmail}`} className="text-base text-primary hover:underline">
                {selectedLead.authorEmail}
              </a>
            </div>

            {selectedLead.authorPosition && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Position</h3>
                <p className="text-base text-foreground">{selectedLead.authorPosition}</p>
              </div>
            )}

            {selectedLead.confidenceScore && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Confidence Score</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedLead.confidenceScore >= 90 ? "default" : "secondary"}>
                    {selectedLead.confidenceScore}%
                  </Badge>
                </div>
              </div>
            )}

            {selectedLead.authorLinkedin && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">LinkedIn</h3>
                <a
                  href={selectedLead.authorLinkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-primary hover:underline flex items-center gap-1"
                >
                  View Profile <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {selectedLead.authorTwitter && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Twitter</h3>
                <p className="text-base text-foreground">@{selectedLead.authorTwitter}</p>
              </div>
            )}

            {selectedLead.authorPhoneNumber && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Phone Number</h3>
                <p className="text-base text-foreground">{selectedLead.authorPhoneNumber}</p>
              </div>
            )}

            {selectedLead.pitchDeskEmail && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Personalized Email</h3>
                <div className="bg-muted/50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                  {selectedLead.pitchDeskEmail}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } else {
      // Podcast details
      return (
        <div className="space-y-6">
          <div className="space-y-3">
            {selectedLead.podcastImage && (
              <div className="flex justify-center">
                <img
                  src={selectedLead.podcastImage}
                  alt={selectedLead.title}
                  className="w-32 h-32 rounded-lg object-cover"
                />
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Podcast Title</h3>
              <p className="text-base text-foreground font-medium">{selectedLead.title}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Publisher</h3>
              <p className="text-base text-foreground">{selectedLead.publisher}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
              <a href={`mailto:${selectedLead.email}`} className="text-base text-primary hover:underline">
                {selectedLead.email}
              </a>
            </div>

            {selectedLead.website && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Website</h3>
                <a
                  href={selectedLead.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-primary hover:underline flex items-center gap-1"
                >
                  Visit Website <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Listen</h3>
              <a
                href={selectedLead.listenNodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-primary hover:underline flex items-center gap-1"
              >
                Listen on ListenNotes <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Country</h3>
                <p className="text-base text-foreground">{selectedLead.country}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Language</h3>
                <p className="text-base text-foreground">{selectedLead.language}</p>
              </div>
            </div>

            {/* Social Media Handles */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Social Media</h3>
              <div className="space-y-1 text-sm">
                {selectedLead.twitterHandle && (
                  <p><span className="text-muted-foreground">Twitter:</span> {selectedLead.twitterHandle}</p>
                )}
                {selectedLead.facebookHandle && (
                  <p><span className="text-muted-foreground">Facebook:</span> {selectedLead.facebookHandle}</p>
                )}
                {selectedLead.instagramHandle && (
                  <p><span className="text-muted-foreground">Instagram:</span> {selectedLead.instagramHandle}</p>
                )}
                {selectedLead.ytHandle && (
                  <p><span className="text-muted-foreground">YouTube:</span> {selectedLead.ytHandle}</p>
                )}
                {selectedLead.linkedHandle && (
                  <p><span className="text-muted-foreground">LinkedIn:</span> {selectedLead.linkedHandle}</p>
                )}
                {selectedLead.spotifyHandle && (
                  <p><span className="text-muted-foreground">Spotify:</span> {selectedLead.spotifyHandle}</p>
                )}
              </div>
            </div>

            {/* Looking For Section */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Opportunities</h3>
              <div className="flex flex-wrap gap-2">
                {selectedLead.lookingForGuest && (
                  <Badge variant="secondary">Looking for Guests</Badge>
                )}
                {selectedLead.lookingForSponsor && (
                  <Badge variant="secondary">Looking for Sponsors</Badge>
                )}
                {selectedLead.lookingForCoHost && (
                  <Badge variant="secondary">Looking for Co-Host</Badge>
                )}
                {selectedLead.lookingforCrossPromotion && (
                  <Badge variant="secondary">Looking for Cross-Promotion</Badge>
                )}
              </div>
            </div>

            {selectedLead.content && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <p className="text-sm text-foreground line-clamp-4">{selectedLead.content}</p>
              </div>
            )}

            {selectedLead.pitchDeskEmail && (
              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Personalized Email</h3>
                <div className="bg-muted/50 p-4 rounded-lg text-sm whitespace-pre-wrap">
                  {selectedLead.pitchDeskEmail}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  // Dashboard Header Component
  const DashboardHeader = () => (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link to="/dashboard" className="flex items-center">
          <img
            src="/logo-black.svg"
            alt="Relaya Logo"
            className="h-8 lg:h-10 w-auto object-contain dark:hidden"
          />
          <img
            src="/logo-white.svg"
            alt="Relaya Logo"
            className="h-8 lg:h-10 w-auto object-contain hidden dark:block"
          />
        </Link>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-3 hover:bg-accent">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.email?.split('@')[0] || 'User'}</span>
                  <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );

  if (loading && !campaignData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Helmet>
          <title>Campaign Status - RELAYA</title>
        </Helmet>
        <DashboardHeader />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="container max-w-2xl">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-foreground">Loading Campaign</h1>
                <p className="text-muted-foreground">
                  Please wait while we fetch your campaign data...
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Helmet>
          <title>Campaign Status - RELAYA</title>
        </Helmet>
        <DashboardHeader />
        <main className="flex-1 flex items-center justify-center py-12">
          <div className="container max-w-2xl">
            <Card className="p-8">
              <div className="text-center space-y-4">
                <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
                <h1 className="text-3xl font-bold text-foreground">Error Loading Campaign</h1>
                <p className="text-muted-foreground">{error}</p>
                <Button onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </Button>
              </div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!campaignData) {
    return null;
  }

  // Lead sourcing is complete when job is marked complete OR percentage reaches 100% AND at least some leads were found
  const leadsFoundComplete = (campaignData.isCompleted || campaignData.progress.leadsFound.percentage === 100) && campaignData.totalLeadsFound > 0;

  // Email generation is complete when all emails for found leads are generated
  const emailsComplete = campaignData.progress.personalizedEmails.generated >= campaignData.progress.personalizedEmails.total && campaignData.progress.personalizedEmails.total > 0;

  const instantlyComplete = !!campaignData.instantlyCampaignId;
  const showGenerateEmailsButton = leadsFoundComplete && !emailsComplete && campaignData.progress.personalizedEmails.generated === 0;

  const leads = campaignData.platform === 'media'
    ? (campaignData.articles || []).flatMap(article => article.authors)
    : (campaignData.podcasts || []);

  // Step status helper
  const getStepStatus = (stepNumber: number): 'completed' | 'in-progress' | 'pending' => {
    if (stepNumber === 1) {
      return leadsFoundComplete ? 'completed' : 'in-progress';
    }
    if (stepNumber === 2) {
      if (emailsComplete) return 'completed';
      // Only show in-progress if actually generating or has started generating
      if (isGeneratingEmails || campaignData.progress.personalizedEmails.generated > 0) {
        return 'in-progress';
      }
      return 'pending';
    }
    if (stepNumber === 3) {
      if (instantlyComplete) return 'completed';
      // Only show in-progress if actually starting
      if (isStartingInstantly) return 'in-progress';
      return 'pending';
    }
    return 'pending';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Campaign Status - RELAYA</title>
        <meta name="description" content="Track your campaign progress" />
      </Helmet>

      <DashboardHeader />

      <main className="flex-1 py-8">
        <div className="container max-w-6xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Campaign Workflow</h1>
              <p className="text-muted-foreground">
                {campaignData.searchTerm} • {campaignData.platform === 'media' ? 'Media & Blog' : 'Podcast'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Campaign
            </Button>
          </div>

          {/* Step-based Workflow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* STEP 1: Finding Leads */}
            <Card className={`p-6 ${getStepStatus(1) === 'completed' ? 'border-green-500' : getStepStatus(1) === 'in-progress' ? 'border-primary' : ''}`}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    getStepStatus(1) === 'completed' ? 'bg-green-500' :
                    getStepStatus(1) === 'in-progress' ? 'bg-primary' : 'bg-muted'
                  }`}>
                    {getStepStatus(1) === 'completed' ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : getStepStatus(1) === 'in-progress' ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">1</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">Lead Sourcing</h3>
                    <p className="text-xs text-muted-foreground">Finding relevant leads</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">
                      {campaignData.progress.leadsFound.current} / {campaignData.progress.leadsFound.target}
                    </span>
                  </div>
                  <Progress
                    value={leadsFoundComplete ? 100 : campaignData.progress.leadsFound.percentage}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {leadsFoundComplete ? (
                      <span className="text-green-600 font-medium">Completed - {campaignData.progress.leadsFound.current} leads found</span>
                    ) : campaignData.isCompleted && campaignData.totalLeadsFound === 0 ? (
                      <span className="text-amber-600 font-medium">Search completed - No leads found</span>
                    ) : (
                      `${campaignData.progress.leadsFound.percentage}% Complete`
                    )}
                  </p>
                </div>

                {leadsFoundComplete ? (
                  <Badge variant="default" className="w-full justify-center">
                    <Check className="w-3 h-3 mr-1" />
                    Step Completed
                  </Badge>
                ) : campaignData.isCompleted && campaignData.totalLeadsFound === 0 ? (
                  <Badge variant="secondary" className="w-full justify-center bg-amber-100 text-amber-800 border-amber-300">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    No Leads Found
                  </Badge>
                ) : null}
              </div>
            </Card>

            {/* STEP 2: Email Generation */}
            <Card className={`p-6 ${getStepStatus(2) === 'completed' ? 'border-green-500' : getStepStatus(2) === 'in-progress' ? 'border-primary' : 'border-muted'}`}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    getStepStatus(2) === 'completed' ? 'bg-green-500' :
                    getStepStatus(2) === 'in-progress' ? 'bg-primary' : 'bg-muted'
                  }`}>
                    {getStepStatus(2) === 'completed' ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : getStepStatus(2) === 'in-progress' ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">2</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">Email Generation</h3>
                    <p className="text-xs text-muted-foreground">Creating personalized emails</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">
                      {campaignData.progress.personalizedEmails.generated} / {campaignData.progress.personalizedEmails.total}
                    </span>
                  </div>
                  <Progress
                    value={emailsComplete ? 100 : campaignData.progress.personalizedEmails.percentage}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {emailsComplete ? (
                      <span className="text-green-600 font-medium">Completed - {campaignData.progress.personalizedEmails.generated} emails generated</span>
                    ) : (
                      `${campaignData.progress.personalizedEmails.percentage}% Complete`
                    )}
                  </p>
                </div>

                {emailsComplete ? (
                  <Badge variant="default" className="w-full justify-center">
                    <Check className="w-3 h-3 mr-1" />
                    Step Completed
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={handleGenerateEmails}
                    disabled={!leadsFoundComplete || isGeneratingEmails}
                    className="w-full"
                  >
                    {isGeneratingEmails ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : !leadsFoundComplete ? (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Waiting for Step 1
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Generate Emails
                      </>
                    )}
                  </Button>
                )}
              </div>
            </Card>

            {/* STEP 3: Instantly Integration */}
            <Card className={`p-6 ${getStepStatus(3) === 'completed' ? 'border-green-500' : getStepStatus(3) === 'in-progress' ? 'border-primary' : 'border-muted'}`}>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    getStepStatus(3) === 'completed' ? 'bg-green-500' :
                    getStepStatus(3) === 'in-progress' ? 'bg-primary' : 'bg-muted'
                  }`}>
                    {getStepStatus(3) === 'completed' ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : getStepStatus(3) === 'in-progress' ? (
                      <Mail className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">3</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground">Instantly Campaign</h3>
                    <p className="text-xs text-muted-foreground">Launch outreach campaign</p>
                  </div>
                </div>

                {instantlyComplete ? (
                  <div className="space-y-2">
                    <Badge variant="default" className="w-full justify-center mb-2">
                      <Check className="w-3 h-3 mr-1" />
                      Campaign Active
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => window.open(`https://app.instantly.ai/app/campaign/${campaignData.instantlyCampaignId}/leads`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View in Instantly
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      ID: {campaignData.instantlyCampaignId?.substring(0, 12)}...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {emailsComplete ? 'Ready to start campaign' : 'Complete email generation first'}
                    </p>
                    <Button
                      size="sm"
                      onClick={handleStartInstantly}
                      disabled={!emailsComplete || isStartingInstantly}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      {isStartingInstantly ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Starting...
                        </>
                      ) : !emailsComplete ? (
                        <>
                          <Clock className="w-4 h-4 mr-2" />
                          Waiting for Step 2
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Start Campaign
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Download Button */}
          {leads.length > 0 && (
            <div className="flex justify-center">
              <Button
                size="lg"
                variant="outline"
                onClick={handleDownloadCSV}
                className="gap-2"
              >
                <Download className="w-5 h-5" />
                Download CSV ({leads.length} leads)
              </Button>
            </div>
          )}

          {/* Leads Display */}
          {leads.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  Leads Found ({leads.length})
                </h2>
                {campaignData.personalizedEmailSubject && (
                  <Badge variant="secondary" className="text-sm">
                    Email Subject: {campaignData.personalizedEmailSubject}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {campaignData.platform === 'media' ? (
                  // Media leads
                  campaignData.articles?.flatMap(article =>
                    article.authors.map(author => (
                      <Card
                        key={author.id}
                        className="p-5 cursor-pointer hover:border-primary hover:shadow-md transition-all"
                        onClick={() => openLeadDetail(author)}
                      >
                        <div className="space-y-3">
                          {/* Header with name and badges */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
                                {author.authorName}
                              </h3>
                              {author.authorPosition && (
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {author.authorPosition}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {author.hasPersonalizedEmail && (
                                <Badge variant="default" className="text-xs">
                                  <Mail className="w-3 h-3 mr-1" />
                                  Email
                                </Badge>
                              )}
                              {author.confidenceScore && (
                                <Badge
                                  variant={author.confidenceScore >= 90 ? "default" : "secondary"}
                                  className="text-xs"
                                >
                                  {author.confidenceScore}%
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Contact Information */}
                          <div className="space-y-2">
                            {author.authorEmail && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                <span className="text-foreground truncate">{author.authorEmail}</span>
                              </div>
                            )}
                            {author.authorPhoneNumber && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                <span className="text-foreground truncate">{author.authorPhoneNumber}</span>
                              </div>
                            )}
                          </div>

                          {/* Social Links */}
                          {(author.authorLinkedin || author.authorTwitter) && (
                            <div className="flex items-center gap-2">
                              {author.authorLinkedin && (
                                <a
                                  href={author.authorLinkedin}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded hover:bg-accent transition-colors"
                                  title="LinkedIn Profile"
                                >
                                  <Linkedin className="w-4 h-4 text-blue-600" />
                                </a>
                              )}
                              {author.authorTwitter && (
                                <a
                                  href={author.authorTwitter}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                  className="p-1.5 rounded hover:bg-accent transition-colors"
                                  title="Twitter Profile"
                                >
                                  <Twitter className="w-4 h-4 text-sky-500" />
                                </a>
                              )}
                            </div>
                          )}

                          {/* Article Information */}
                          <div className="pt-3 border-t border-border/50 space-y-2">
                            <div className="flex items-start gap-2">
                              <Newspaper className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                                  {article.contentSnippet}
                                </p>
                                <div className="flex items-center gap-2">
                                  {article.articleCreationDate && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(article.articleCreationDate).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </span>
                                  )}
                                  {article.articleLink && (
                                    <a
                                      href={article.articleLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-xs text-primary hover:underline flex items-center gap-1"
                                    >
                                      View Article
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )
                ) : (
                  // Podcast leads
                  campaignData.podcasts?.map(podcast => (
                    <Card
                      key={podcast.id}
                      className="p-5 cursor-pointer hover:border-primary transition-colors"
                      onClick={() => openLeadDetail(podcast)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          {podcast.podcastImage && (
                            <img
                              src={podcast.podcastImage}
                              alt={podcast.title}
                              className="w-12 h-12 rounded object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground line-clamp-2 text-sm">
                              {podcast.title}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {podcast.publisher}
                            </p>
                          </div>
                          {podcast.hasPersonalizedEmail && (
                            <Badge variant="default" className="flex-shrink-0">
                              <Mail className="w-3 h-3" />
                            </Badge>
                          )}
                        </div>

                        <div className="text-sm space-y-1">
                          <p className="text-muted-foreground truncate text-xs">
                            {podcast.email}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>{podcast.country}</span>
                            <span>•</span>
                            <span>{podcast.language}</span>
                          </div>
                        </div>

                        {(podcast.lookingForGuest || podcast.lookingForSponsor || podcast.lookingForCoHost || podcast.lookingforCrossPromotion) && (
                          <div className="flex flex-wrap gap-1">
                            {podcast.lookingForGuest && (
                              <Badge variant="outline" className="text-xs">Guest</Badge>
                            )}
                            {podcast.lookingForSponsor && (
                              <Badge variant="outline" className="text-xs">Sponsor</Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* No leads yet */}
          {leads.length === 0 && leadsFoundComplete && (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Leads Found</h3>
                  <p className="text-muted-foreground">
                    We couldn't find any leads matching your criteria. Try adjusting your search term.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* Detail Dialog/Drawer */}
      {isMobile ? (
        <Drawer open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DrawerContent className="max-h-[90vh]">
            <DrawerHeader>
              <DrawerTitle>
                {campaignData.platform === 'media' ? selectedLead?.authorName : selectedLead?.title}
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-8 overflow-y-auto">
              {renderLeadDetail()}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {campaignData.platform === 'media' ? selectedLead?.authorName : selectedLead?.title}
              </DialogTitle>
            </DialogHeader>
            {renderLeadDetail()}
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
              All associated data including leads, emails, and progress will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCampaign}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CampaignStatus;
