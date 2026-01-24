import { Building2, Briefcase, Scale, Rocket, Globe, Cpu } from 'lucide-react';

const TrustedBySection = () => {
  const industries = [
    { icon: Building2, name: 'Enterprise' },
    { icon: Briefcase, name: 'Consulting' },
    { icon: Scale, name: 'Legal' },
    { icon: Rocket, name: 'Startups' },
    { icon: Globe, name: 'Global Brands' },
    { icon: Cpu, name: 'Tech Companies' },
  ];

  return (
    <section className="py-8 border-b border-border/50 bg-muted/20">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            Trusted by leading industries:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {industries.map((industry, index) => (
              <div 
                key={industry.name}
                className="flex items-center gap-2 text-muted-foreground/70 hover:text-foreground transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <industry.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{industry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBySection;
