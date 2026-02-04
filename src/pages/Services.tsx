import { Helmet } from 'react-helmet-async';
import { Check } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

const Services = () => {
  const services = [
    {
      title: "Press Release Generation",
      description: "AI-powered press release creation with compliance-ready content, brand voice consistency, and multi-format export capabilities.",
      features: [
        "Automated content generation",
        "ARCS compliance verification",
        "Brand voice integration",
        "Multi-format export (PDF, DOCX)",
        "Distribution tracking"
      ]
    },
    {
      title: "Campaign Management",
      description: "End-to-end PR campaign orchestration with automated task generation, performance tracking, and strategic optimization.",
      features: [
        "Campaign strategy planning",
        "Automated task workflows",
        "Performance analytics",
        "Multi-channel coordination",
        "ROI tracking"
      ]
    },
    {
      title: "Brand Voice Training",
      description: "Advanced AI models trained on your brand's unique voice, ensuring consistent messaging across all communications.",
      features: [
        "Voice analysis from samples",
        "Tone consistency enforcement",
        "Style guide integration",
        "Team collaboration tools",
        "Version control"
      ]
    },
    {
      title: "Media Outreach Automation",
      description: "Intelligent media targeting and outreach automation with personalized pitch generation and follow-up management.",
      features: [
        "Media database access",
        "Personalized pitch creation",
        "Automated follow-ups",
        "Response tracking",
        "Relationship management"
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>PR Services - AI-Powered Enterprise Solutions | RELAYA</title>
        <meta name="description" content="Comprehensive AI-powered PR services including press release generation, campaign management, brand voice training, and automated media outreach. Enterprise-grade compliance-ready content." />
        <link rel="canonical" href="https://relaya.com/services" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://relaya.com/services" />
        <meta property="og:title" content="PR Services - AI-Powered Enterprise Solutions" />
        <meta property="og:description" content="Comprehensive AI-powered PR services including press release generation, campaign management, and automated media outreach." />
        <meta property="og:image" content="https://relaya.com/favicon.jpeg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="PR Services - AI-Powered Enterprise Solutions" />
        <meta name="twitter:description" content="AI-powered PR services for enterprise organizations." />

        {/* JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "RELAYA PR Services",
            "description": "Comprehensive AI-powered PR services including press release generation, campaign management, brand voice training, and media outreach automation",
            "provider": {
              "@type": "Organization",
              "name": "RELAYA"
            },
            "areaServed": "Worldwide",
            "serviceType": "Public Relations Services"
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
            Our Services
          </h1>
          <p className="text-xl text-muted-foreground">
            Enterprise-grade PR services powered by AI. Generate compliance-ready content at scale.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container pb-24">
        <div className="grid gap-8 md:grid-cols-2">
          {services.map((service, index) => (
            <div
              key={index}
              className="p-8 rounded-lg border bg-card hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-bold mb-4">{service.title}</h2>
              <p className="text-muted-foreground mb-6">{service.description}</p>
              <ul className="space-y-3">
                {service.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
};

export default Services;
