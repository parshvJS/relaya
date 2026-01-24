import { 
  UserPlus, 
  FileText, 
  Send, 
  Download, 
  RefreshCw,
  Settings,
  BarChart3,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const QuickActions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const exportAllLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const headers = ['Name', 'Email', 'Website', 'Type', 'Status', 'Message', 'Date'];
      const csvContent = [
        headers.join(','),
        ...(data || []).map(lead => [
          `"${lead.name}"`,
          lead.email,
          lead.website || '',
          lead.inquiry_type,
          lead.status,
          `"${lead.message.replace(/"/g, '""')}"`,
          new Date(lead.created_at).toISOString()
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `all-leads-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({ title: 'Leads exported successfully' });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Could not export leads',
        variant: 'destructive'
      });
    }
  };

  const actions = [
    {
      icon: UserPlus,
      label: 'View Users',
      description: 'Manage user roles',
      onClick: () => navigate('/admin/users'),
      color: 'text-blue-500 bg-blue-500/10'
    },
    {
      icon: FileText,
      label: 'View Leads',
      description: 'Manage submissions',
      onClick: () => navigate('/admin/leads'),
      color: 'text-green-500 bg-green-500/10'
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      description: 'View reports',
      onClick: () => navigate('/admin/analytics'),
      color: 'text-purple-500 bg-purple-500/10'
    },
    {
      icon: Download,
      label: 'Export Leads',
      description: 'Download CSV',
      onClick: exportAllLeads,
      color: 'text-orange-500 bg-orange-500/10'
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'Site configuration',
      onClick: () => navigate('/admin/settings'),
      color: 'text-slate-500 bg-slate-500/10'
    },
    {
      icon: Database,
      label: 'Content',
      description: 'Manage content',
      onClick: () => navigate('/admin/content'),
      color: 'text-pink-500 bg-pink-500/10'
    }
  ];

  return (
    <div>
      <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors text-center group"
          >
            <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <action.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
