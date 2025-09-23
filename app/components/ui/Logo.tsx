'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '@/app/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface LogoProps {
  /**
   * Whether to show the logo as a clickable link to home
   * @default true
   */
  linkToHome?: boolean;
  
  /**
   * Custom className for styling
   */
  className?: string;
  
  /**
   * Logo size preset
   * @default "default"
   */
  size?: 'sm' | 'default' | 'lg' | 'xl';
  
  /**
   * Whether to show the brand name text alongside the logo
   * @default true
   */
  showText?: boolean;
  
  /**
   * Custom alt text for the logo image
   * @default "Prediops Logo"
   */
  alt?: string;
  
  /**
   * Custom width and height (overrides size preset)
   */
  width?: number;
  height?: number;
}

const sizePresets = {
  sm: { width: 24, height: 24 },
  default: { width: 32, height: 32 },
  lg: { width: 48, height: 48 },
  xl: { width: 64, height: 64 },
};

export function Logo({
  linkToHome = true,
  className,
  size = 'default',
  showText = true,
  alt = 'Prediops Logo',
  width,
  height,
}: LogoProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Use custom dimensions if provided, otherwise use preset
  const logoDimensions = width && height 
    ? { width, height }
    : sizePresets[size];

  // Determine which logo variant to use
  const logoSrc = isDark 
    ? '/logo/logo-dark.svg' 
    : '/logo/logo.svg';

  const logoElement = (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="relative">
        <Image
          src={logoSrc}
          alt={alt}
          width={logoDimensions.width}
          height={logoDimensions.height}
          priority
          className="object-contain"
          onError={(e) => {
            // Fallback to PNG if SVG fails to load
            const target = e.target as HTMLImageElement;
            if (target.src.includes('.svg')) {
              target.src = isDark ? '/logo/logo-dark.png' : '/logo/logo.png';
            }
          }}
        />
      </div>
      {showText && (
        <span className={cn(
          'font-bold text-foreground',
          size === 'sm' && 'text-sm',
          size === 'default' && 'text-lg',
          size === 'lg' && 'text-xl',
          size === 'xl' && 'text-2xl'
        )}>
          Prediops
        </span>
      )}
    </div>
  );

  if (linkToHome) {
    return (
      <Link 
        href="/" 
        className="hover:opacity-80 transition-opacity"
        aria-label="Go to Prediops homepage"
      >
        {logoElement}
      </Link>
    );
  }

  return logoElement;
}

// Export variants for common use cases
export const LogoWithText = Logo;
export const LogoIcon = (props: Omit<LogoProps, 'showText'>) => (
  <Logo {...props} showText={false} />
);
export const LogoSidebar = (props: LogoProps) => (
  <Logo {...props} size="sm" showText={true} />
);

// Default export
export default Logo;
