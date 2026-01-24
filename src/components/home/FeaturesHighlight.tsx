import { Sparkles, Target, Shield, Zap, Clock, Globe } from 'lucide-react';

const FeaturesHighlight = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Generation',
      description: 'Deterministic AI systems deliver consistent, professional outputs every time.',
      color: 'bg-primary/10 text-primary'
    },
    {
      icon: Target,
      title: 'Precision Targeting',
      description: 'Strategic content tailored to specific audiences, channels, and objectives.',
      color: 'bg-success/10 text-success'
    },
    {
      icon: Shield,
      title: 'Compliance-Ready',
      description: 'Enterprise-grade outputs that meet regulatory and brand guidelines.',
      color: 'bg-info/10 text-info'
    },
    {
      icon: Zap,
      title: 'Instant Delivery',
      description: 'Generate press releases, crisis comms, and strategic content in seconds.',
      color: 'bg-warning/10 text-warning'
    },
    {
      icon: Clock,
      title: '24/7 Availability',
      description: 'Your PR toolkit is always ready when opportunities or crises strike.',
      color: 'bg-destructive/10 text-destructive'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Multi-market support for international PR campaigns and communications.',
      color: 'bg-primary/10 text-primary'
    },
  ];

  return (
    <section className="py-16 md:py-20 border-b border-border/50">
      <div className="container">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-medium text-success mb-4">
            <Sparkles className="w-4 h-4" />
            Why Relaya
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Enterprise PR, Reimagined
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Combining AI precision with boardroom-grade strategy for communications that matter.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group p-6 rounded-xl bg-card border border-border/50 hover:shadow-lg transition-all duration-300 animate-fade-in hover-scale"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesHighlight;
