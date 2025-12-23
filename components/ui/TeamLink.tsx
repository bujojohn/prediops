'use client';

import Link from 'next/link';
import type { Team } from '@/schemas/team.schema';
import type { Participant } from '@/schemas/participant.schema';
import { generateTeamUrl, generateTeamFixtureUrl, getLinkTarget, getLinkRel } from '@/lib/utils/routing';
import { cn } from '@/lib/utils';

interface TeamLinkProps {
  team: Team | Participant;
  children: React.ReactNode;
  variant?: 'default' | 'fixture-context';
  fixtureId?: string;
  className?: string;
  openInNewTab?: boolean;
  onClick?: () => void;
}

export function TeamLink({ 
  team, 
  children, 
  variant = 'default', 
  fixtureId, 
  className,
  openInNewTab = true,
  onClick
}: TeamLinkProps) {
  try {
    const url = variant === 'fixture-context' 
      ? generateTeamFixtureUrl(team, fixtureId)
      : generateTeamUrl(team);
      
    const target = getLinkTarget(url, openInNewTab);
    const rel = getLinkRel(url, openInNewTab);

    return (
      <Link 
        href={url} 
        target={target}
        rel={rel}
        prefetch={false}
        legacyBehavior={false}
        className={cn(
          "hover:text-primary transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm",
          className
        )}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  } catch (error) {
    console.error('TeamLink - Error generating team URL:', error, { team, variant, fixtureId });
    // Fallback: render as span if URL generation fails
    return (
      <span className={className}>
        {children}
      </span>
    );
  }
}

/**
 * TeamLink variant for fixture cards
 * Links to team overview page instead of fixtures page
 */
export function FixtureTeamLink({ 
  team, 
  children, 
  fixtureId: _fixtureId, // eslint-disable-line @typescript-eslint/no-unused-vars
  className,
  onClick
}: {
  team: Team | Participant;
  children: React.ReactNode;
  fixtureId?: string;
  className?: string;
  onClick?: () => void;
}) {
  // Use default variant (team overview) instead of fixture-context
  // This will generate URLs like /team/1128/ado-den-haag/#overview
  // Note: fixtureId is kept in props for API compatibility but not used
  return (
    <TeamLink
      team={team}
      variant="default"
      className={className}
      onClick={onClick}
    >
      {children}
    </TeamLink>
  );
}

/**
 * TeamLink variant for navigation menus
 */
export function NavigationTeamLink({ 
  team, 
  children, 
  className,
  onClick
}: {
  team: Team | Participant;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <TeamLink
      team={team}
      variant="default"
      className={cn("font-medium", className)}
      openInNewTab={false}
      onClick={onClick}
    >
      {children}
    </TeamLink>
  );
}
