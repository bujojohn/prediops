import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Terms of Service - Prediops',
  description: 'The rules and conditions governing the use of Prediops services.',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Acceptance of Terms</CardTitle>
            <CardDescription>Binding agreement between you and Prediops</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              By accessing or using Prediops, you agree to be bound by these Terms. If you do not agree, do not use our services. If you are using
              our services on behalf of an organization, you represent that you have authority to bind that organization to these Terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services and Content</CardTitle>
            <CardDescription>Informational nature of predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Prediops provides sports predictions, analytics, and related information for informational and entertainment purposes only. We do not
              guarantee accuracy or outcomes, and we are not responsible for financial decisions or losses based on our content.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Responsibilities</CardTitle>
            <CardDescription>Acceptable use requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Do not misuse, interfere with, or disrupt the services.</li>
              <li>Do not attempt to access data or systems without authorization.</li>
              <li>Do not reverse-engineer, copy, or redistribute content without permission.</li>
              <li>Comply with applicable laws and regulations in your jurisdiction.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accounts and Security</CardTitle>
            <CardDescription>Keeping your account safe</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us
              immediately of any unauthorized use or security incident.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscriptions and Payments</CardTitle>
            <CardDescription>Billing, renewals, and refunds</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If we offer paid features, billing will be handled through our payment provider. Prices, renewal terms, and refund policies will be
              disclosed at purchase. Taxes may apply based on your location.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Third-Party Services</CardTitle>
            <CardDescription>Links and integrations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our services may link to or integrate with third-party websites and services. We do not control and are not responsible for third-party
              content, policies, or practices.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intellectual Property</CardTitle>
            <CardDescription>Ownership of content and licenses</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Prediops and its licensors own all rights to the platform, including trademarks, logos, and content. You may use the services only as
              permitted by these Terms. No rights are granted except as expressly stated.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disclaimers and Limitation of Liability</CardTitle>
            <CardDescription>Important legal limitations</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The services are provided &quot;as is&quot; without warranties of any kind. To the maximum extent permitted by law, Prediops and its affiliates shall not
              be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, data, or goodwill.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indemnification</CardTitle>
            <CardDescription>Your responsibility for misuse</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You agree to indemnify and hold harmless Prediops, its affiliates, and personnel from any claims, liabilities, damages, losses, and expenses,
              including legal fees, arising from your use of the services or violation of these Terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Termination</CardTitle>
            <CardDescription>Ending or suspending access</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may suspend or terminate access to the services at any time if you violate these Terms or for operational/security reasons. Upon termination,
              your right to use the services will cease immediately.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Governing Law</CardTitle>
            <CardDescription>Jurisdiction and venue</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              These Terms shall be governed by and construed in accordance with the laws applicable in your jurisdiction of residence, without regard to
              conflict-of-law principles. Venue for disputes shall be as required by applicable law.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to These Terms</CardTitle>
            <CardDescription>When we update our terms</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may update these Terms from time to time. We will revise the “Last updated” date above and, where required, provide additional notice.
              Your continued use of the services after changes become effective constitutes acceptance of the updated Terms.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>Questions about these Terms</CardDescription>
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
