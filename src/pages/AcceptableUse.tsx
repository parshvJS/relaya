import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

const AcceptableUse = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>Acceptable Use Policy - RELAYA | Platform Usage Guidelines</title>
        <meta name="description" content="RELAYA Acceptable Use Policy defines permitted and prohibited uses of our AI-powered PR platform to ensure responsible and ethical usage." />
        <link rel="canonical" href="https://relaya.com/acceptable-use" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://relaya.com/acceptable-use" />
        <meta property="og:title" content="Acceptable Use Policy - RELAYA" />
        <meta name="twitter:card" content="summary" />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <ScrollToTop />
      <Header />
      <main className="flex-1 bg-background">
        <div className="container max-w-4xl py-12 md:py-16">
          <h1 className="text-4xl font-bold mb-8">Acceptable Use Policy</h1>
          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="text-muted-foreground mb-6">
              <strong>Last Updated:</strong> January 24, 2026
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Purpose</h2>
              <p className="text-muted-foreground">
                This Acceptable Use Policy outlines prohibited uses of Relaya's services. By using our platform, you agree to comply with this policy and use our services responsibly and ethically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Prohibited Activities</h2>

              <h3 className="text-xl font-semibold mb-3">2.1 Illegal Activities</h3>
              <p className="text-muted-foreground mb-4">You must not use our services to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Engage in or promote illegal activities</li>
                <li>Violate any applicable local, state, national, or international law</li>
                <li>Infringe upon intellectual property rights of others</li>
                <li>Generate content that violates copyright, trademark, or patent laws</li>
                <li>Facilitate fraud, money laundering, or other financial crimes</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.2 Harmful Content</h3>
              <p className="text-muted-foreground mb-4">You must not generate or distribute content that:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Contains malware, viruses, or malicious code</li>
                <li>Promotes violence, terrorism, or hatred</li>
                <li>Contains explicit sexual content or child exploitation material</li>
                <li>Harasses, threatens, or intimidates individuals or groups</li>
                <li>Promotes self-harm or suicide</li>
                <li>Contains graphic violence or gore</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.3 Misleading Content</h3>
              <p className="text-muted-foreground mb-4">You must not create content that:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Is intentionally false, misleading, or deceptive</li>
                <li>Impersonates another person, entity, or brand</li>
                <li>Contains false claims about products or services</li>
                <li>Spreads misinformation or disinformation</li>
                <li>Manipulates stock prices or financial markets</li>
                <li>Creates fake reviews or testimonials</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.4 Discrimination and Hate Speech</h3>
              <p className="text-muted-foreground mb-4">You must not generate content that:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Promotes discrimination based on race, ethnicity, national origin, religion, disability, gender, age, or sexual orientation</li>
                <li>Contains hate speech or incites hatred against protected groups</li>
                <li>Advocates for violence against individuals or groups</li>
                <li>Promotes supremacist ideologies</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.5 Privacy Violations</h3>
              <p className="text-muted-foreground mb-4">You must not:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Share or distribute others' personal information without consent</li>
                <li>Violate privacy rights or data protection laws</li>
                <li>Engage in doxxing or harassment</li>
                <li>Access or attempt to access unauthorized data</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.6 Spam and Abuse</h3>
              <p className="text-muted-foreground mb-4">You must not:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Send unsolicited bulk communications (spam)</li>
                <li>Create fake accounts or engage in fraudulent activity</li>
                <li>Manipulate engagement metrics artificially</li>
                <li>Use our services for phishing or social engineering</li>
                <li>Overload or disrupt our systems through excessive requests</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.7 Security Violations</h3>
              <p className="text-muted-foreground mb-4">You must not:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Probe, scan, or test vulnerabilities of our systems</li>
                <li>Bypass security measures or authentication mechanisms</li>
                <li>Interfere with or disrupt our services or infrastructure</li>
                <li>Use automated tools without authorization</li>
                <li>Reverse engineer or decompile our software</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Content Responsibility</h2>
              <p className="text-muted-foreground mb-4">
                You are solely responsible for:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>All content you create, upload, or distribute using our services</li>
                <li>Verifying the accuracy and legality of generated content before publication</li>
                <li>Ensuring content complies with applicable laws and regulations</li>
                <li>Obtaining necessary permissions and licenses for content use</li>
                <li>Fact-checking AI-generated content for accuracy</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                <strong>Important:</strong> AI-generated content should always be reviewed and edited by humans before publication or distribution.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property</h2>
              <p className="text-muted-foreground mb-4">You must:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Respect intellectual property rights of others</li>
                <li>Obtain appropriate licenses for third-party content</li>
                <li>Not generate content that infringes on trademarks or copyrights</li>
                <li>Provide proper attribution when required</li>
                <li>Not claim AI-generated content as entirely your original work if representing it publicly</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Professional Standards</h2>
              <p className="text-muted-foreground mb-4">
                When using our services for professional purposes, you must:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Comply with industry standards and best practices</li>
                <li>Adhere to professional codes of ethics</li>
                <li>Follow applicable advertising and marketing regulations</li>
                <li>Disclose AI-generated content when required by law or professional standards</li>
                <li>Maintain truthfulness in public relations and marketing materials</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Monitoring and Enforcement</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Monitor use of our services for policy compliance</li>
                <li>Review content generated through our platform</li>
                <li>Investigate suspected violations</li>
                <li>Cooperate with law enforcement authorities</li>
                <li>Remove or disable access to content that violates this policy</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Consequences of Violations</h2>
              <p className="text-muted-foreground mb-4">
                Violations of this policy may result in:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Warning or notice of violation</li>
                <li>Temporary suspension of services</li>
                <li>Permanent termination of account</li>
                <li>Removal of content</li>
                <li>Legal action</li>
                <li>Reporting to law enforcement authorities</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                The severity of consequences depends on the nature and severity of the violation.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Reporting Violations</h2>
              <p className="text-muted-foreground mb-4">
                If you become aware of content or activity that violates this policy, please report it immediately by <Link to="/contact" className="text-primary hover:underline">contacting us</Link>. Include details about the violation and any relevant evidence or documentation in your report.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Appeals</h2>
              <p className="text-muted-foreground">
                If your account is suspended or terminated, you may appeal the decision by <Link to="/contact" className="text-primary hover:underline">contacting us</Link> with a detailed explanation and any supporting documentation. We will review appeals on a case-by-case basis.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Policy Updates</h2>
              <p className="text-muted-foreground">
                We may update this Acceptable Use Policy to address new risks, technologies, or legal requirements. Continued use of our services after updates constitutes acceptance of the revised policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about this Acceptable Use Policy, please <Link to="/contact" className="text-primary hover:underline">contact us</Link>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AcceptableUse;
