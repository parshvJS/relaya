import { Link } from 'react-router-dom';
import logo from '@/assets/logo.jpeg';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'Acceptable Use', href: '/acceptable-use' },
      { label: 'Disclaimer', href: '/disclaimer' },
    ],
  };

  return (
    <footer className="border-t border-border/50 bg-muted/30">
      <div className="container py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
          {/* Brand Column */}
          <div className="max-w-sm">
            <a href="/" className="flex items-center gap-2 mb-4">
              <img
                src={logo}
                alt="Relaya Logo"
                className="h-10 w-auto object-contain"
              />
            </a>
            <p className="text-sm text-muted-foreground">
              Enterprise-grade PR services powered by AI. Generate compliance-ready content at scale.
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-sm text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-muted-foreground text-center">
              By using this website, you agree to our legal documents. Please review them in the footer.
            </p>
            <p className="text-sm text-muted-foreground">
              {currentYear} Relaya. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
