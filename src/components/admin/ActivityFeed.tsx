import { useEffect, useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  UserPlus, 
  MessageSquare, 
  Shield, 
  Settings, 
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: unknown;
  created_at: string;
}

const getActivityIcon = (action: string, entityType: string) => {
  if (entityType === 'user') {
    if (action === 'create') return UserPlus;
    if (action === 'role_change') return Shield;
  }
  if (entityType === 'lead') {
    if (action === 'status_change') return CheckCircle;
    if (action === 'delete') return Trash2;
    return MessageSquare;
  }
  if (entityType === 'settings') return Settings;
  if (action === 'delete') return Trash2;
  if (action === 'update') return Edit;
  return Activity;
};

const getActivityColor = (action: string) => {
  switch (action) {
    case 'create': return 'bg-green-500/10 text-green-500';
    case 'delete': return 'bg-red-500/10 text-red-500';
    case 'status_change': return 'bg-blue-500/10 text-blue-500';
    case 'role_change': return 'bg-purple-500/10 text-purple-500';
    default: return 'bg-muted text-muted-foreground';
  }
};

const formatActivityMessage = (log: ActivityLog) => {
  const details = (log.details || {}) as Record<string, string>;
  
  switch (log.entity_type) {
    case 'lead':
      if (log.action === 'status_change') {
        return `Lead status changed to "${details.new_status}"`;
      }
      if (log.action === 'delete') {
        return `Lead "${details.name || 'Unknown'}" was deleted`;
      }
      return `Lead "${details.name || 'Unknown'}" was ${log.action}d`;
    
    case 'user':
      if (log.action === 'role_change') {
        return `User role changed to "${details.new_role}"`;
      }
      if (log.action === 'create') {
        return `New user "${details.name || 'Unknown'}" registered`;
      }
      return `User was ${log.action}d`;
    
    case 'settings':
      return `${details.setting_name || 'Settings'} were updated`;
    
    default:
      return `${log.entity_type} was ${log.action}d`;
  }
};

interface ActivityFeedProps {
  limit?: number;
  showHeader?: boolean;
}

const ActivityFeed = ({ limit = 10, showHeader = true }: ActivityFeedProps) => {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('activity_logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
        },
        (payload) => {
          setActivities((prev) => [payload.new as ActivityLog, ...prev.slice(0, limit - 1)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  if (loading) {
    return (
      <div className="space-y-4">
        {showHeader && <Skeleton className="h-6 w-32" />}
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div>
      {showHeader && (
        <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
      )}
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.action, activity.entity_type);
            const colorClass = getActivityColor(activity.action);
            
            return (
              <div key={activity.id} className="flex items-start gap-3 group">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground line-clamp-2">
                    {formatActivityMessage(activity)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ActivityFeed;
