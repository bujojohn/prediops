'use client';

import { Logo, LogoIcon, LogoSidebar } from '@/components/ui/Logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LogoDemo() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Prediops Logo Showcase</h1>
        <p className="text-muted-foreground">Demonstrating the brand logo implementation across different sizes and contexts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Size Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Size Variants</CardTitle>
            <CardDescription>Different logo sizes for various contexts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Small (24px)</span>
              <Logo size="sm" showText={true} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Default (32px)</span>
              <Logo size="default" showText={true} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Large (48px)</span>
              <Logo size="lg" showText={true} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Extra Large (64px)</span>
              <Logo size="xl" showText={true} />
            </div>
          </CardContent>
        </Card>

        {/* Icon Only */}
        <Card>
          <CardHeader>
            <CardTitle>Icon Only</CardTitle>
            <CardDescription>Logo without text for compact spaces</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Small Icon</span>
              <LogoIcon size="sm" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Default Icon</span>
              <LogoIcon size="default" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Large Icon</span>
              <LogoIcon size="lg" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">XL Icon</span>
              <LogoIcon size="xl" />
            </div>
          </CardContent>
        </Card>

        {/* Context Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Context Usage</CardTitle>
            <CardDescription>Pre-built variants for specific contexts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">Sidebar Variant</span>
              <LogoSidebar />
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Navigation Bar</span>
              <Logo size="default" showText={true} />
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Compact Space</span>
              <LogoIcon size="sm" />
            </div>
          </CardContent>
        </Card>

        {/* Custom Dimensions */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Dimensions</CardTitle>
            <CardDescription>Logo with custom width and height</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">40x40px</span>
              <Logo width={40} height={40} showText={true} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">56x56px</span>
              <Logo width={56} height={56} showText={true} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">80x80px</span>
              <Logo width={80} height={80} showText={true} />
            </div>
          </CardContent>
        </Card>

        {/* Non-clickable */}
        <Card>
          <CardHeader>
            <CardTitle>Non-clickable</CardTitle>
            <CardDescription>Logo without link functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">Default (clickable)</span>
              <Logo size="default" showText={true} />
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Non-clickable</span>
              <Logo size="default" showText={true} linkToHome={false} />
            </div>
          </CardContent>
        </Card>

        {/* Theme Demo */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Support</CardTitle>
            <CardDescription>Automatic light/dark theme adaptation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <span className="text-sm font-medium">Current Theme</span>
              <Logo size="default" showText={true} />
            </div>
            <p className="text-xs text-muted-foreground">
              The logo automatically adapts to your current theme setting.
              Toggle between light and dark mode to see the difference.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Guide</CardTitle>
          <CardDescription>How to use the Logo component in your code</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Basic Usage</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`import { Logo } from '@/components/ui/Logo';

<Logo size="default" showText={true} />`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Icon Only</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`import { LogoIcon } from '@/components/ui/Logo';

<LogoIcon size="sm" />`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Custom Dimensions</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`<Logo 
  width={48} 
  height={48} 
  showText={false}
  linkToHome={false}
/>`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
