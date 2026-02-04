import { Helmet } from 'react-helmet-async';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

const Pricing = () => {
  const plans = [
    {
      name: "Starter",
      price: "$99",
      period: "per month",
      description: "Perfect for small teams and startups",
      features: [
        "Up to 10 press releases/month",
        "Basic brand voice training",
        "Email support",
        "Standard templates",
        "PDF/DOCX export"
      ]
    },
    {
      name: "Professional",
      price: "$299",
      period: "per month",
      description: "For growing businesses with regular PR needs",
      features: [
        "Up to 50 press releases/month",
        "Advanced brand voice training",
        "Priority email support",
        "Custom templates",
        "Multi-format export",
        "Campaign management",
        "Analytics dashboard"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large organizations with complex needs",
      features: [
        "Unlimited press releases",
        "Dedicated brand voice models",
        "24/7 phone & email support",
        "White-label options",
        "API access",
        "Advanced analytics",
        "Custom integrations",
        "Dedicated account manager"
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Pricing Plans - AI PR Platform Pricing | RELAYA</title>
        <meta name="description" content="Transparent pricing for AI-powered enterprise PR services. Choose from Starter ($99/mo), Professional ($299/mo), or Enterprise plans. All plans include compliance-ready content generation." />
        <link rel="canonical" href="https://relaya.com/pricing" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://relaya.com/pricing" />
        <meta property="og:title" content="Pricing Plans - AI PR Platform" />
        <meta property="og:description" content="Simple, transparent pricing for enterprise PR automation. Starter, Professional, and Enterprise plans available." />
        <meta property="og:image" content="https://relaya.com/favicon.jpeg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Pricing Plans - AI PR Platform" />
        <meta name="twitter:description" content="Transparent pricing for enterprise PR automation." />

        {/* JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "RELAYA Pricing",
            "description": "Transparent pricing plans for AI-powered enterprise PR services",
            "url": "https://relaya.com/pricing"
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
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that fits your needs. All plans include our core AI-powered features.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container pb-24">
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`p-8 rounded-lg border bg-card hover:shadow-lg transition-shadow relative ${
                plan.popular ? 'border-primary shadow-md' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                Get Started
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
    <Footer />
    </>
  );
};

export default Pricing;
