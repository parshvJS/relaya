import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Zap, ArrowLeft, Mail, Lock, User } from 'lucide-react';
import NetworkAnimation from '@/components/NetworkAnimation';
import { useTheme } from '@/hooks/useTheme';

const Auth = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const isDarkMode = useTheme();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Reset password form
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setIsLoading(false);
    
    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome back",
        description: "You have successfully logged in",
      });
      navigate('/dashboard');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupEmail || !signupPassword || !signupName) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (signupPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }
    
    if (signupPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    setIsLoading(false);
    
    if (error) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created",
        description: "Welcome to RELAYA! You can now access all services.",
      });
      navigate('/dashboard');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        title: "Missing email",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    const { error } = await resetPassword(resetEmail);
    setIsLoading(false);
    
    if (error) {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link",
      });
      setShowForgotPassword(false);
      setResetEmail('');
    }
  };

  if (authLoading) {
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

        {/* Auth Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
                <Zap className="w-4 h-4" />
                Enterprise PR Platform
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to RELAYA</h1>
              <p className="text-muted-foreground">Sign in to access all 50 PR services</p>
            </div>

            <Card className="border-border/50 shadow-lg">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <CardHeader className="pb-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Create Account</TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent>
                  {showForgotPassword ? (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold">Reset Password</h3>
                        <p className="text-sm text-muted-foreground">Enter your email to receive a reset link</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reset-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="Enter your email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          'Send Reset Link'
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        className="w-full" 
                        onClick={() => setShowForgotPassword(false)}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Sign In
                      </Button>
                    </form>
                  ) : (
                    <>
                  <TabsContent value="login" className="mt-0">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="Enter your email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password">Password</Label>
                          <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-xs text-primary hover:underline"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
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
                  </TabsContent>

                  <TabsContent value="signup" className="mt-0">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="John Smith"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="Enter your email"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="••••••••"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="confirm-password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating account...
                          </>
                        ) : (
                          'Create Account'
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                    </>
                  )}
                </CardContent>

                <CardFooter className="flex flex-col gap-4 pt-0">
                  <div className="text-center text-sm text-muted-foreground">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                  </div>
                </CardFooter>
              </Tabs>
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

export default Auth;
