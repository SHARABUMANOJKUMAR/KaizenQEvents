import React, { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { eventService } from '../services';
import type { Event, EventCategory, EventStatus, EventTab } from '../types';
import { Input, Button } from '../components/ui';
import { EventGrid, CategoryFilter } from '../components/events/EventGrid';
import { cn } from '../utils';
import { SEO } from '../components/SEO';

const TABS: { id: EventTab; label: string }[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
  { id: 'all', label: 'All Events' },
];

const LOCATION_OPTIONS = [
  'All Locations',
  'Andhra Pradesh',
  'Telangana',
  'Karnataka',
  'Tamil Nadu',
  'Kerala',
  'Maharashtra',
];

const DATE_OPTIONS = [
  { value: 'all', label: 'Any Date' },
  { value: 'this-week', label: 'This Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'next-month', label: 'Next Month' },
];

const STATUS_OPTIONS: Array<EventStatus | 'All'> = ['All', 'Open', 'Waitlist', 'Closed', 'Coming Soon'];

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<EventCategory>('All');
  const [location, setLocation] = useState('All Locations');
  const [dateRange, setDateRange] = useState<'all' | 'this-week' | 'this-month' | 'next-month'>('all');
  const [status, setStatus] = useState<EventStatus | 'All'>('All');
  const [tab, setTab] = useState<EventTab>('upcoming');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const fetchEvents = useCallback(() => {
    setLoading(true);
    setPage(1);
    eventService
      .search({
        query,
        category,
        location: location === 'All Locations' ? '' : location,
        dateRange,
        status,
        tab,
      })
      .then((result) => {
        setEvents(result);
        setLoading(false);
      });
  }, [query, category, location, dateRange, status, tab]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const clearFilters = () => {
    setQuery('');
    setCategory('All');
    setLocation('All Locations');
    setDateRange('all');
    setStatus('All');
  };

  const hasFilters =
    query || category !== 'All' || location !== 'All Locations' || dateRange !== 'all' || status !== 'All';

  const paginatedEvents = events.slice(0, page * PER_PAGE);
  const hasMore = paginatedEvents.length < events.length;

  return (
    <div className="fade-in min-h-screen bg-white">
      <SEO 
        title="Upcoming Technology Events, Hackathons & Workshops | Kaizen Q Events"
        description="Discover upcoming technology events, coding competitions, hackathons, and developer workshops. Register today and join the Kaizen Q Events tech community."
        canonical="/events"
      />
      {/* Page header */}
      <div className="bg-[#F8F9FA] border-b border-[#E8EAED] py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A2E] mb-2">Explore Events</h1>
          <p className="text-[#5F6368] text-base">Discover technology events, bootcamps and workshops near you.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Search row */}
        <div className="flex gap-3">
          <Input
            id="events-search"
            type="search"
            placeholder="Search events, categories, cities…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftIcon={<Search size={18} />}
            className="py-3 text-base"
          />
          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="md"
            leftIcon={<SlidersHorizontal size={16} />}
            onClick={() => setShowFilters(!showFilters)}
            id="toggle-filters-btn"
            className="shrink-0"
          >
            <span className="hidden sm:inline">Filters</span>
            {hasFilters && (
              <span className="w-2 h-2 bg-[#EA4335] rounded-full" />
            )}
          </Button>
        </div>

        {/* Category chips */}
        <CategoryFilter value={category} onChange={setCategory} />

        {/* Advanced filters panel */}
        {showFilters && (
          <div className="bg-[#F8F9FA] border border-[#E8EAED] rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-[#5F6368] mb-2 uppercase tracking-wide">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-[#E8EAED] bg-white py-2.5 px-3 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                id="filter-location"
              >
                {LOCATION_OPTIONS.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-[#5F6368] mb-2 uppercase tracking-wide">
                Date
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                className="w-full rounded-lg border border-[#E8EAED] bg-white py-2.5 px-3 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                id="filter-date"
              >
                {DATE_OPTIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-[#5F6368] mb-2 uppercase tracking-wide">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as typeof status)}
                className="w-full rounded-lg border border-[#E8EAED] bg-white py-2.5 px-3 text-sm text-[#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#4285F4]"
                id="filter-status"
              >
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            {hasFilters && (
              <div className="sm:col-span-3">
                <Button variant="ghost" size="sm" leftIcon={<X size={14} />} onClick={clearFilters} id="clear-filters-btn">
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#E8EAED]" role="tablist" aria-label="Event time filter">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-all',
                tab === t.id
                  ? 'text-[#4285F4] border-[#4285F4]'
                  : 'text-[#5F6368] border-transparent hover:text-[#1A1A2E]'
              )}
              id={`tab-${t.id}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-[#5F6368]">
            {events.length === 0 ? 'No events found' : `${events.length} event${events.length !== 1 ? 's' : ''} found`}
          </p>
        )}

        {/* Grid */}
        <EventGrid events={paginatedEvents} loading={loading} />

        {/* Load more */}
        {hasMore && !loading && (
          <div className="flex justify-center pt-4">
            <Button variant="outline" size="md" onClick={() => setPage((p) => p + 1)} id="load-more-btn">
              Load More Events
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
