import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, LogOut, User, Mail, Calendar, Zap, TrendingUp, FileText, BarChart3 } from 'lucide-react';
import NetworkAnimation from '@/components/NetworkAnimation';
import { useTheme } from '@/hooks/useTheme';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const CoreDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isDarkMode = useTheme();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      navigate('/user/login');
      return;
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/user/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/user/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-info/5" />
      <NetworkAnimation />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/" className="flex items-center gap-2 group">
                  <img
                    src={isDarkMode ? '/logo-white.svg' : '/logo-black.svg'}
                    alt="Relaya Logo"
                    className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
                  />
                </Link>
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <Zap className="w-3 h-3" />
                  Dashboard
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome to Your Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your PR services and campaigns from one central location
            </p>
          </div>

          {/* User Info Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 text-primary" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Member since:</span>
                  <span className="font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active Campaigns:</span>
                  <span className="font-bold text-lg">0</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Services:</span>
                  <span className="font-bold text-lg text-primary">50</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  This Month
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Press Releases:</span>
                  <span className="font-bold text-lg">0</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Media Contacts:</span>
                  <span className="font-bold text-lg">0</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link to="/">
                <Card className="border-border/50 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="p-3 bg-primary/10">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold">PR Services</h3>
                      <p className="text-xs text-muted-foreground">Access all 50 services</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/">
                <Card className="border-border/50 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="p-3 bg-primary/10">
                        <TrendingUp className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold">Analytics</h3>
                      <p className="text-xs text-muted-foreground">View performance</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/">
                <Card className="border-border/50 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="p-3 bg-primary/10">
                        <BarChart3 className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold">Reports</h3>
                      <p className="text-xs text-muted-foreground">Generate insights</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/">
                <Card className="border-border/50 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="p-3 bg-primary/10">
                        <Zap className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold">Campaigns</h3>
                      <p className="text-xs text-muted-foreground">Manage campaigns</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Getting Started */}
          <Card className="border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Start using RELAYA's powerful PR services to transform your communications strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Explore PR Services</h4>
                  <p className="text-sm text-muted-foreground">
                    Browse through 50+ AI-powered PR services across 10 capability layers
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Create Your First Campaign</h4>
                  <p className="text-sm text-muted-foreground">
                    Use our campaign planner to design and execute your PR strategy
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Monitor Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Track engagement and measure the impact of your communications
                  </p>
                </div>
              </div>
              <Button asChild className="w-full mt-4">
                <Link to="/">
                  <Zap className="w-4 h-4 mr-2" />
                  Explore Services
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default CoreDashboard;
