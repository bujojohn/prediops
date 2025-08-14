'use client';

import { Button } from '@/components/ui/button';
import { Image, ImageOff } from 'lucide-react';
import { useDisplaySettings } from '@/app/contexts/DisplaySettingsContext';

export function DisplaySettingsToggle() {
  const { settings, toggleTeamImages } = useDisplaySettings();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTeamImages}
      className="flex items-center gap-2"
      title={settings.showTeamImages ? 'Hide team images' : 'Show team images'}
    >
      {settings.showTeamImages ? (
        <Image className="h-4 w-4" />
      ) : (
        <ImageOff className="h-4 w-4" />
      )}
      <span className="hidden sm:inline text-xs">
        {settings.showTeamImages ? 'Hide Images' : 'Show Images'}
      </span>
    </Button>
  );
}
