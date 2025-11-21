'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { generateBreadcrumbs } from '@/lib/utils/breadcrumb-utils';
import { cn } from '@/lib/utils';

/**
 * Global breadcrumb navigation component
 * Displays hierarchical navigation path below the main navigation bar
 */
export function Breadcrumb() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  // Don't show breadcrumbs on home page (or if only one item)
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav
      className="bg-background/50 backdrop-blur-sm border-b border-border/60"
      aria-label="Breadcrumb"
    >
      <div className="container mx-auto px-6">
        <ol className="flex items-center gap-1 py-2 text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const isFirst = index === 0;

            return (
              <li
                key={crumb.href}
                className="flex items-center gap-1"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {!isFirst && (
                  <ChevronRight
                    className="h-4 w-4 text-muted-foreground flex-shrink-0"
                    aria-hidden="true"
                  />
                )}
                {isLast ? (
                  <span
                    className={cn(
                      "font-medium text-foreground truncate max-w-[200px]",
                      "md:max-w-none"
                    )}
                    itemProp="name"
                    aria-current="page"
                  >
                    {isFirst && <Home className="h-3.5 w-3.5 inline-block mr-1" />}
                    {!isFirst && crumb.label}
                    {isFirst && 'Home'}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    className={cn(
                      "text-muted-foreground hover:text-foreground transition-colors truncate max-w-[200px]",
                      "md:max-w-none",
                      "flex items-center gap-1"
                    )}
                    itemProp="item"
                  >
                    <meta itemProp="position" content={String(index + 1)} />
                    {isFirst ? (
                      <>
                        <Home className="h-3.5 w-3.5" />
                        <span itemProp="name">{crumb.label}</span>
                      </>
                    ) : (
                      <span itemProp="name">{crumb.label}</span>
                    )}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

