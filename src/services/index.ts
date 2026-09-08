import type { Event, Community, OrganizerProfile, SearchFilters } from '../types';
import { events } from '../data/events';
import { communities } from '../data/communities';
import { organizers } from '../data/organizers';

// ============================================================
// eventService — Phase 1: Mock data. Phase 2: Replace with FastAPI calls.
// All methods return Promises so the API contract matches a real HTTP service.
// ============================================================
export const eventService = {
  getAll: (): Promise<Event[]> => {
    return Promise.resolve([...events]);
  },

  getById: (id: string): Promise<Event | undefined> => {
    return Promise.resolve(events.find((e) => e.id === id));
  },

  search: (filters: Partial<SearchFilters>): Promise<Event[]> => {
    const now = new Date();

    let result = [...events];

    // Tab filter
    if (filters.tab === 'upcoming') {
      result = result.filter((e) => new Date(e.date) >= now);
    } else if (filters.tab === 'past') {
      result = result.filter((e) => new Date(e.date) < now);
    }

    // Text query
    if (filters.query && filters.query.trim() !== '') {
      const q = filters.query.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q) ||
          e.state.toLowerCase().includes(q) ||
          e.shortDescription.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (filters.category && filters.category !== 'All') {
      result = result.filter((e) => e.category === filters.category);
    }

    // Location filter
    if (filters.location && filters.location.trim() !== '') {
      const loc = filters.location.toLowerCase();
      result = result.filter(
        (e) =>
          e.city.toLowerCase().includes(loc) ||
          e.state.toLowerCase().includes(loc)
      );
    }

    // Status filter
    if (filters.status && filters.status !== 'All') {
      result = result.filter((e) => e.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const msPerDay = 86400000;
      result = result.filter((e) => {
        const diff = new Date(e.date).getTime() - now.getTime();
        if (filters.dateRange === 'this-week') return diff >= 0 && diff <= 7 * msPerDay;
        if (filters.dateRange === 'this-month') return diff >= 0 && diff <= 30 * msPerDay;
        if (filters.dateRange === 'next-month') return diff > 30 * msPerDay && diff <= 60 * msPerDay;
        return true;
      });
    }

    return Promise.resolve(result);
  },
};

// ============================================================
// communityService
// ============================================================
export const communityService = {
  getAll: (): Promise<Community[]> => {
    return Promise.resolve([...communities]);
  },

  search: (query: string, stateFilter?: string): Promise<Community[]> => {
    let result = [...communities];
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.state.toLowerCase().includes(q)
      );
    }
    if (stateFilter && stateFilter !== 'All') {
      result = result.filter((c) => c.state === stateFilter);
    }
    return Promise.resolve(result);
  },
};

// ============================================================
// organizerService
// ============================================================
export const organizerService = {
  getAll: (): Promise<OrganizerProfile[]> => {
    return Promise.resolve([...organizers]);
  },

  getById: (id: string): Promise<OrganizerProfile | undefined> => {
    return Promise.resolve(organizers.find((o) => o.id === id));
  },
};

export * from './googleSheetsService';
