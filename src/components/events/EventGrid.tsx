import React, { memo } from 'react';
import type { Event, EventCategory } from '../../types';
import { EventCard } from './EventCard';
import { EventCardSkeleton, EmptyState } from '../ui';
import { Search } from 'lucide-react';

interface EventGridProps {
  events: Event[];
  loading?: boolean;
  skeletonCount?: number;
}

export const EventGrid: React.FC<EventGridProps> = memo(({
  events,
  loading = false,
  skeletonCount = 6,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <EmptyState
        icon={<Search size={40} strokeWidth={1.5} />}
        title="No events found"
        description="Try adjusting your search or filters to find events near you."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
});

EventGrid.displayName = 'EventGrid';

// ============================================================
// Category filter chips
// ============================================================
const CATEGORIES: EventCategory[] = [
  'All',
  'Bootcamp',
  'Workshop',
  'Tech Talk',
  'Conference',
  'Hackathon',
  'Career',
  'AI',
  'Cloud',
  'Git & Open Source',
];

interface CategoryFilterProps {
  value: EventCategory;
  onChange: (cat: EventCategory) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = memo(({ value, onChange }) => {
  return (
    <div
      className="flex gap-2 overflow-x-auto no-scrollbar pb-1"
      role="group"
      aria-label="Filter events by category"
    >
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={value === cat ? 'chip chip-active' : 'chip chip-default'}
          aria-pressed={value === cat}
          id={`cat-filter-${cat.replace(/\s+/g, '-').toLowerCase()}`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
});

CategoryFilter.displayName = 'CategoryFilter';
