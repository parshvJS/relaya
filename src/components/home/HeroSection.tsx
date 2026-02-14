import { Zap, ArrowRight, Calendar, Layers, Shield, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NetworkAnimation from '@/components/NetworkAnimation';

const HeroSection = () => {
  const stats = [
    { icon: Layers, label: 'Strategic Layers', value: '10' },
    { icon: Zap, label: 'PR Services', value: '50' },
    { icon: Shield, label: 'Compliance-Grade', value: '100%' },
    { icon: BarChart3, label: 'AI-Powered', value: 'Yes' },
  ];

  return (
    <section id="about" className="relative overflow-hidden border-b border-border/50">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-info/5" />
      <NetworkAnimation />
      <div className="container relative py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 animate-fade-in">
              <Zap className="w-4 h-4" />
              Enterprise PR Excellence Platform
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
              RELAYA
            </h1>
            <p className="text-xl md:text-2xl font-medium text-primary mb-6 animate-fade-in tracking-wide" style={{ animationDelay: '150ms' }}>
              Autonomous. Surgical. Efficient.
            </p>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl animate-fade-in" style={{ animationDelay: '200ms' }}>
              Boardroom-grade PR services with deterministic AI precision. 
              Generate press releases, crisis communications, and strategic content with compliance-grade outputs.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 animate-fade-in" style={{ animationDelay: '250ms' }}>
              <Link to="/user/create-new-account">
                <Button size="lg" className="btn-primary text-base px-8 py-6 w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/outreach-autopilot">
                <Button size="lg" variant="outline" className="text-base px-8 py-6 w-full sm:w-auto">
                  <Calendar className="w-5 h-5 mr-2" />
                  Try Outreach Autopilot
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stats.map((stat, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-3 rounded-lg bg-card border border-border/50 p-3 animate-fade-in hover-scale shadow-sm hover:shadow-md transition-shadow ${
                    i % 2 === 0 ? 'animate-float' : 'animate-float-delayed'
                  }`}
                  style={{ 
                    animationDelay: `${300 + i * 100}ms`,
                    animationDuration: `${3 + i * 0.5}s`
                  }}
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary/10 animate-pulse-soft">
                    <stat.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-foreground">{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Feature Preview */}
          <div className="hidden lg:block animate-fade-in" style={{ animationDelay: '400ms' }}>
            <div className="relative">
              <div className="glass-card rounded-2xl p-6 border border-border/50 shadow-xl">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="ml-auto text-xs text-muted-foreground font-mono">relaya.ai</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg animate-pulse-soft">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-primary/30 rounded w-3/4 mb-2" />
                      <div className="h-2 bg-muted-foreground/20 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-success/30 rounded w-2/3 mb-2" />
                      <div className="h-2 bg-muted-foreground/20 rounded w-2/5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-info" />
                    </div>
                    <div className="flex-1">
                      <div className="h-3 bg-info/30 rounded w-4/5 mb-2" />
                      <div className="h-2 bg-muted-foreground/20 rounded w-1/3" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-xl bg-primary/10 backdrop-blur-sm border border-primary/20 flex items-center justify-center animate-float">
                <span className="text-2xl font-bold text-primary">50+</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-xl bg-success/10 backdrop-blur-sm border border-success/20 flex items-center justify-center animate-float-delayed">
                <Shield className="w-7 h-7 text-success" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
