import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ArrowRight, Mail, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

interface Lead {
  id: string;
  name: string;
  email: string;
  inquiry_type: string;
  status: string;
  created_at: string;
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  new: 'default',
  contacted: 'secondary',
  qualified: 'outline',
  closed: 'destructive'
};

const RecentLeadsWidget = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const { data, error } = await supabase
          .from('contact_submissions')
          .select('id, name, email, inquiry_type, status, created_at')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) throw error;
        setLeads(data || []);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('contact_submissions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'contact_submissions',
        },
        () => {
          fetchLeads();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-20" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Recent Leads</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary"
          onClick={() => navigate('/admin/leads')}
        >
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {leads.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No leads yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <div
              key={lead.id}
              className="flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
              onClick={() => navigate('/admin/leads')}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {lead.name}
                  </p>
                  <Badge variant={statusVariants[lead.status] || 'outline'} className="text-xs">
                    {lead.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="h-3 w-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-2">
                <Clock className="h-3 w-3" />
                {format(new Date(lead.created_at), 'MMM d')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentLeadsWidget;
