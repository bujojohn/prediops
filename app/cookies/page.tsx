import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Cookie, Settings, Info } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Cookie Policy - Prediops',
  description: 'Learn about how Prediops uses cookies and similar technologies.',
};

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              What Are Cookies?
            </CardTitle>
            <CardDescription>
              Understanding how we use cookies on our website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                This cookie policy page is under development. We will provide detailed information about the cookies we use and how you can manage them.
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>Cookies help us provide a better user experience</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Settings className="h-4 w-4" />
                <span>You can control cookie settings in your browser</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Types of Cookies We Use</CardTitle>
            <CardDescription>
              Essential, functional, and analytics cookies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-1">Essential Cookies</h4>
                <p className="text-sm text-muted-foreground">
                  Required for the website to function properly
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-1">Analytics Cookies</h4>
                <p className="text-sm text-muted-foreground">
                  Help us understand how visitors use our site
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium mb-1">Preference Cookies</h4>
                <p className="text-sm text-muted-foreground">
                  Remember your settings and preferences
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
            <CardDescription>
              Questions about our cookie policy?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              If you have any questions about our Cookie Policy, please contact us at{' '}
              <a href="mailto:contact@prediops.com" className="text-primary hover:underline">
                contact@prediops.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
