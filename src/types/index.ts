// ============================================================
// KQE — TypeScript Interfaces
// All domain types are defined here centrally.
// ============================================================

export type EventCategory =
  | 'All'
  | 'Bootcamp'
  | 'Workshop'
  | 'Tech Talk'
  | 'Conference'
  | 'Hackathon'
  | 'Career'
  | 'AI'
  | 'Cloud'
  | 'Git & Open Source';

export type EventStatus = 'Open' | 'Closed' | 'Waitlist' | 'Coming Soon';
export type EventTab = 'upcoming' | 'past' | 'all';

export interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
  type?: 'break' | 'session' | 'keynote';
}

export interface Speaker {
  id: string;
  name: string;
  designation: string;
  company: string;
  bio: string;
  imageUrl: string;
  linkedin?: string;
  twitter?: string;
}

export interface OrganizerProfile {
  id: string;
  name: string;
  company: string;
  role: string;
  imageUrl: string;
  bio: string;
  linkedin?: string;
  twitter?: string;
}

export interface Partner {
  id: string;
  name: string;
  type: 'Community' | 'Tech' | 'Education' | 'Media' | 'Sponsor';
  logoUrl: string;
  website?: string;
}

export interface Venue {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  mapPlaceholder?: string;
}

export interface Discussion {
  id: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  message: string;
  timestamp: string;
  likes: number;
  replies: number;
}

export interface Event {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  date: string;          // ISO string
  endDate?: string;      // ISO string
  time: string;
  endTime?: string;
  city: string;
  state: string;
  imageUrl: string;
  bannerUrl: string;
  organizers: OrganizerProfile[];
  speakers: Speaker[];
  schedule: ScheduleItem[];
  partners: Partner[];
  venue: Venue;
  discussions: Discussion[];
  whatYoullLearn: string[];
  whatsIncluded: string[];
  tags: string[];
  registrationUrl?: string;
  maxAttendees?: number;
  currentAttendees?: number;
}

export interface Community {
  id: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  description: string;
  imageUrl: string;
  memberCount: number;
  eventCount: number;
  tags: string[];
}

export interface SearchFilters {
  query: string;
  category: EventCategory;
  location: string;
  dateRange: 'all' | 'this-week' | 'this-month' | 'next-month';
  status: EventStatus | 'All';
  tab: EventTab;
}
