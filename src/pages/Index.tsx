import { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, FileText, Sparkles, Calendar, Send, Image, Images, Globe, Trophy } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PR_SERVICES, CAPABILITY_LAYERS } from '@/data/prServices';
import ServiceCard from '@/components/ServiceCard';
import ServiceModal from '@/components/ServiceModal';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import UrlAnalyzer from '@/components/UrlAnalyzer';
import CompetitorAnalyzer from '@/components/CompetitorAnalyzer';
import PressKitBuilder from '@/components/PressKitBuilder';
import BrandVoiceTrainer from '@/components/BrandVoiceTrainer';
import CampaignPlanner from '@/components/CampaignPlanner';
import SocialMediaPublisher from '@/components/SocialMediaPublisher';
import ImageGenerator from '@/components/ImageGenerator';
import ImageGallery from '@/components/ImageGallery';
import HeroSection from '@/components/home/HeroSection';
import TrustedBySection from '@/components/home/TrustedBySection';
import CapabilityLayersSection from '@/components/home/CapabilityLayersSection';
import FeaturesHighlight from '@/components/home/FeaturesHighlight';
import CTASection from '@/components/home/CTASection';
import type { PRService } from '@/data/prServices';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [selectedService, setSelectedService] = useState<PRService | null>(null);
  const galleryRefreshRef = useRef<(() => void) | null>(null);

  const filteredServices = PR_SERVICES.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.layer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLayer = selectedLayer === null || service.layerNumber === selectedLayer;
    return matchesSearch && matchesLayer;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>RELAYA - AI-Powered Enterprise PR Platform | Strategic Communications</title>
        <meta name="description" content="Enterprise-grade PR services powered by AI. Autonomous, surgical, efficient. Generate compliance-ready content at scale with 50+ PR services across 10 capability layers." />
        <link rel="canonical" href="https://relaya.com/" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://relaya.com/" />
        <meta property="og:title" content="RELAYA - AI-Powered Enterprise PR Platform" />
        <meta property="og:description" content="Enterprise-grade PR services powered by AI. Autonomous, surgical, efficient. Generate compliance-ready content at scale." />
        <meta property="og:image" content="https://relaya.com/favicon.jpeg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://relaya.com/" />
        <meta name="twitter:title" content="RELAYA - AI-Powered Enterprise PR Platform" />
        <meta name="twitter:description" content="Enterprise-grade PR services powered by AI. Autonomous, surgical, efficient." />
        <meta name="twitter:image" content="https://relaya.com/favicon.jpeg" />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "RELAYA",
            "description": "Enterprise-grade AI-powered PR platform delivering autonomous, compliance-ready strategic communications",
            "url": "https://relaya.com",
            "logo": "https://relaya.com/favicon.jpeg",
            "foundingDate": "2024",
            "sameAs": [
              "https://twitter.com/relaya",
              "https://linkedin.com/company/relaya"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Customer Service",
              "availableLanguage": ["English"]
            }
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "RELAYA",
            "url": "https://relaya.com",
            "description": "AI-powered enterprise PR platform with 50+ services across 10 capability layers",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://relaya.com/?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
      </Helmet>

      {/* Sticky Header */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Trusted By Section */}
      <TrustedBySection />

      {/* Features Highlight */}
      <FeaturesHighlight />

      {/* Capability Layers Section */}
      <CapabilityLayersSection onLayerSelect={setSelectedLayer} />

      {/* Search & Filters */}
      <div 
        data-section="filters"
        className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border/50"
      >
        <div className="container py-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 input-modern"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              <button
                onClick={() => setSelectedLayer(null)}
                className={`layer-badge whitespace-nowrap transition-all duration-200 ${
                  selectedLayer === null 
                    ? 'bg-primary text-primary-foreground scale-105' 
                    : 'bg-secondary text-secondary-foreground hover:bg-accent hover:scale-105'
                }`}
              >
                All Layers
              </button>
              {CAPABILITY_LAYERS.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setSelectedLayer(selectedLayer === layer.id ? null : layer.id)}
                  className={`layer-badge whitespace-nowrap transition-all duration-200 ${
                    selectedLayer === layer.id 
                      ? `${layer.color} text-white scale-105` 
                      : 'bg-secondary text-secondary-foreground hover:bg-accent hover:scale-105'
                  }`}
                >
                  {layer.id}. {layer.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <main id="services" className="container py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">
            {selectedLayer 
              ? CAPABILITY_LAYERS.find(l => l.id === selectedLayer)?.name 
              : 'All Services'}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={() => setSelectedService(service)}
              style={{ animationDelay: `${index * 50}ms` }}
            />
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-muted-foreground">No services found matching your criteria.</p>
          </div>
        )}
      </main>

      {/* PR Tools Section */}
      <section id="tools" className="py-16 bg-muted/30 border-t border-border/50">
        <div className="container">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Sparkles className="w-4 h-4" />
              Advanced PR Tools
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-4">Professional Toolkit</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade tools for press kits, brand voice training, campaign planning, and SEO analysis
            </p>
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
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />

      {/* Scroll to Top Button */}
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

export default Index;
