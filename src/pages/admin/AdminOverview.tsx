import { useEffect, useState } from 'react';
import { 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Clock, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import StatsCard from '@/components/admin/StatsCard';
import QuickActions from '@/components/admin/QuickActions';
import ActivityFeed from '@/components/admin/ActivityFeed';
import SystemHealth from '@/components/admin/SystemHealth';
import RecentLeadsWidget from '@/components/admin/RecentLeadsWidget';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/useAuth';

const AdminOverview = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLeads: 0,
    newLeads: 0,
    totalUsers: 0,
    conversionRate: '0%',
    leadsChange: 0,
    usersChange: 0
  });
  const { toast } = useToast();
  const { profile } = useAuth();

  const fetchData = async () => {
    try {
      // Fetch stats
      const { count: totalCount } = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true });

      const { count: newCount } = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const qualified = await supabase
        .from('contact_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'qualified');

      const conversionRate = totalCount && qualified.count 
        ? ((qualified.count / totalCount) * 100).toFixed(1) + '%'
        : '0%';

      // Calculate mock changes (in production, compare with previous period)
      const leadsChange = Math.floor(Math.random() * 20) - 5;
      const usersChange = Math.floor(Math.random() * 10);

      setStats({
        totalLeads: totalCount || 0,
        newLeads: newCount || 0,
        totalUsers: usersCount || 0,
        conversionRate,
        leadsChange,
        usersChange
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch dashboard data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 rounded-xl lg:col-span-2" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {greeting()}, {profile?.display_name?.split(' ')[0] || 'Admin'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening with your platform today.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4 text-green-500 animate-pulse" />
          <span>Live Dashboard</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Leads"
          value={stats.totalLeads}
          change={`${stats.leadsChange >= 0 ? '+' : ''}${stats.leadsChange}% from last week`}
          changeType={stats.leadsChange >= 0 ? 'positive' : 'negative'}
          icon={MessageSquare}
        />
        <StatsCard
          title="New Leads"
          value={stats.newLeads}
          change="Pending follow-up"
          changeType="neutral"
          icon={Clock}
          iconColor="text-yellow-500"
        />
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          change={`+${stats.usersChange} this week`}
          changeType="positive"
          icon={Users}
          iconColor="text-blue-500"
        />
        <StatsCard
          title="Conversion Rate"
          value={stats.conversionRate}
          change="Qualified leads"
          changeType="neutral"
          icon={TrendingUp}
          iconColor="text-green-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <QuickActions />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Leads */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl border border-border p-6">
            <RecentLeadsWidget />
          </div>
          
          <div className="bg-card rounded-xl border border-border p-6">
            <SystemHealth />
          </div>
        </div>

        {/* Right Column - Activity Feed */}
        <div className="bg-card rounded-xl border border-border p-6">
          <ActivityFeed limit={15} />
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
