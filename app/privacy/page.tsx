import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Privacy Policy - Prediops',
  description: 'How Prediops collects, uses, discloses, and protects personal data, and what rights you have.',
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>
              This Privacy Policy explains how we process your personal data when you use Prediops.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Prediops provides sports predictions, analytics, and related content. This policy describes what information we collect, how we use it,
              who we share it with, and the choices you have. If you do not agree with this policy, please do not use our services.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Information We Collect</CardTitle>
            <CardDescription>The types of data we process</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                Account Information: name, email address, authentication identifiers, and settings you configure.
              </li>
              <li>
                Usage Data: pages viewed, links clicked, search queries, time on page, and interactions with features.
              </li>
              <li>
                Device and Technical Data: IP address, browser type, operating system, device identifiers, and approximate location (derived from IP).
              </li>
              <li>
                Cookies and Similar Technologies: data stored on your device to remember preferences and improve performance. See our Cookie Policy.
              </li>
              <li>
                Communication Data: messages you send to us, support inquiries, and feedback.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How We Use Your Information</CardTitle>
            <CardDescription>Legitimate purposes for processing</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide, maintain, and improve our services and features.</li>
              <li>Personalize content, including leagues, teams, and recommendations.</li>
              <li>Monitor performance, detect security incidents, and prevent abuse.</li>
              <li>Communicate with you about updates, security notices, and support.</li>
              <li>Comply with legal obligations and enforce our Terms of Service.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Legal Bases (EEA/UK users)</CardTitle>
            <CardDescription>Our grounds for processing personal data</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Performance of a contract: to provide requested services.</li>
              <li>Legitimate interests: to improve our services and ensure security.</li>
              <li>Consent: for optional cookies/analytics and marketing where required.</li>
              <li>Legal obligation: to comply with applicable laws.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sharing and Disclosure</CardTitle>
            <CardDescription>When we share data</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                Service Providers: analytics, hosting, and infrastructure partners who process data on our behalf under contractual safeguards.
              </li>
              <li>
                Legal and Safety: to comply with law, protect rights, or respond to lawful requests.
              </li>
              <li>
                Business Transfers: as part of a merger, acquisition, or asset sale, subject to this policy or equivalent protections.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>International Transfers</CardTitle>
            <CardDescription>Protecting data across borders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If your data is transferred internationally, we use appropriate safeguards such as standard contractual clauses, and require recipients to
              implement adequate security measures in accordance with applicable law.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
            <CardDescription>How long we keep information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We retain personal data only as long as necessary to provide the services, for legitimate business needs (e.g., security, fraud prevention),
              and to comply with legal obligations. When no longer needed, we securely delete or anonymize the information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Rights</CardTitle>
            <CardDescription>Choices and controls over your data</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Access, correction, deletion, and portability of your personal data.</li>
              <li>Withdraw consent for processing where consent was the basis.</li>
              <li>Object to or restrict processing in certain circumstances.</li>
              <li>Lodge a complaint with a supervisory authority (EEA/UK users).</li>
            </ul>
            <p className="text-muted-foreground mt-3">
              To exercise your rights, contact us at <a className="text-primary hover:underline" href="mailto:contact@prediops.com">contact@prediops.com</a>.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Safeguarding your information</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We employ administrative, technical, and organizational measures designed to protect personal data; however, no method of transmission or
              storage is completely secure, and we cannot guarantee absolute security.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Children&apos;s Privacy</CardTitle>
            <CardDescription>Underage users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Prediops is not directed to individuals under the age of 16 (or the age of digital consent in your jurisdiction). We do not knowingly
              collect personal data from children. If you believe a child has provided personal data, please contact us.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to This Policy</CardTitle>
            <CardDescription>How we update privacy terms</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will revise the “Last updated” date above and, when appropriate, provide additional notice.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>Questions or requests</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Email: <a className="text-primary hover:underline" href="mailto:contact@prediops.com">contact@prediops.com</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
