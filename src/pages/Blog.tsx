import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

const Blog = () => {
  const blogPosts = [
    {
      slug: 'ai-transforming-enterprise-pr-2026',
      title: 'How AI is Transforming Enterprise Public Relations in 2026',
      excerpt: 'Discover how artificial intelligence is revolutionizing enterprise PR operations, enabling autonomous communications, and delivering compliance-ready outputs at scale.',
      date: '2026-01-24',
      readTime: '8 min read',
      category: 'AI & Technology',
    },
    {
      slug: 'complete-guide-pr-automation',
      title: 'The Complete Guide to PR Automation for Enterprise Organizations',
      excerpt: 'Learn how PR automation transforms strategic communications workflows, reduces costs, and enables organizations to scale their PR operations without adding headcount.',
      date: '2026-01-23',
      readTime: '10 min read',
      category: 'Strategy',
    },
    {
      slug: 'crisis-communications-digital-age',
      title: 'Crisis Communications in the Digital Age: Best Practices for 2026',
      excerpt: 'Master the art of crisis communications with proven strategies for responding to threats in real-time while maintaining brand reputation and stakeholder trust.',
      date: '2026-01-22',
      readTime: '9 min read',
      category: 'Crisis Management',
    },
    {
      slug: 'building-compliance-ready-communications-strategy',
      title: 'Building a Compliance-Ready Communications Strategy',
      excerpt: 'Navigate regulatory requirements with a communications strategy designed for compliance. Learn how to generate SEC, GDPR, and HIPAA-ready content at scale.',
      date: '2026-01-21',
      readTime: '7 min read',
      category: 'Compliance',
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>RELAYA Blog - AI PR Insights, Strategies & Best Practices</title>
        <meta name="description" content="Expert insights on AI-powered PR, strategic communications, crisis management, and compliance-ready content. Learn how to transform your enterprise PR operations." />
        <link rel="canonical" href="https://relaya.com/blog" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://relaya.com/blog" />
        <meta property="og:title" content="RELAYA Blog - AI PR Insights & Strategies" />
        <meta property="og:description" content="Expert insights on AI-powered PR, strategic communications, and compliance-ready content." />
        <meta property="og:image" content="https://relaya.com/favicon.jpeg" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="RELAYA Blog - AI PR Insights" />
        <meta name="twitter:description" content="Expert insights on AI-powered PR and strategic communications." />

        {/* JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "RELAYA Blog",
            "description": "Expert insights on AI-powered PR, strategic communications, and compliance-ready content",
            "url": "https://relaya.com/blog",
            "publisher": {
              "@type": "Organization",
              "name": "RELAYA",
              "logo": {
                "@type": "ImageObject",
                "url": "https://relaya.com/favicon.jpeg"
              }
            }
          })}
        </script>
      </Helmet>

      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/5 via-transparent to-info/5">
          <div className="container py-20 md:py-32">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 animate-fade-in">
                PR Insights & Strategies
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
                Expert analysis on AI-powered public relations, strategic communications, compliance, and the future of enterprise PR operations
              </p>
            </div>
          </div>
        </section>

        {/* Blog Grid */}
        <section className="py-16 bg-background">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {blogPosts.map((post, index) => (
                <Link
                  key={post.slug}
                  to={`/blog/${post.slug}`}
                  className="group bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                        {post.category}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-primary group-hover:gap-3 transition-all">
                        Read More
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Blog;