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
  X
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
import { useAuth } from '@/hooks/useAuth';
import type { PRService } from '@/data/prServices';
import logo from '@/assets/logo.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<PRService | null>(null);
  const [activeTab, setActiveTab] = useState('services');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const galleryRefreshRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const filteredServices = PR_SERVICES.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.layer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLayer = selectedLayer === null || service.layerNumber === selectedLayer;
    return matchesSearch && matchesLayer;
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Dashboard Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <img 
              src={logo} 
              alt="Relaya Logo" 
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { id: 'services', label: 'Services', icon: Layers },
              { id: 'tools', label: 'Tools', icon: Zap },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm font-medium">
                    {profile?.display_name || user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{profile?.display_name || 'User'}</span>
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

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md">
            <nav className="container py-4 flex flex-col gap-1">
              {[
                { id: 'services', label: 'Services', icon: Layers },
                { id: 'tools', label: 'Tools', icon: Zap },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    activeTab === tab.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Welcome Banner */}
        <section className="border-b border-border/50 bg-gradient-to-r from-primary/5 via-transparent to-info/5">
          <div className="container py-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                  Welcome back, {profile?.display_name?.split(' ')[0] || 'there'}
                </h1>
                <p className="text-muted-foreground">
                  Access all 50 PR services and advanced tools from your dashboard
                </p>
              </div>
              <div className="flex items-center gap-4">
                {[
                  { icon: Layers, label: '10 Layers', color: 'text-primary' },
                  { icon: Zap, label: '50 Services', color: 'text-amber-500' },
                  { icon: Shield, label: 'Compliance', color: 'text-green-500' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border/50">
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-sm font-medium">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {activeTab === 'services' && (
          <>
            {/* Layers Section */}
            <section className="py-6 bg-muted/30 border-b border-border/50">
              <div className="container">
                <h2 className="text-lg font-semibold text-foreground mb-4">Capability Layers</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {CAPABILITY_LAYERS.map((layer) => (
                    <button
                      key={layer.id}
                      onClick={() => setSelectedLayer(selectedLayer === layer.id ? null : layer.id)}
                      className={`p-3 rounded-xl border transition-all duration-300 text-left ${
                        selectedLayer === layer.id
                          ? `${layer.color} text-white border-transparent shadow-lg`
                          : 'border-border/50 bg-card hover:shadow-md'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg ${selectedLayer === layer.id ? 'bg-white/20' : layer.color} flex items-center justify-center text-xs font-bold mb-1 ${selectedLayer === layer.id ? '' : 'text-white'}`}>
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
            <section className="container py-8">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {activeTab === 'tools' && (
          <section className="container py-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">Advanced PR Tools</h2>
              <p className="text-muted-foreground">Enterprise-grade tools for comprehensive PR operations</p>
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
