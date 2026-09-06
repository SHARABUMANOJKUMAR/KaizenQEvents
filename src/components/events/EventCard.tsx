import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock } from 'lucide-react';
import type { Event } from '../../types';
import { Badge, StatusBadge, Button } from '../ui';
import { formatDateRange, truncate } from '../../utils';
import { cn } from '../../utils';

interface EventCardProps {
  event: Event;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = ({ event, className }) => {
  const navigate = useNavigate();

  const categoryColorMap: Record<string, 'blue' | 'red' | 'yellow' | 'green' | 'gray'> = {
    'Bootcamp': 'blue',
    'Workshop': 'green',
    'Tech Talk': 'yellow',
    'Conference': 'red',
    'Hackathon': 'red',
    'Career': 'green',
    'AI': 'blue',
    'Cloud': 'blue',
    'Git & Open Source': 'yellow',
    'All': 'gray',
  };

  const badgeColor = categoryColorMap[event.category] || 'blue';

  return (
    <article
      className={cn(
        'bg-white border border-[#E8EAED] rounded-xl overflow-hidden card-hover flex flex-col',
        className
      )}
      aria-label={`Event: ${event.title}`}
    >
      {/* Event image */}
      <div className="relative overflow-hidden aspect-[16/9]">
        <img
          src={event.imageUrl}
          alt={event.title}
          width="480"
          height="270"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
          decoding="async"
        />
        {/* Status badge on image */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={event.status} />
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Category & Duration */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge label={event.category} variant={badgeColor} />
          {event.id === 'evt-001' ? (
            <span className="text-[10px] font-bold bg-[#FFF8E1] text-[#B78103] px-2 py-0.5 rounded-md border border-[#FFE082]">
              3 Days Bootcamp
            </span>
          ) : (
            <span className="text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-md border border-[#C8E6C9]">
              5 Days Bootcamp
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-[#1A1A2E] leading-snug line-clamp-2">
          {event.title}
        </h3>

        {/* Short description */}
        <p className="text-sm text-[#5F6368] leading-relaxed line-clamp-2 flex-1">
          {truncate(event.shortDescription, 100)}
        </p>

        {/* Instructor info if available */}
        {event.speakers && event.speakers.length > 0 && (
          <div className="flex items-center gap-2 pt-1 border-t border-[#F1F3F4] text-xs">
            <span className="text-[#9AA0A6] font-medium">Instructor:</span>
            <span className="font-bold text-[#1A1A2E]">{event.speakers[0].name}</span>
          </div>
        )}

        {/* Meta info */}
        <div className="space-y-1.5 text-xs text-[#5F6368]">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="shrink-0 text-[#34A853]" />
            <span className="font-semibold text-[#2E7D32]">Online Live Workshop (Google Meet / Zoom)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="shrink-0 text-[#4285F4]" />
            <span className="font-medium text-[#1A1A2E]">{formatDateRange(event.date, event.endDate)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="shrink-0 text-[#EA4335]" />
            <span>Evening {event.time}{event.endTime ? ` – ${event.endTime}` : ''}</span>
          </div>
        </div>

        {/* CTA */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/events/${event.id}`)}
          id={`view-event-${event.id}`}
          className="mt-1 self-start"
        >
          View Event
        </Button>
      </div>
    </article>
  );
};
