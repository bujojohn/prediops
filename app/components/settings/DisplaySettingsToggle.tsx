'use client';

import { Button } from '@/components/ui/button';
import { Image as ImageIcon, ImageOff as ImageOffIcon, Info, X } from 'lucide-react';
import { useDisplaySettings } from '@/app/contexts/DisplaySettingsContext';

export function DisplaySettingsToggle() {
  const { settings, toggleTeamImages, toggleValueBetExplanations } = useDisplaySettings();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-1">
      {/* Team Images Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTeamImages}
        className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-center"
        title={settings.showTeamImages ? 'Hide team images' : 'Show team images'}
      >
        {settings.showTeamImages ? (
          <ImageIcon aria-hidden className="h-4 w-4" />
        ) : (
          <ImageOffIcon aria-hidden className="h-4 w-4" />
        )}
        <span className="text-xs">
          {settings.showTeamImages ? 'Hide Images' : 'Show Images'}
        </span>
      </Button>

      {/* ValueBet Explanations Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleValueBetExplanations}
        className="flex items-center gap-2 w-full sm:w-auto justify-start sm:justify-center"
        title={settings.showValueBetExplanations ? 'Hide detailed ValueBet explanations' : 'Show detailed ValueBet explanations'}
      >
        {settings.showValueBetExplanations ? (
          <Info aria-hidden className="h-4 w-4" />
        ) : (
          <X aria-hidden className="h-4 w-4" />
        )}
        <span className="text-xs">
          {settings.showValueBetExplanations ? 'Hide Details' : 'Show Details'}
        </span>
      </Button>
    </div>
  );
}
