import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import ScrollRestoration from "@/components/ScrollRestoration";
import Index from "./pages/Index";
import About from "./pages/About";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import Features from "./pages/Features";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import AITransformingPR from "./pages/blog/AITransformingPR";
import PRAutomationGuide from "./pages/blog/PRAutomationGuide";
import CrisisCommunications from "./pages/blog/CrisisCommunications";
import ComplianceCommunications from "./pages/blog/ComplianceCommunications";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import OutreachAutopilot from "./pages/OutreachAutopilot";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import AcceptableUse from "./pages/AcceptableUse";
import Disclaimer from "./pages/Disclaimer";
import AdminLayout from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminLeads from "./pages/admin/AdminLeads";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminContent from "./pages/admin/AdminContent";
import Login from "./pages/user/Login";
import CreateAccount from "./pages/user/CreateAccount";
import Campaign from "./pages/Campaign";
import CreateNewCampaign from "./pages/campaign/CreateNewCampaign";
import CampaignStatus from "./pages/campaign/CampaignStatus";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollRestoration />
          <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/features" element={<Features />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/campaign" element={<Campaign />} />
            <Route path="/campaign/create-new-campaign" element={<CreateNewCampaign />} />
            <Route path="/campaign-status/:id" element={<CampaignStatus />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />

            {/* User Auth Routes */}
            <Route path="/user/login" element={<Login />} />
            <Route path="/user/create-new-account" element={<CreateAccount />} />
            <Route path="/outreach-autopilot" element={<OutreachAutopilot />} />

            {/* Blog Routes */}
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/ai-transforming-enterprise-pr-2026" element={<AITransformingPR />} />
            <Route path="/blog/complete-guide-pr-automation" element={<PRAutomationGuide />} />
            <Route path="/blog/crisis-communications-digital-age" element={<CrisisCommunications />} />
            <Route path="/blog/building-compliance-ready-communications-strategy" element={<ComplianceCommunications />} />

            {/* Legal Routes */}
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/acceptable-use" element={<AcceptableUse />} />
            <Route path="/disclaimer" element={<Disclaimer />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminOverview />} />
              <Route path="leads" element={<AdminLeads />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
