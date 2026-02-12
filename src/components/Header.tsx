import { Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isDarkMode = useTheme();

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, [location]);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Services', href: '/services', isRoute: true },
    { label: 'Pricing', href: '/pricing', isRoute: true },
    { label: 'Features', href: '/features', isRoute: true },
    { label: 'Campaign', href: '/campaign', isRoute: true },
    { label: 'About', href: '/about', isRoute: true },
    { label: 'Contact', href: '/contact', isRoute: true },
  ];

  const scrollToSection = useCallback((href: string) => {
    setIsMobileMenuOpen(false);
    
    // Remove the # from the href
    const sectionId = href.replace('#', '');
    const element = document.getElementById(sectionId);
    
    if (element) {
      // Get header height for offset
      const headerHeight = 160; // h-16 = 64px
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    } else if (href === '#services') {
      // Fallback for services - scroll to filter bar
      const filterBar = document.querySelector('[data-section="filters"]');
      if (filterBar) {
        const headerHeight = 160;
        const elementPosition = filterBar.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      {/* Scroll Progress Indicator */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-muted/30">
        <div 
          className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <div className="container flex p-4 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src={isDarkMode ? '/logo-white.svg' : '/logo-black.svg'}
            alt="Relaya Logo"
            className="h-16  object-contain transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            link.isRoute ? (
              <Link
                key={link.label}
                to={link.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:bg-accent group ${
                  location.pathname === link.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
                <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full transition-all duration-300 ${
                  location.pathname === link.href ? 'w-1/2' : 'w-0 group-hover:w-1/2'
                }`} />
              </Link>
            ) : (
              <button
                key={link.label}
                onClick={() => {
                  if (!isHomePage && link.routeOnly) {
                    window.location.href = '/' + link.href;
                  } else {
                    scrollToSection(link.href);
                  }
                }}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-all duration-300 hover:bg-accent group"
              >
                {link.label}
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-1/2" />
              </button>
            )
          ))}
        </nav>

        {/* CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              to="/dashboard"
              className="btn-primary text-sm px-4 py-2 transition-transform duration-200 hover:scale-105 flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          ) : (
            <Link
              to="/user/login"
              className="btn-primary text-sm px-4 py-2 transition-transform duration-200 hover:scale-105 flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5 animate-scale-in" />
          ) : (
            <Menu className="w-5 h-5 animate-scale-in" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${
          isMobileMenuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-md">
          <nav className="container py-4 flex flex-col gap-1">
            {navLinks.map((link, index) => (
              link.isRoute ? (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 text-sm font-medium hover:bg-accent rounded-lg transition-all duration-200 text-left animate-fade-in ${
                    location.pathname === link.href ? 'text-foreground bg-accent' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  onClick={() => {
                    if (!isHomePage && link.routeOnly) {
                      window.location.href = '/' + link.href;
                    } else {
                      scrollToSection(link.href);
                    }
                  }}
                  className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-all duration-200 text-left animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {link.label}
                </button>
              )
            ))}
            {isLoggedIn ? (
              <Link
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-primary text-sm px-4 py-3 mt-2 animate-fade-in text-center flex items-center justify-center gap-2"
                style={{ animationDelay: '200ms' }}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            ) : (
              <Link
                to="/user/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-primary text-sm px-4 py-3 mt-2 animate-fade-in text-center flex items-center justify-center gap-2"
                style={{ animationDelay: '200ms' }}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
