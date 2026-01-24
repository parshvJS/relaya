import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Server, Database, Zap, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  value: string;
  icon: typeof Server;
}

const SystemHealth = () => {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    try {
      // Check database connection
      const dbStart = Date.now();
      const { error: dbError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      const dbLatency = Date.now() - dbStart;

      // Get user count
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

      // Get lead count
      const { count: leadCount } = await supabase.from('contact_submissions').select('*', { count: 'exact', head: true });

      // Get image count
      const { count: imageCount } = await supabase.from('generated_images').select('*', { count: 'exact', head: true });

      setMetrics([
        {
          name: 'Database',
          status: dbError ? 'error' : dbLatency > 500 ? 'warning' : 'healthy',
          value: dbError ? 'Connection Error' : `${dbLatency}ms latency`,
          icon: Database
        },
        {
          name: 'Users',
          status: 'healthy',
          value: `${userCount || 0} registered`,
          icon: Users
        },
        {
          name: 'Leads',
          status: 'healthy',
          value: `${leadCount || 0} submissions`,
          icon: Zap
        },
        {
          name: 'Images',
          status: 'healthy',
          value: `${imageCount || 0} generated`,
          icon: Server
        }
      ]);
    } catch (error) {
      console.error('Health check failed:', error);
      setMetrics([{
        name: 'System',
        status: 'error',
        value: 'Health check failed',
        icon: Server
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const overallHealth = metrics.every(m => m.status === 'healthy') 
    ? 100 
    : metrics.some(m => m.status === 'error') 
      ? 25 
      : 75;

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-muted rounded w-1/3" />
        <div className="h-2 bg-muted rounded" />
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">System Health</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
          overallHealth === 100 ? 'bg-green-500/10 text-green-500' :
          overallHealth > 50 ? 'bg-yellow-500/10 text-yellow-500' :
          'bg-red-500/10 text-red-500'
        }`}>
          {overallHealth === 100 ? 'All Systems Operational' : 
           overallHealth > 50 ? 'Degraded Performance' : 
           'Issues Detected'}
        </span>
      </div>
      
      <Progress value={overallHealth} className="h-2 mb-4" />
      
      <div className="space-y-3">
        {metrics.map((metric) => (
          <div 
            key={metric.name}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStatusColor(metric.status)}/10`}>
                <metric.icon className={`h-4 w-4 ${
                  metric.status === 'healthy' ? 'text-green-500' :
                  metric.status === 'warning' ? 'text-yellow-500' :
                  'text-red-500'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{metric.name}</p>
                <p className="text-xs text-muted-foreground">{metric.value}</p>
              </div>
            </div>
            {getStatusIcon(metric.status)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemHealth;
