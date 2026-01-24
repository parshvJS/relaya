import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1 bg-background">
        <div className="container max-w-4xl py-12 md:py-16">
          <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-muted-foreground mb-6">
              <strong>Last Updated:</strong> January 24, 2026
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. What Are Cookies</h2>
              <p className="text-muted-foreground">
                Cookies are small text files stored on your device when you visit our website. They help us provide you with a better experience by remembering your preferences, analyzing how you use our services, and enabling certain features.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. How We Use Cookies</h2>
              <p className="text-muted-foreground mb-4">We use cookies for the following purposes:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Essential Cookies:</strong> Required for the website to function properly, including authentication and security</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
                <li><strong>Performance Cookies:</strong> Measure and improve website performance</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Types of Cookies We Use</h2>

              <h3 className="text-xl font-semibold mb-3">3.1 Essential Cookies</h3>
              <p className="text-muted-foreground mb-4">
                These cookies are necessary for our website to function. They enable core functionality such as security, network management, and accessibility.
              </p>
              <div className="bg-muted p-4 rounded-lg mb-6">
                <table className="w-full text-sm text-muted-foreground">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2">Cookie Name</th>
                      <th className="text-left py-2">Purpose</th>
                      <th className="text-left py-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2">session_id</td>
                      <td className="py-2">Maintains user session</td>
                      <td className="py-2">Session</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">auth_token</td>
                      <td className="py-2">Authentication</td>
                      <td className="py-2">7 days</td>
                    </tr>
                    <tr>
                      <td className="py-2">csrf_token</td>
                      <td className="py-2">Security protection</td>
                      <td className="py-2">Session</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold mb-3">3.2 Functional Cookies</h3>
              <p className="text-muted-foreground mb-4">
                These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
              </p>
              <div className="bg-muted p-4 rounded-lg mb-6">
                <table className="w-full text-sm text-muted-foreground">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2">Cookie Name</th>
                      <th className="text-left py-2">Purpose</th>
                      <th className="text-left py-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2">user_preferences</td>
                      <td className="py-2">Stores user settings</td>
                      <td className="py-2">1 year</td>
                    </tr>
                    <tr>
                      <td className="py-2">theme</td>
                      <td className="py-2">Dark/light mode preference</td>
                      <td className="py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold mb-3">3.3 Analytics Cookies</h3>
              <p className="text-muted-foreground mb-4">
                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.
              </p>
              <div className="bg-muted p-4 rounded-lg mb-6">
                <table className="w-full text-sm text-muted-foreground">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2">Cookie Name</th>
                      <th className="text-left py-2">Purpose</th>
                      <th className="text-left py-2">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2">_ga</td>
                      <td className="py-2">Google Analytics tracking</td>
                      <td className="py-2">2 years</td>
                    </tr>
                    <tr>
                      <td className="py-2">analytics_id</td>
                      <td className="py-2">Anonymous usage tracking</td>
                      <td className="py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold mb-3">3.4 Performance Cookies</h3>
              <p className="text-muted-foreground mb-4">
                These cookies allow us to monitor and improve website performance by tracking page load times and user interactions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Third-Party Cookies</h2>
              <p className="text-muted-foreground mb-4">
                We may use third-party services that set cookies on your device. These include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Google Analytics:</strong> For website analytics and usage statistics</li>
                <li><strong>Payment Processors:</strong> For secure payment processing (e.g., Stripe)</li>
                <li><strong>Authentication Services:</strong> For secure user authentication (e.g., Supabase)</li>
                <li><strong>CDN Providers:</strong> For content delivery and performance optimization</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                These third parties have their own privacy policies governing their use of cookies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Cookie Duration</h2>
              <p className="text-muted-foreground mb-4">Cookies may be:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Session Cookies:</strong> Temporary cookies deleted when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> Remain on your device for a specified period or until manually deleted</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Managing Cookies</h2>
              <p className="text-muted-foreground mb-4">
                You can control and manage cookies through your browser settings. Most browsers allow you to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>View cookies stored on your device</li>
                <li>Delete all or specific cookies</li>
                <li>Block third-party cookies</li>
                <li>Block all cookies from specific websites</li>
                <li>Delete all cookies when closing your browser</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Browser-Specific Instructions</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li><strong>Chrome:</strong> Settings &gt; Privacy and security &gt; Cookies and other site data</li>
                <li><strong>Firefox:</strong> Options &gt; Privacy & Security &gt; Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data</li>
                <li><strong>Edge:</strong> Settings &gt; Cookies and site permissions &gt; Cookies and site data</li>
              </ul>

              <p className="text-muted-foreground mt-4">
                <strong>Note:</strong> Blocking or deleting cookies may affect website functionality and your user experience.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Do Not Track</h2>
              <p className="text-muted-foreground">
                Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want your online activity tracked. We currently do not respond to DNT signals, but we respect your privacy choices through our cookie management options.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Changes to Cookie Policy</h2>
              <p className="text-muted-foreground">
                We may update this Cookie Policy periodically to reflect changes in our practices or for legal, operational, or regulatory reasons. Check this page regularly for updates.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have questions about our use of cookies, please contact us at:
              </p>
              <div className="mt-4 text-muted-foreground">
                <p>Email: privacy@relaya.com</p>
                <p>Address: [Your Business Address]</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CookiePolicy;
