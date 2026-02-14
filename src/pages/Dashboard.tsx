import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Layers,
  Zap,
  Shield,
  BarChart3,
  Globe,
  Trophy,
  FileText,
  Sparkles,
  Calendar,
  Send,
  Image,
  Images,
  LogOut,
  User,
  Settings,
  ChevronDown,
  Menu,
  X,
  Moon,
  Sun,
  Loader2,
  ExternalLink,
  Trash2
} from 'lucide-react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PR_SERVICES, CAPABILITY_LAYERS } from '@/data/prServices';
import ServiceCard from '@/components/ServiceCard';
import ServiceModal from '@/components/ServiceModal';
import UrlAnalyzer from '@/components/UrlAnalyzer';
import CompetitorAnalyzer from '@/components/CompetitorAnalyzer';
import PressKitBuilder from '@/components/PressKitBuilder';
import BrandVoiceTrainer from '@/components/BrandVoiceTrainer';
import CampaignPlanner from '@/components/CampaignPlanner';
import SocialMediaPublisher from '@/components/SocialMediaPublisher';
import ImageGenerator from '@/components/ImageGenerator';
import ImageGallery from '@/components/ImageGallery';
import ScrollToTop from '@/components/ScrollToTop';
import CreateCampaignForm from '@/components/campaign/CreateCampaignForm';
import type { PRService } from '@/data/prServices';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<PRService | null>(null);
  const [activeTab, setActiveTab] = useState('services');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [deletingCampaignId, setDeletingCampaignId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const galleryRefreshRef = useRef<(() => void) | null>(null);

  // Check for saved theme preference or default to light mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  useEffect(() => {
    // Check if user is authenticated using localStorage
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      navigate('/user/login');
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/user/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const filteredServices = PR_SERVICES.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.layer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLayer = selectedLayer === null || service.layerNumber === selectedLayer;
    return matchesSearch && matchesLayer;
  });

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

  const fetchCampaigns = async () => {
    setCampaignsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        setCampaignsLoading(false);
        return;
      }

      const response = await axios.get('https://relaya-backend-rhsy6.ondigitalocean.app/api/outreach/jobs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.data.success) {
        // Sort by creation date (newest first)
        const sortedCampaigns = (response.data.data || []).sort((a: any, b: any) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setCampaigns(sortedCampaigns);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: "Error",
        description: "Failed to fetch campaigns",
        variant: "destructive",
      });
    } finally {
      setCampaignsLoading(false);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!deletingCampaignId) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.delete(
        `https://relaya-backend-rhsy6.ondigitalocean.app/api/outreach/jobs/${deletingCampaignId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Campaign deleted successfully",
        });
        // Remove from local state
        setCampaigns(campaigns.filter(c => c.id !== deletingCampaignId));
      }
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete campaign",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setDeletingCampaignId(null);
    }
  };

  const openDeleteDialog = (campaignId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent navigation to campaign details
    setDeletingCampaignId(campaignId);
    setShowDeleteDialog(true);
  };

  // Fetch campaigns when outreach tab is active
  useEffect(() => {
    if (activeTab === 'outreach' && user) {
      fetchCampaigns();
    }
  }, [activeTab, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center">
            <img
              src={isDarkMode ? '/logo-white.svg' : '/logo-black.svg'}
              alt="Relaya Logo"
              className="h-8 lg:h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {[
              { id: 'services', label: 'Services', icon: Layers },
              { id: 'tools', label: 'Tools', icon: Zap },
              { id: 'outreach', label: 'Outreach', icon: Send },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 lg:px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-accent transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 lg:w-5 lg:h-5" />
              ) : (
                <Moon className="w-4 h-4 lg:w-5 lg:h-5" />
              )}
            </button>

            {/* User Menu - Desktop */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 lg:px-3 hover:bg-accent">
                    <Avatar className="h-8 w-8 lg:h-9 lg:w-9">
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

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background rounded-b-lg">
            {/* Mobile Navigation */}
            <nav className="px-4 py-3 space-y-1">
              {[
                { id: 'services', label: 'Services', icon: Layers },
                { id: 'tools', label: 'Tools', icon: Zap },
                { id: 'outreach', label: 'Outreach', icon: Send },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Mobile User Section */}
            <div className="border-t border-border px-4 py-3">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium truncate">
                    {user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => {
                    navigate('/profile');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-destructive hover:text-destructive"
                  onClick={() => {
                    handleSignOut();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="w-full min-h-screen">

        {activeTab === 'services' && (
          <>
            {/* Layers Section */}
            <section className="py-4 md:py-6 mb-4 md:mb-6">
              <div className="container px-4">
                <h2 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">Capability Layers</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {CAPABILITY_LAYERS.map((layer) => (
                    <button
                      key={layer.id}
                      onClick={() => setSelectedLayer(selectedLayer === layer.id ? null : layer.id)}
                      className={`p-3 border rounded-lg transition-all duration-300 text-left ${
                        selectedLayer === layer.id
                          ? `${layer.color} text-white border-transparent shadow-lg`
                          : 'border-border bg-card hover:shadow-md'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md ${selectedLayer === layer.id ? 'bg-white/20' : layer.color} flex items-center justify-center text-xs font-bold mb-1 ${selectedLayer === layer.id ? '' : 'text-white'}`}>
                        {layer.id}
                      </div>
                      <p className="text-xs font-medium line-clamp-2">
                        {layer.name}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Search & Services */}
            <section className="container px-4 py-6 md:py-8">
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-lg"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
                  </span>
                  {selectedLayer && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLayer(null)}
                    >
                      Clear Filter
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredServices.map((service, index) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onClick={() => setSelectedService(service)}
                    style={{ animationDelay: `${index * 30}ms` }}
                  />
                ))}
              </div>

              {filteredServices.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">No services found matching your criteria.</p>
                </div>
              )}
            </section>
          </>
        )}

        {activeTab === 'outreach' && (
          <>
            {!showCampaignForm ? (
              <section className="container px-4 py-6 md:py-8">
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Outreach Campaign</h2>
                  <p className="text-sm md:text-base text-muted-foreground">Create and manage your outreach campaigns</p>
                </div>

                {/* Create Campaign Button - Smaller */}
                <div className="max-w-4xl mx-auto mb-8">
                  <div className="flex justify-center">
                    <Button
                      size="default"
                      onClick={() => setShowCampaignForm(true)}
                      className="gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Create New Campaign
                    </Button>
                  </div>
                </div>

                {/* Loading State */}
                {campaignsLoading && (
                  <div className="flex justify-center items-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">Loading campaigns...</p>
                    </div>
                  </div>
                )}

                {/* Campaigns List */}
                {!campaignsLoading && campaigns.length > 0 && (
                  <div className="max-w-6xl mx-auto">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-foreground">Your Campaigns ({campaigns.length})</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {campaigns.map((campaign) => (
                        <div
                          key={campaign.id}
                          className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-all cursor-pointer relative group"
                          onClick={() => navigate(`/campaign-status/${campaign.id}`)}
                        >
                          <div className="space-y-3">
                            {/* Campaign Header */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-semibold text-foreground line-clamp-1">
                                  {campaign.searchTerm || 'Untitled Campaign'}
                                </h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(campaign.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => openDeleteDialog(campaign.id, e)}
                                  title="Delete campaign"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              </div>
                            </div>

                            {/* Campaign Status */}
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  campaign.isCompleted
                                    ? 'bg-green-500'
                                    : campaign.isError
                                    ? 'bg-red-500'
                                    : 'bg-yellow-500'
                                }`}
                              />
                              <span className="text-xs font-medium text-foreground">
                                {campaign.isCompleted
                                  ? 'Completed'
                                  : campaign.isError
                                  ? 'Error'
                                  : 'In Progress'}
                              </span>
                            </div>

                            {/* Campaign Details */}
                            <div className="space-y-2 pt-2 border-t border-border">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Platform:</span>
                                <span className="font-medium text-foreground capitalize">
                                  {campaign.platform || 'podcast'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">Target Leads:</span>
                                <span className="font-medium text-foreground">
                                  {campaign.amountOfResults || 0}
                                </span>
                              </div>
                              {campaign.sender_name && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-muted-foreground">Sender:</span>
                                  <span className="font-medium text-foreground line-clamp-1">
                                    {campaign.sender_name}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Progress Indicator */}
                            {!campaign.isCompleted && !campaign.isError && campaign.progress && (
                              <div className="pt-2">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-muted-foreground">Progress</span>
                                  <span className="font-medium text-foreground">
                                    {campaign.progress}%
                                  </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-1.5">
                                  <div
                                    className="bg-primary h-1.5 rounded-full transition-all"
                                    style={{ width: `${campaign.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!campaignsLoading && campaigns.length === 0 && (
                  <div className="max-w-2xl mx-auto text-center py-12">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      No campaigns yet
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Create your first campaign to start reaching out to leads
                    </p>
                  </div>
                )}
              </section>
            ) : (
              <CreateCampaignForm onClose={() => {
                setShowCampaignForm(false);
                fetchCampaigns(); // Refresh campaigns when form closes
              }} />
            )}
          </>
        )}

        {activeTab === 'tools' && (
          <section className="container px-4 py-6 md:py-8">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Advanced PR Tools</h2>
              <p className="text-sm md:text-base text-muted-foreground">Enterprise-grade tools for comprehensive PR operations</p>
            </div>

            <Tabs defaultValue="press-kit" className="w-full max-w-5xl mx-auto">
              <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-8 mb-8 rounded-lg">
                <TabsTrigger value="press-kit" className="flex items-center gap-1.5 text-xs">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Press Kit</span>
                </TabsTrigger>
                <TabsTrigger value="brand-voice" className="flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Voice</span>
                </TabsTrigger>
                <TabsTrigger value="campaigns" className="flex items-center gap-1.5 text-xs">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Campaigns</span>
                </TabsTrigger>
                <TabsTrigger value="social" className="flex items-center gap-1.5 text-xs">
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Distribute</span>
                </TabsTrigger>
                <TabsTrigger value="images" className="flex items-center gap-1.5 text-xs">
                  <Image className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Images</span>
                </TabsTrigger>
                <TabsTrigger value="gallery" className="flex items-center gap-1.5 text-xs">
                  <Images className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Gallery</span>
                </TabsTrigger>
                <TabsTrigger value="seo-single" className="flex items-center gap-1.5 text-xs">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">SEO</span>
                </TabsTrigger>
                <TabsTrigger value="seo-compare" className="flex items-center gap-1.5 text-xs">
                  <Trophy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Compare</span>
                </TabsTrigger>
              </TabsList>
              <TabsContent value="press-kit">
                <PressKitBuilder />
              </TabsContent>
              <TabsContent value="brand-voice">
                <BrandVoiceTrainer />
              </TabsContent>
              <TabsContent value="campaigns">
                <CampaignPlanner />
              </TabsContent>
              <TabsContent value="social">
                <SocialMediaPublisher />
              </TabsContent>
              <TabsContent value="images">
                <ImageGenerator onImageSaved={() => galleryRefreshRef.current?.()} />
              </TabsContent>
              <TabsContent value="gallery">
                <ImageGallery />
              </TabsContent>
              <TabsContent value="seo-single">
                <UrlAnalyzer />
              </TabsContent>
              <TabsContent value="seo-compare">
                <CompetitorAnalyzer />
              </TabsContent>
            </Tabs>
          </section>
        )}
      </main>

      <ScrollToTop />

      {/* Service Modal */}
      {selectedService && (
        <ServiceModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
        />
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
            <AlertDialogCancel onClick={() => setDeletingCampaignId(null)} disabled={isDeleting}>
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

export default Dashboard;
