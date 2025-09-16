import type { Team } from '@/schemas/team.schema';

/**
 * Generate a URL-friendly slug from a team object
 */
export function generateTeamSlug(team: Team): string {
  if (!team.name) return `team-${team.id}`;
  
  return team.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Parse a team slug back to team ID
 * This is a simple implementation - in production you might want to store slug mappings
 */
export function parseTeamSlug(slug: string): string | null {
  const match = slug.match(/^team-(\d+)$/);
  return match ? match[1] : null;
}

/**
 * Get team display name with short code if available
 */
export function getTeamDisplayName(team: Team): string {
  if (!team.name) return `Team ${team.id}`;
  
  if (team.short_code) {
    return `${team.name} (${team.short_code})`;
  }
  
  return team.name;
}

/**
 * Get team logo URL with fallback
 */
export function getTeamLogoUrl(team: Team): string | null {
  if (team.image_path) {
    return team.image_path;
  }
  
  // Fallback to a default team logo or generate one
  return null;
}

/**
 * Format team founded year
 */
export function formatFoundedYear(founded: number | null | undefined): string {
  if (!founded) return 'Unknown';
  
  const currentYear = new Date().getFullYear();
  const age = currentYear - founded;
  
  return `${founded} (${age} years old)`;
}

/**
 * Get team type display name
 */
export function getTeamTypeDisplay(type: string | null | undefined): string {
  if (!type) return 'Unknown';
  
  const typeMap: Record<string, string> = {
    'domestic': 'Domestic Club',
    'national': 'National Team',
    'club': 'Club',
    'team': 'Team',
  };
  
  return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
}
