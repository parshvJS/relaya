import { CAPABILITY_LAYERS, PR_SERVICES } from '@/data/prServices';

interface CapabilityLayersSectionProps {
  onLayerSelect: (layerId: number) => void;
}

const CapabilityLayersSection = ({ onLayerSelect }: CapabilityLayersSectionProps) => {
  const getServiceCount = (layerId: number) => {
    return PR_SERVICES.filter(s => s.layerNumber === layerId).length;
  };

  const handleLayerClick = (layerId: number) => {
    onLayerSelect(layerId);
    // Scroll to services section
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      const headerHeight = 128;
      const elementPosition = servicesSection.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <section id="layers" className="py-12 md:py-16 bg-muted/30 border-b border-border/50">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">10 Capability Layers</h2>
          <p className="text-muted-foreground">Click any layer to explore its services</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {CAPABILITY_LAYERS.map((layer, index) => {
            const serviceCount = getServiceCount(layer.id);
            return (
              <button
                key={layer.id}
                onClick={() => handleLayerClick(layer.id)}
                className="p-4 rounded-xl border border-border/50 bg-card hover:shadow-lg transition-all duration-300 text-left group animate-fade-in hover-scale relative overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Background gradient on hover */}
                <div className={`absolute inset-0 ${layer.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`w-8 h-8 rounded-lg ${layer.color} text-white flex items-center justify-center text-sm font-bold`}>
                      {layer.id}
                    </div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {serviceCount} services
                    </span>
                  </div>
                  <p className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {layer.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CapabilityLayersSection;
