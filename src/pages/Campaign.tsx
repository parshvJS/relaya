import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Rocket, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Campaign = () => {
  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Redirect to dashboard if logged in
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Campaign - RELAYA</title>
        <meta name="description" content="Campaign feature coming soon to RELAYA" />
      </Helmet>

      <Header />

      <main className="flex-1 container flex items-center justify-center py-16">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
            <Rocket className="w-4 h-4" />
            Outreach Campaign
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Campaign Management
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Create and manage powerful outreach campaigns to connect with your target audience
          </p>
          <div className="flex flex-col items-center gap-4">
            <Link to="/user/login">
              <Button size="lg" className="gap-2 text-lg px-8 py-6">
                <Plus className="w-5 h-5" />
                Sign In to Create Campaign
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              Login to access the campaign management dashboard
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Campaign;
