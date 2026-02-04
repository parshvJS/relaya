import { Helmet } from 'react-helmet-async';
import { Zap, Shield, Sparkles, BarChart, Globe, Users } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

const Features = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast Generation",
      description: "Generate professional press releases in seconds, not hours. Our AI understands your brand and creates compelling content instantly."
    },
    {
      icon: Shield,
      title: "Compliance Ready",
      description: "Built-in ARCS (Accuracy, Relevance, Clarity, Sourcing) compliance verification ensures your content meets industry standards."
    },
    {
      icon: Sparkles,
      title: "Brand Voice Consistency",
      description: "Train AI models on your brand's unique voice and maintain consistent messaging across all communications."
    },
    {
      icon: BarChart,
      title: "Advanced Analytics",
      description: "Track performance metrics, engagement rates, and ROI with our comprehensive analytics dashboard."
    },
    {
      icon: Globe,
      title: "Multi-Channel Distribution",
      description: "Distribute content across multiple channels with automated tracking and personalized targeting."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work seamlessly with your team through shared workspaces, approval workflows, and version control."
    }
  ];

  return (
    <>
      <Helmet>
        <title>Platform Features - AI PR Automation Tools | RELAYA</title>
        <meta name="description" content="Explore RELAYA's powerful features: lightning-fast content generation, ARCS compliance verification, brand voice consistency, advanced analytics, multi-channel distribution, and team collaboration." />
        <link rel="canonical" href="https://relaya.com/features" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://relaya.com/features" />
        <meta property="og:title" content="Platform Features - AI PR Automation Tools" />
        <meta property="og:description" content="Lightning-fast content generation, compliance verification, brand voice consistency, and advanced analytics for enterprise PR." />
        <meta property="og:image" content="https://relaya.com/favicon.jpeg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Platform Features - AI PR Automation" />
        <meta name="twitter:description" content="Powerful AI features for enterprise PR operations." />

        {/* JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "RELAYA Platform Features",
            "description": "Comprehensive features for AI-powered enterprise PR including compliance verification, brand voice consistency, and team collaboration",
            "url": "https://relaya.com/features"
          })}
        </script>
      </Helmet>

      <Header />
      <ScrollToTop />
      <div className="min-h-screen bg-background">
        {/* Header */}
        <section className="container py-24 space-y-8">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Powerful Features
          </h1>
          <p className="text-xl text-muted-foreground">
            Everything you need to manage your PR operations at scale.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container pb-24">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border bg-card hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container pb-24">
        <div className="max-w-4xl mx-auto bg-primary/5 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of companies already using Relaya to streamline their PR operations.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/pricing"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8"
            >
              View Pricing
            </a>
            <a
              href="/contact"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-8"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
};

export default Features;
