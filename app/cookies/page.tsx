import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Cookie Policy - Prediops',
  description: 'How Prediops uses cookies and your choices to manage them.',
};

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>What Are Cookies?</CardTitle>
            <CardDescription>Small text files used to enhance your experience</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work efficiently, as well as
              to provide information to site owners. This policy explains how we use cookies and how you can control them.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Types of Cookies We Use</CardTitle>
            <CardDescription>Essential, performance, analytics, and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                Essential Cookies: required to operate the website (e.g., page navigation, secure areas). The site cannot function properly without these.
              </li>
              <li>
                Performance/Analytics Cookies: help us understand how visitors interact with our site so we can improve it (aggregated and anonymous when possible).
              </li>
              <li>
                Preference Cookies: remember your settings and choices (e.g., theme, display options).
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Managing Cookies</CardTitle>
            <CardDescription>Your controls and choices</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You can control and/or delete cookies as you wish. Most browsers allow you to refuse cookies or to delete them. Please note that blocking some
              types of cookies may impact your experience on our site and the services we are able to offer.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
              <li>Browser Controls: adjust cookie settings via your browser&apos;s privacy options.</li>
              <li>Opt-Outs: where available, use analytics opt-outs provided by third parties.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Third-Party Cookies</CardTitle>
            <CardDescription>Cookies set by other services</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may use third-party services (e.g., analytics, performance monitoring). These providers may set cookies in accordance with their own policies.
              We encourage you to review their privacy and cookie notices for more information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Changes to This Policy</CardTitle>
            <CardDescription>Updates when we change our use of cookies</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We may update this Cookie Policy from time to time to reflect changes to our practices or for operational, legal, or regulatory reasons. We will
              update the “Last updated” date above when changes are made.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>Questions about cookies on Prediops</CardDescription>
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
