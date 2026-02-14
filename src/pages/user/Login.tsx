import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Zap, ArrowLeft, Mail, Lock } from 'lucide-react';
import NetworkAnimation from '@/components/NetworkAnimation';
import { useTheme } from '@/hooks/useTheme';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isDarkMode = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Store token in localStorage
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      toast({
        title: "Welcome back",
        description: "You have successfully logged in",
      });

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || 'An error occurred during login',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-info/5" />
      <NetworkAnimation />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="container py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src={isDarkMode ? '/logo-white.svg' : '/logo-black.svg'}
                alt="Relaya Logo"
                className="h-16 md:h-16 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </header>

        {/* Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
                <Zap className="w-4 h-4" />
                Enterprise PR Platform
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
              <p className="text-muted-foreground">Sign in to access your dashboard</p>
            </div>

            <Card className="border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-center">Sign In</CardTitle>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 pt-0">
                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to="/user/create-new-account" className="text-primary hover:underline">
                    Create one now
                  </Link>
                </div>
              </CardFooter>
            </Card>

            {/* Features Preview */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                { label: '50 Services', value: 'PR Tools' },
                { label: 'AI-Powered', value: 'Content' },
                { label: '100%', value: 'Compliance' },
              ].map((stat, i) => (
                <div key={i} className="p-3 rounded-lg bg-card/50 border border-border/50">
                  <div className="text-lg font-bold text-primary">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
