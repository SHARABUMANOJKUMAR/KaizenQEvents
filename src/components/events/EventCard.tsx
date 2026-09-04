import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock } from 'lucide-react';
import type { Event } from '../../types';
import { Badge, StatusBadge, Button } from '../ui';
import { formatShortDate, truncate } from '../../utils';
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
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
        {/* Status badge on image */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={event.status} />
        </div>
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Category */}
        <Badge label={event.category} variant={badgeColor} />

        {/* Title */}
        <h3 className="text-base font-bold text-[#1A1A2E] leading-snug line-clamp-2">
          {event.title}
        </h3>

        {/* Short description */}
        <p className="text-sm text-[#5F6368] leading-relaxed line-clamp-2 flex-1">
          {truncate(event.shortDescription, 100)}
        </p>

        {/* Meta info */}
        <div className="space-y-1.5 text-xs text-[#5F6368]">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="shrink-0 text-[#9AA0A6]" />
            <span>{event.city}, {event.state}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="shrink-0 text-[#9AA0A6]" />
            <span>{formatShortDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="shrink-0 text-[#9AA0A6]" />
            <span>{event.time}{event.endTime ? ` – ${event.endTime}` : ''}</span>
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
