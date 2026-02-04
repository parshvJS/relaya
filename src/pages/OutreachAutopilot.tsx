import { useState } from 'react';
import { 
  Zap, Radio, Globe, Clock, Target, MessageSquare, Send, 
  Check, ArrowRight, Calendar, Building2, Scale, Briefcase,
  Rocket, ChevronDown, ChevronUp, Mail, Phone, Newspaper,
  Podcast, FileText, Cpu, Play, RefreshCw, Search, Sparkles, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import ROICalculator from '@/components/ROICalculator';
import CalendlyEmbed from '@/components/CalendlyEmbed';

// TODO: Replace with your actual Calendly URL
const CALENDLY_URL = 'https://calendly.com/your-username/strategy-call';

const OutreachAutopilot = () => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    website: '',
    inquiryType: '',
    message: ''
  });

  const howItWorksSteps = [
    { icon: Target, label: 'Define Targets', description: 'Set your ideal media contacts' },
    { icon: Search, label: 'Set Filters', description: 'Choose beats, outlets, regions' },
    { icon: MessageSquare, label: 'Add Pitch Core', description: 'Provide your key narrative' },
    { icon: Play, label: 'Launch', description: 'Activate the engine' },
    { icon: RefreshCw, label: 'Relaya Runs', description: 'Scan → Match → Draft → Send → Follow-up' },
  ];

  const capabilities = [
    {
      icon: Radio,
      title: 'Constant Scanning',
      description: 'Monitors media 24/7 for relevant opportunities across all channels.'
    },
    {
      icon: Zap,
      title: 'Newsjacking Mode',
      description: 'Detects breaking stories within 24 hours and positions your expertise instantly.'
    },
    {
      icon: Sparkles,
      title: 'Narrative Weaving',
      description: 'Reads the journalist\'s recent work and integrates your pitch into their narrative.'
    },
    {
      icon: Globe,
      title: 'Universal Reach',
      description: 'Works across any industry, any language, any market worldwide.'
    },
    {
      icon: MessageSquare,
      title: 'Win-Win Messaging',
      description: 'Crafts pitches that provide genuine value to journalists at scale.'
    },
    {
      icon: Clock,
      title: 'Prime Time Delivery',
      description: 'Schedules sends during optimal media hours for maximum open rates.'
    },
  ];

  const useCases = [
    {
      industry: 'Business Consulting',
      targets: 'Management podcasts & business blogs',
      angle: 'Turnaround tactics, market analysis, leadership insights'
    },
    {
      industry: 'Tax Accountants',
      targets: 'Small business news & finance columns',
      angle: 'Newsjack filing deadlines, highlight common deductions missed'
    },
    {
      industry: 'Law Firms',
      targets: 'Legal tech journals & trade press',
      angle: 'Provide legal context on breaking lawsuits and regulations'
    },
    {
      industry: 'Tech Companies',
      targets: 'TechCrunch, Product Hunt, niche blogs',
      angle: 'Product launches, founder stories, technical deep-dives'
    },
    {
      industry: 'Startups',
      targets: 'Early adopter communities & indie podcasts',
      angle: 'Building in public, transparency reports, milestone stories'
    },
  ];

  const pricingPlans = [
    {
      name: 'Launch',
      price: 199,
      popular: false,
      features: [
        '600 AI pitches/mo',
        '3 active campaigns',
        'Standard personalization',
        'Global media scanning',
        'Email support'
      ]
    },
    {
      name: 'Momentum',
      price: 449,
      popular: true,
      features: [
        '3,000 AI pitches/mo',
        '15 active campaigns',
        'Deep context AI engine',
        'Smart follow-up sequences',
        'A/B testing',
        'Priority support'
      ]
    },
    {
      name: 'Dominion',
      price: 999,
      popular: false,
      features: [
        '8,000 AI pitches/mo',
        'Unlimited campaigns',
        'White label reporting',
        'Dedicated success manager',
        '1-hour onboarding call'
      ]
    },
  ];

  const faqItems = [
    {
      question: 'Is this compliant with CAN-SPAM and GDPR?',
      answer: 'Yes. All outreach includes opt-out mechanisms, respects consent requirements, and uses low send volumes per domain to maintain compliance and deliverability.'
    },
    {
      question: 'Will the AI sound robotic or generic?',
      answer: 'No. Our deep context engine reads each recipient\'s recent articles, social posts, and podcast episodes, then matches their tone and references their specific work in every pitch.'
    },
    {
      question: 'Can I review pitches before they\'re sent?',
      answer: 'Absolutely. Run in semi-autonomous mode to approve each pitch with one click before it\'s dispatched. Or go fully autonomous once you\'re confident in the system.'
    },
    {
      question: 'How is this different from hiring a PR agency?',
      answer: 'Traditional agencies cost $5,000-$10,000/month and still require manual outreach. Relaya replaces the grind, not the strategy. You maintain creative control while we automate the execution.'
    },
    {
      question: 'Will this hurt my domain reputation?',
      answer: 'No. We use gradual warm-up sequences, maintain low daily limits per domain, and employ spin syntax for uniqueness. Your deliverability is protected.'
    },
    {
      question: 'What happens when a journalist replies?',
      answer: 'Replies go directly to your inbox. Relaya opens the door; you close the deal. All relationship-building remains in your hands.'
    },
    {
      question: 'Can I blacklist certain journalists or outlets?',
      answer: 'Yes. Maintain a "Do Not Contact" list to exclude specific domains, journalists, or entire outlets from your campaigns.'
    },
    {
      question: 'Does this work for niche or technical industries?',
      answer: 'Absolutely. Relaya adapts to any vertical-from fintech to healthcare, manufacturing to SaaS. The AI learns your industry\'s language and media landscape.'
    },
    {
      question: 'Can I connect my own email?',
      answer: 'Yes. Connect your GSuite or Outlook account directly, or use a dedicated sending domain we help you configure.'
    },
    {
      question: 'Do you guarantee media placements?',
      answer: 'No one can guarantee placements-beware anyone who claims otherwise. We guarantee the work: verified contacts, personalized pitches, optimized delivery timing.'
    },
    {
      question: 'How do follow-ups work?',
      answer: 'Follow-ups are non-intrusive and automatically stop when a journalist replies or engages. No annoying sequences-just professional persistence.'
    },
    {
      question: 'What languages are supported?',
      answer: 'Optimized for English-language markets. Spanish, French, and German are in beta with expanding support.'
    },
  ];

  const matchExamples = [
    { type: 'Newsletter', outlet: 'Morning Brew', beat: 'Startup Finance', status: 'MATCH' },
    { type: 'Podcast', outlet: 'Indie Hackers', beat: 'SaaS Growth', status: 'MATCH' },
    { type: 'Blog', outlet: 'TechCrunch', beat: 'AI/ML Tools', status: 'MATCH' },
  ];

  const terminalLogs = [
    '[08:31:02] SCAN → Monitoring 847 media sources...',
    '[08:31:15] DETECT → New article: "AI Tools Reshaping PR"',
    '[08:31:18] ANALYZE → Reading journalist\'s last 5 pieces...',
    '[08:31:24] GENERATE → Crafting personalized pitch...',
    '[08:31:29] OPTIMIZE → A/B variant selected, tone matched',
    '[08:31:32] DISPATCH → Sent to inbox (NY timezone)',
  ];

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.inquiryType || !contactForm.message.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactForm.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create readable text body from form data
      const bodyText = `
Outreach Autopilot Contact Form Submission

Name: ${contactForm.name}
Email: ${contactForm.email}
Website: ${contactForm.website || 'Not provided'}
Inquiry Type: ${contactForm.inquiryType}

Message:
${contactForm.message}
      `.trim();

      // Send POST request to API
      const response = await fetch('https://backend.jamesscott.tech/webhook/contact-form-uni', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          body: bodyText,
          website: 'relayapr.com'
        })
      });

      if (response.status === 200) {
        toast.success('Message sent successfully!');
        // Reset form
        setContactForm({
          name: '',
          email: '',
          website: '',
          inquiryType: '',
          message: ''
        });
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-info/5" />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            {/* Status Indicator */}
            <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-medium text-success mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              System Online • v2.0 Live
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              Outreach on autopilot-
              <br />
              <span className="gradient-text">while you sleep.</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
              Relaya continuously scans media, instantly analyzes opportunities, and sends context-aware pitches to the right journalists. 
              You only step in when they reply.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '300ms' }}>
              <Button 
                size="lg" 
                className="btn-primary text-base px-8 py-6"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-base px-8 py-6"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book a Strategy Call
              </Button>
            </div>

            <a 
              href="#use-cases" 
              className="inline-block mt-6 text-sm text-primary hover:underline animate-fade-in"
              style={{ animationDelay: '400ms' }}
            >
              Explore Use Cases →
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-muted/30 border-b border-border/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">5-minute setup. Zero maintenance.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-8">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center max-w-[140px] animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 relative">
                  <step.icon className="w-7 h-7 text-primary" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{step.label}</h3>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Visualization: The Engine */}
      <section className="py-16 md:py-24 border-b border-border/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">The Engine</h2>
            <p className="text-lg text-muted-foreground">Watch Relaya work in real-time</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Match Examples Panel */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Match Examples</h3>
              </div>
              <div className="space-y-3">
                {matchExamples.map((match, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      {match.type === 'Newsletter' && <Newspaper className="w-4 h-4 text-muted-foreground" />}
                      {match.type === 'Podcast' && <Podcast className="w-4 h-4 text-muted-foreground" />}
                      {match.type === 'Blog' && <FileText className="w-4 h-4 text-muted-foreground" />}
                      <div>
                        <p className="text-sm font-medium text-foreground">{match.outlet}</p>
                        <p className="text-xs text-muted-foreground">{match.beat}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-success/10 text-success text-xs font-bold rounded">
                      {match.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal/Log Panel */}
            <div className="glass-card rounded-2xl p-6 bg-foreground/5">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">System Log</h3>
                <span className="ml-auto px-2 py-0.5 bg-success/10 text-success text-xs font-medium rounded">LIVE</span>
              </div>
              <div className="font-mono text-xs space-y-1.5 bg-foreground/5 rounded-lg p-4 border border-border/50">
                {terminalLogs.map((log, index) => (
                  <p key={index} className="text-muted-foreground animate-fade-in" style={{ animationDelay: `${index * 200}ms` }}>
                    {log}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section className="py-16 md:py-24 bg-muted/30 border-b border-border/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Core Capabilities</h2>
            <p className="text-lg text-muted-foreground">Enterprise-grade automation that never sleeps</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {capabilities.map((cap, index) => (
              <div key={index} className="service-card animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <cap.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground">{cap.description}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Run fully autonomous or semi-autonomous (approve-in-one-click).
          </p>
        </div>
      </section>

      {/* Use Cases by Industry */}
      <section id="use-cases" className="py-16 md:py-24 border-b border-border/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Built for Every Industry</h2>
            <p className="text-lg text-muted-foreground">Tailored outreach strategies for your vertical</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid gap-4">
              {useCases.map((useCase, index) => (
                <div key={index} className="glass-card rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-center gap-3 sm:w-1/4">
                    {useCase.industry === 'Business Consulting' && <Briefcase className="w-5 h-5 text-primary" />}
                    {useCase.industry === 'Tax Accountants' && <Building2 className="w-5 h-5 text-primary" />}
                    {useCase.industry === 'Law Firms' && <Scale className="w-5 h-5 text-primary" />}
                    {useCase.industry === 'Tech Companies' && <Cpu className="w-5 h-5 text-primary" />}
                    {useCase.industry === 'Startups' && <Rocket className="w-5 h-5 text-primary" />}
                    <span className="font-semibold text-foreground">{useCase.industry}</span>
                  </div>
                  <div className="sm:w-1/3">
                    <p className="text-sm text-muted-foreground">{useCase.targets}</p>
                  </div>
                  <div className="sm:w-5/12 sm:pl-4 sm:border-l border-border/50">
                    <p className="text-sm text-foreground">{useCase.angle}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-center text-muted-foreground mt-8">
              Don't see your industry? Relaya adapts to any niche-from Real Estate to E-commerce.
            </p>

            <div className="text-center mt-6">
              <Button 
                variant="outline"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Find Your Niche
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-16 md:py-24 bg-muted/30 border-b border-border/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Calculate Your ROI</h2>
            <p className="text-lg text-muted-foreground">See how much time and money you'll save</p>
          </div>

          <div className="max-w-3xl mx-auto">
            <ROICalculator />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 md:py-24 border-b border-border/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-muted-foreground">No hidden fees. Cancel anytime.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`relative glass-card rounded-2xl p-6 animate-fade-in ${
                  plan.popular ? 'ring-2 ring-primary shadow-lg scale-105' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-success mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-2">
                  <Button 
                    className={`w-full ${plan.popular ? 'btn-primary' : ''}`} 
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Start Free Trial
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full text-sm"
                    onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Talk to Sales
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-muted/30 border-b border-border/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">Everything you need to know</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqItems.map((faq, index) => (
              <div key={index} className="glass-card rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium text-foreground pr-4">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground animate-fade-in">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact + Booking */}
      <section id="contact" className="py-16 md:py-24 border-b border-border/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Get in Touch</h2>
            <p className="text-lg text-muted-foreground">Have questions? We're here to help.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Contact Form */}
            <div className="glass-card rounded-2xl p-6">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="input-modern"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="input-modern"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Company Website</Label>
                  <Input
                    id="website"
                    placeholder="https://yourcompany.com"
                    value={contactForm.website}
                    onChange={(e) => setContactForm({ ...contactForm, website: e.target.value })}
                    className="input-modern"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inquiryType">Inquiry Type</Label>
                  <Select
                    value={contactForm.inquiryType}
                    onValueChange={(value) => setContactForm({ ...contactForm, inquiryType: value })}
                  >
                    <SelectTrigger className="input-modern">
                      <SelectValue placeholder="Select inquiry type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales & Enterprise</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="media">Media Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="How can we help?"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="input-modern min-h-[100px]"
                  />
                </div>

                <Button type="submit" className="w-full btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Book a Strategy Call */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Book a Strategy Call</h3>
                  <p className="text-sm text-muted-foreground">15-minute demo with our team</p>
                </div>
              </div>

              <CalendlyEmbed 
                url={CALENDLY_URL}
                height="350px"
              />

              <p className="text-xs text-muted-foreground text-center mt-4">
                Times shown in your local timezone
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary/10 via-background to-info/10">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to dominate your niche?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the founders who've automated their media presence. Setup takes 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="btn-primary text-base px-8 py-6"
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-base px-8 py-6"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book a Strategy Call
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-md border-t border-border/50 md:hidden z-50">
        <Button 
          className="w-full btn-primary py-3"
          onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Start Free Trial
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default OutreachAutopilot;
