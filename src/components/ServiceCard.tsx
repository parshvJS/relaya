import { ArrowRight } from 'lucide-react';
import { getLayerColor, getLayerTextColor, type PRService } from '@/data/prServices';
import { getServiceIcon } from '@/data/serviceIcons';

interface ServiceCardProps {
  service: PRService;
  onClick: () => void;
  style?: React.CSSProperties;
}

const ServiceCard = ({ service, onClick, style }: ServiceCardProps) => {
  const Icon = getServiceIcon(service.id);

  return (
    <button
      onClick={onClick}
      className="service-card text-left w-full animate-fade-in group"
      style={style}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${getLayerColor(service.layerNumber)} bg-opacity-10`}>
          <Icon className={`w-5 h-5 ${getLayerTextColor(service.layerNumber)}`} />
        </div>
        <span className={`layer-badge rounded-full ${getLayerColor(service.layerNumber)} text-white text-xs`}>
          Layer {service.layerNumber}
        </span>
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
        {service.shortName}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {service.description}
      </p>
      
      <div className="flex items-center justify-between pt-4 border-t border-border/50">
        <span className={`text-xs font-medium ${getLayerTextColor(service.layerNumber)}`}>
          {service.layer.split(' ').slice(0, 2).join(' ')}
        </span>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
};

export default ServiceCard;
