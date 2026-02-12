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
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
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

    // Load sidebar state from localStorage
    const savedSidebarState = localStorage.getItem('sidebarCollapsed');
    if (savedSidebarState !== null) {
      setIsSidebarCollapsed(savedSidebarState === 'true');
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

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', String(newState));
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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`hidden md:flex fixed left-0 top-0 z-50 h-screen border-r border-border bg-background flex-col transition-all duration-300 ${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Logo Section with Toggle Button */}
        <div className="relative p-4 lg:p-6 border-b border-border">
          <Link to="/dashboard" className="flex items-center justify-center">
            {!isSidebarCollapsed && (
              <img
                src={isDarkMode ? '/logo-white.svg' : '/logo-black.svg'}
                alt="Relaya Logo"
                className="h-12 lg:h-16 w-auto object-contain"
              />
            )}
            {isSidebarCollapsed && (
              <img
                src="/standalone-logo.svg"
                alt="Relaya"
                className="w-10 h-10 object-contain"
              />
            )}
          </Link>
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center hover:bg-accent transition-colors shadow-sm"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 lg:p-4 space-y-2 overflow-y-auto">
          {[
            { id: 'services', label: 'Services', icon: Layers },
            { id: 'tools', label: 'Tools', icon: Zap },
            { id: 'outreach', label: 'Outreach Campaign', icon: Send },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              } ${isSidebarCollapsed ? 'justify-center' : ''}`}
              title={isSidebarCollapsed ? tab.label : undefined}
            >
              <tab.icon className="w-4 lg:w-5 h-4 lg:h-5 flex-shrink-0" />
              {!isSidebarCollapsed && <span className="truncate">{tab.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Section at Bottom */}
        <div className="border-t border-border">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors border-b border-border ${
              isSidebarCollapsed ? 'justify-center' : 'justify-center'
            }`}
            title={isSidebarCollapsed ? (isDarkMode ? 'Switch to light mode' : 'Switch to dark mode') : undefined}
          >
            {isDarkMode ? (
              <>
                <Sun className="w-3.5 h-3.5" />
                {!isSidebarCollapsed && <span>Light</span>}
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5" />
                {!isSidebarCollapsed && <span>Dark</span>}
              </>
            )}
          </button>

          <div className="p-4 lg:p-6">
            {!isSidebarCollapsed ? (
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-3 hover:bg-accent">
                  <Avatar className="h-8 lg:h-10 w-8 lg:w-10 flex-shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs lg:text-sm">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left overflow-hidden min-w-0">
                    <p className="text-xs lg:text-sm font-medium truncate">
                      {user?.email?.split('@')[0] || 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                  <ChevronDown className="w-3 lg:w-4 h-3 lg:h-4 text-muted-foreground flex-shrink-0" />
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
            ) : (
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-center p-2 hover:bg-accent">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
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
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-background border border-border hover:bg-accent transition-colors"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="md:hidden fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-background flex flex-col">
            {/* Logo Section */}
            <div className="p-6 border-b border-border">
              <Link to="/dashboard" className="flex items-center justify-center">
                <img
                  src={isDarkMode ? '/logo-white.svg' : '/logo-black.svg'}
                  alt="Relaya Logo"
                  className="h-16 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {[
                { id: 'services', label: 'Services', icon: Layers },
                { id: 'tools', label: 'Tools', icon: Zap },
                { id: 'outreach', label: 'Outreach Campaign', icon: Send },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <tab.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* User Section at Bottom */}
            <div className="border-t border-border">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors border-b border-border"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-3.5 h-3.5" />
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5" />
                    <span>Dark</span>
                  </>
                )}
              </button>

              <div className="p-6">
              <div className="flex items-center gap-3 px-3 py-3">
                <Avatar className="h-10 w-10">
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
              <div className="space-y-1 mt-2">
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
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className={`flex-1 w-full min-h-screen transition-all duration-300 ${
        isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
      }`}>

        {activeTab === 'services' && (
          <>
            {/* Layers Section */}
            <section className="py-4 md:py-6 bg-muted/30 border-b border-border">
              <div className="container px-4">
                <h2 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">Capability Layers</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {CAPABILITY_LAYERS.map((layer) => (
                    <button
                      key={layer.id}
                      onClick={() => setSelectedLayer(selectedLayer === layer.id ? null : layer.id)}
                      className={`p-3 border transition-all duration-300 text-left ${
                        selectedLayer === layer.id
                          ? `${layer.color} text-white border-transparent shadow-lg`
                          : 'border-border bg-card hover:shadow-md'
                      }`}
                    >
                      <div className={`w-6 h-6 ${selectedLayer === layer.id ? 'bg-white/20' : layer.color} flex items-center justify-center text-xs font-bold mb-1 ${selectedLayer === layer.id ? '' : 'text-white'}`}>
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
                    className="pl-10"
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
                <div className="max-w-2xl mx-auto text-center space-y-6">
                  <Button
                    size="lg"
                    onClick={() => setShowCampaignForm(true)}
                    className="gap-2 text-lg px-8 py-6 h-auto"
                  >
                    <Send className="w-5 h-5" />
                    Create New Campaign
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Start building your personalized outreach campaign
                  </p>
                </div>
              </section>
            ) : (
              <CreateCampaignForm onClose={() => setShowCampaignForm(false)} />
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
              <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-8 mb-8">
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
    </div>
  );
};

export default Dashboard;
