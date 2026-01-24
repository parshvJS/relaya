import { useEffect } from 'react';

interface CalendlyEmbedProps {
  url: string;
  minWidth?: string;
  height?: string;
}

const CalendlyEmbed = ({ 
  url, 
  minWidth = '320px', 
  height = '400px' 
}: CalendlyEmbedProps) => {
  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div 
      className="calendly-inline-widget rounded-xl overflow-hidden" 
      data-url={url}
      style={{ 
        minWidth, 
        height,
        width: '100%'
      }} 
    />
  );
};

export default CalendlyEmbed;
