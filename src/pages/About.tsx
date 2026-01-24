import { Link } from 'react-router-dom';
import { 
  Zap, 
  Shield, 
  Target, 
  Brain, 
  Users, 
  TrendingUp, 
  Award,
  CheckCircle,
  ArrowRight,
  Layers,
  Globe,
  Lock,
  Cpu
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import NetworkAnimation from '@/components/NetworkAnimation';

const About = () => {
  const coreValues = [
    {
      icon: Shield,
      title: 'Compliance-First Architecture',
      description: 'Every output is engineered for regulatory scrutiny. SEC, GDPR, HIPAA-ready content generation with immutable audit trails.',
    },
    {
      icon: Brain,
      title: 'Deterministic Precision',
      description: 'No hallucinations. No approximations. Our intelligent systems deliver boardroom-grade outputs with surgical accuracy.',
    },
    {
      icon: Target,
      title: 'Strategic Autonomy',
      description: 'Self-directing systems that transform executive intent into market-ready communications without iteration loops.',
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption, role-based access controls, and complete data sovereignty for organizations that cannot compromise.',
    },
  ];

  const capabilities = [
    {
      number: '50',
      label: 'PR Services',
      description: 'Comprehensive coverage across every communications discipline',
    },
    {
      number: '10',
      label: 'Strategic Layers',
      description: 'From narrative engineering to internal alignment',
    },
    {
      number: '100%',
      label: 'Compliance Grade',
      description: 'Audit-ready outputs with full traceability',
    },
    {
      number: '24/7',
      label: 'Operational',
      description: 'Continuous availability for crisis response',
    },
  ];

  const differentiators = [
    {
      title: 'Not Another Content Generator',
      description: 'RELAYA is not a chatbot dressed as a PR tool. We have engineered a deterministic communications operating system that transforms structured inputs into compliance-grade, board-ready outputs.',
    },
    {
      title: 'Built for the C-Suite',
      description: 'Every feature is designed for executives who cannot afford ambiguity. Our outputs meet the scrutiny of regulators, investors, and institutional stakeholders.',
    },
    {
      title: 'Institutional-Grade Infrastructure',
      description: 'The same rigor applied to financial systems now applied to strategic communications. Immutable logs, version control, and complete audit trails.',
    },
  ];

  const layerHighlights = [
    { name: 'Narrative Engineering', color: 'bg-blue-500' },
    { name: 'Media Power Mapping', color: 'bg-purple-500' },
    { name: 'Executive Authority', color: 'bg-indigo-500' },
    { name: 'Crisis Neutralization', color: 'bg-red-500' },
    { name: 'Stakeholder Alignment', color: 'bg-green-500' },
    { name: 'Brand Intelligence', color: 'bg-amber-500' },
    { name: 'Media Amplification', color: 'bg-cyan-500' },
    { name: 'Compliance Automation', color: 'bg-slate-500' },
    { name: 'Defensive Disclosure', color: 'bg-emerald-500' },
    { name: 'Internal Alignment', color: 'bg-rose-500' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-info/5" />
        <NetworkAnimation />
        <div className="container relative py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 animate-fade-in">
              <Zap className="w-4 h-4" />
              About RELAYA
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
              The Future of Strategic Communications is{' '}
              <span className="text-primary">Autonomous</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
              RELAYA represents a fundamental shift in how organizations deploy public relations. 
              We have replaced the unpredictable agency model with a precision-engineered, 
              AI-native communications infrastructure built for institutional accountability.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-card border-b border-border/50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  To eliminate the variance, delay, and compliance risk inherent in traditional 
                  public relations by providing organizations with a deterministic, AI-powered 
                  communications command center.
                </p>
                <p className="text-lg text-muted-foreground">
                  RELAYA enables C-suite executives to deploy boardroom-grade narratives at 
                  global velocity while maintaining complete control over every word, every 
                  channel, and every stakeholder touchpoint.
                </p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-info/20 rounded-2xl blur-3xl" />
                <div className="relative bg-card border border-border/50 rounded-2xl p-8 shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10">
                      <Cpu className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">Autonomous</p>
                      <p className="text-muted-foreground">Surgical. Efficient.</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {['Zero hallucination architecture', 'Compliance-native design', 'Board-ready outputs', 'Real-time crisis response'].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Core Principles</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The foundational tenets that define every feature, every output, and every decision within the RELAYA platform
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value, index) => (
              <div 
                key={index}
                className="bg-card border border-border/50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="py-20 bg-card border-y border-border/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Platform Capabilities</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A comprehensive communications infrastructure designed for enterprise-scale deployment
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((cap, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-xl bg-muted/50 border border-border/50 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{cap.number}</div>
                <div className="text-lg font-semibold text-foreground mb-1">{cap.label}</div>
                <p className="text-sm text-muted-foreground">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 Layers Overview */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">10 Capability Layers</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From narrative engineering to internal alignment, RELAYA covers the complete spectrum of strategic communications
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {layerHighlights.map((layer, index) => (
              <div 
                key={index}
                className={`${layer.color} text-white px-4 py-2 rounded-full text-sm font-medium animate-fade-in`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {index + 1}. {layer.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-20 bg-card border-y border-border/50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">What Sets RELAYA Apart</h2>
              <p className="text-lg text-muted-foreground">
                Purpose-built for organizations that demand institutional-grade communications
              </p>
            </div>
            <div className="space-y-8">
              {differentiators.map((diff, index) => (
                <div 
                  key={index}
                  className="flex gap-6 items-start p-6 rounded-xl bg-muted/30 border border-border/50 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{diff.title}</h3>
                    <p className="text-muted-foreground">{diff.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Professional Toolkit</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade tools for every aspect of strategic communications
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Layers, title: 'Press Kit Builder', description: 'Generate comprehensive media kits with brand assets and executive bios' },
              { icon: Users, title: 'Brand Voice Trainer', description: 'Train AI on your specific brand voice for consistent messaging' },
              { icon: TrendingUp, title: 'Campaign Planner', description: 'AI-powered campaign orchestration with milestone tracking' },
              { icon: Globe, title: 'SEO Analyzer', description: 'Firecrawl-powered competitive analysis and optimization' },
            ].map((tool, index) => (
              <div 
                key={index}
                className="bg-card border border-border/50 rounded-xl p-6 hover:shadow-lg transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                  <tool.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{tool.title}</h3>
                <p className="text-sm text-muted-foreground">{tool.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card border-t border-border/50">
        <div className="container text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
              <Award className="w-4 h-4" />
              Ready to Transform Your Communications
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Experience the Future of PR
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join organizations that have replaced unpredictable agency relationships with 
              autonomous, compliance-grade communications infrastructure.
            </p>
            <Link 
              to="/"
              className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3"
            >
              Explore Services
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default About;
