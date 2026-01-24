import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollRestoration component that scrolls to the top of the page
 * on route changes, or to a specific section if there's a hash in the URL.
 * Uses smooth animations for in-page navigation.
 */
const ScrollRestoration = () => {
  const { pathname, hash } = useLocation();
  const prevPathname = useRef(pathname);

  useEffect(() => {
    const isRouteChange = prevPathname.current !== pathname;
    prevPathname.current = pathname;

    // Small delay to ensure the DOM is ready
    const timeoutId = setTimeout(() => {
      if (hash) {
        // If there's a hash, scroll to that section with smooth animation
        const element = document.getElementById(hash.replace('#', ''));
        if (element) {
          const headerHeight = 64; // h-16 = 64px
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerHeight;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      } else if (isRouteChange) {
        // Route change without hash - instant scroll to top
        window.scrollTo({
          top: 0,
          behavior: 'instant'
        });
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [pathname, hash]);

  return null;
};

export default ScrollRestoration;
