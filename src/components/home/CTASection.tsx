import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CTASection = () => {
  return (
    <section id="contact" className="py-20 md:py-24 bg-gradient-to-br from-primary/5 via-background to-info/5 border-t border-border/50">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Start Today
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 animate-fade-in" style={{ animationDelay: '100ms' }}>
            Ready to Transform Your PR?
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '150ms' }}>
            Create your free account to access all 50 AI-powered PR services. 
            Generate compliance-ready content at enterprise scale.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '200ms' }}>
            <Link to="/user/create-new-account">
              <Button size="lg" className="btn-primary text-base px-10 py-6 w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline" className="text-base px-10 py-6 w-full sm:w-auto">
                Learn More
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '250ms' }}>
            No credit card required · Free tier available · Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
