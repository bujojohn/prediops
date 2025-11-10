'use client';

import type { JSX } from 'react';
import { Circle, Goal, Square, UserMinus, UserPlus } from 'lucide-react';
import type { Participant } from '@/schemas/participant.schema';
import type { PlayerEvent } from '@/schemas/player-events.schema';

interface FixtureTimelineProps {
  events: PlayerEvent[];
  participants?: Participant[] | null;
}

export function FixtureTimeline({ events, participants }: FixtureTimelineProps): JSX.Element {
  // Sort events by minute and period
  const sortedEvents = [...events].sort((a, b) => {
    const aMinute = a.minute || 0;
    const bMinute = b.minute || 0;
    const aPeriod = a.period?.sort_order || 0;
    const bPeriod = b.period?.sort_order || 0;
    
    if (aPeriod !== bPeriod) return aPeriod - bPeriod;
    return aMinute - bMinute;
  });

  const getEventIcon = (event: PlayerEvent) => {
    const typeName = event.type?.name?.toLowerCase() || '';
    
    if (typeName.includes('goal')) return <Goal className="h-5 w-5 text-green-600" />;
    if (typeName.includes('yellow') && typeName.includes('card')) return <Square className="h-5 w-5 text-yellow-500" />;
    if (typeName.includes('red') && typeName.includes('card')) return <Square className="h-5 w-5 text-red-600" />;
    if (typeName.includes('substitution')) {
      return event.type?.name?.toLowerCase().includes('in') 
        ? <UserPlus className="h-5 w-5 text-blue-500" />
        : <UserMinus className="h-5 w-5 text-gray-500" />;
    }
    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  const getEventColor = (event: PlayerEvent) => {
    const typeName = event.type?.name?.toLowerCase() || '';
    if (typeName.includes('goal')) return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    if (typeName.includes('yellow') && typeName.includes('card')) return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    if (typeName.includes('red') && typeName.includes('card')) return 'border-red-500 bg-red-50 dark:bg-red-900/20';
    return 'border-gray-300 bg-gray-50 dark:bg-gray-800';
  };

  const getParticipantName = (participantId?: number) => {
    if (!participantId || !participants) return null;
    return participants.find(p => p.id === participantId)?.name || null;
  };

  if (sortedEvents.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Match Timeline</h3>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No events available yet
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Match Timeline</h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
        
        {/* Events */}
        <div className="space-y-4">
          {sortedEvents.map((event, index) => {
            const participantName = event.participant_id 
              ? getParticipantName(event.participant_id)
              : null;
            const playerName = event.player?.name || 'Unknown Player';
            const periodName = event.period?.description || `${event.minute}'`;
            
            return (
              <div key={`${event.id}-${index}`} className="relative flex items-start gap-4">
                {/* Time/Minute */}
                <div className="flex-shrink-0 w-16 text-right text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {periodName}
                </div>
                
                {/* Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white dark:bg-gray-800 ${getEventColor(event)}`}>
                  {getEventIcon(event)}
                </div>
                
                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {event.type?.name || 'Event'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {playerName}
                    {participantName && ` • ${participantName}`}
                  </div>
                  {event.result && (
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {event.result}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


