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
}

/**
 * TeamLink variant for fixture cards
 */
export function FixtureTeamLink({ 
  team, 
  children, 
  fixtureId, 
  className,
  onClick
}: {
  team: Team | Participant;
  children: React.ReactNode;
  fixtureId?: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <TeamLink
      team={team}
      variant="fixture-context"
      fixtureId={fixtureId}
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
