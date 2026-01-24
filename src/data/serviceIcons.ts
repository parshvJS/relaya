import {
  FileText,
  PenTool,
  FlaskConical,
  Waves,
  Trophy,
  Handshake,
  Radio,
  Target,
  Mic,
  Star,
  UserCircle,
  LayoutDashboard,
  Presentation,
  FileEdit,
  Video,
  AlertTriangle,
  Zap,
  Search,
  Shield,
  Gamepad2,
  Landmark,
  Building2,
  Scale,
  TrendingUp,
  Leaf,
  Microscope,
  Heart,
  LineChart,
  Smile,
  Crosshair,
  Megaphone,
  Smartphone,
  Mail,
  Rss,
  Film,
  CheckCircle,
  ClipboardList,
  FolderOpen,
  Lock,
  Newspaper,
  BookOpen,
  FileText as WhitepaperIcon,
  Award,
  MessageSquare,
  SearchCheck,
  Bell,
  Users,
  Link,
  KeyRound,
  BookMarked,
  type LucideIcon,
} from 'lucide-react';

// Map service IDs to Lucide icons
export const SERVICE_ICONS: Record<string, LucideIcon> = {
  // Layer 1: Narrative Engineering & Perception Command
  'press-release-generator': FileText,
  'blog-post-engine': PenTool,
  'narrative-stress-tester': FlaskConical,
  'perception-cascade-modeler': Waves,
  'category-creation-engine': Trophy,

  // Layer 2: Media Power Mapping & Influence Acceleration
  'partner-mapping-engine': Handshake,
  'media-mapping-tool': Radio,
  'journalist-analyzer': Target,
  'podcast-outreach': Mic,
  'influencer-scanner': Star,

  // Layer 3: Executive Authority & Reputation Architecture
  'executive-positioning': UserCircle,
  'reputation-dashboard': LayoutDashboard,
  'speaking-opportunity-engine': Presentation,
  'byline-generator': FileEdit,
  'media-training-kit': Video,

  // Layer 4: Crisis Signal Detection & Neutralization
  'crisis-narrative-control': AlertTriangle,
  'incident-response-engine': Zap,
  'threat-detection': Search,
  'counter-narrative': Shield,
  'crisis-simulation': Gamepad2,

  // Layer 5: Market Trust & Stakeholder Alignment
  'government-stakeholder': Landmark,
  'federal-agency-planner': Building2,
  'congressional-navigator': Scale,
  'investor-relations': TrendingUp,
  'esg-communicator': Leaf,

  // Layer 6: Brand Intelligence & Adaptive Insights
  'competitive-intelligence': Microscope,
  'brand-health-monitor': Heart,
  'market-trend-analyzer': LineChart,
  'sentiment-analyzer': Smile,
  'scenario-planner': Crosshair,

  // Layer 7: Media Amplification & Convergent Distribution
  'content-amplifier': Megaphone,
  'social-content-generator': Smartphone,
  'newsletter-generator': Mail,
  'pr-wire-optimizer': Rss,
  'video-script-generator': Film,

  // Layer 8: Compliance Automation & Regulatory Integrity
  'compliance-checker': CheckCircle,
  'disclosure-generator': ClipboardList,
  'audit-trail-generator': FolderOpen,
  'data-privacy-toolkit': Lock,
  'regulatory-update-monitor': Newspaper,

  // Layer 9: Institutional Credibility & Defensive Disclosure
  'case-study-generator': BookOpen,
  'whitepaper-generator': WhitepaperIcon,
  'award-submission': Award,
  'testimonial-engine': MessageSquare,
  'credibility-audit': SearchCheck,

  // Layer 10: Internal Alignment & Data Integrity
  'internal-comms-generator': Bell,
  'employee-advocacy': Users,
  'message-alignment-checker': Link,
  'leak-prevention': KeyRound,
  'knowledge-base-builder': BookMarked,
};

// Get icon for a service, with fallback
export const getServiceIcon = (serviceId: string): LucideIcon => {
  return SERVICE_ICONS[serviceId] || FileText;
};
