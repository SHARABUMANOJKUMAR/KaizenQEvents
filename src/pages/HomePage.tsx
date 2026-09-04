import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, ArrowRight, Users, Zap, Heart, TrendingUp,
  ChevronRight, Globe
} from 'lucide-react';
import { Button, SectionHeader, Input, EmptyState } from '../components/ui';
import { EventGrid, CategoryFilter } from '../components/events/EventGrid';
import { CommunityCard } from '../components/community/CommunityCard';
import { eventService, communityService } from '../services';
import type { Event, Community, EventCategory } from '../types';
import { cn } from '../utils';

// ============================================================
// HERO SECTION
// ============================================================
const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-28" aria-label="Hero">
      {/* Dot pattern background */}
      <div className="absolute inset-0 hero-dots opacity-60 pointer-events-none" />

      {/* Decorative color blobs */}
      <div className="absolute top-16 right-[10%] w-72 h-72 rounded-full bg-[#4285F4]/8 blur-3xl pointer-events-none" />
      <div className="absolute bottom-8 left-[5%] w-56 h-56 rounded-full bg-[#34A853]/8 blur-3xl pointer-events-none" />
      <div className="absolute top-8 left-[15%] w-40 h-40 rounded-full bg-[#FBBC04]/10 blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl">
          {/* KQE pill badge */}
          <div className="inline-flex items-center gap-2 bg-[#EBF3FF] text-[#4285F4] text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <span className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-[#4285F4]" />
              <span className="w-2 h-2 rounded-full bg-[#EA4335]" />
              <span className="w-2 h-2 rounded-full bg-[#FBBC04]" />
              <span className="w-2 h-2 rounded-full bg-[#34A853]" />
            </span>
            Kaizen Q Events — Technology Community Platform
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#1A1A2E] leading-tight tracking-tight mb-6">
            Connect.{' '}
            <span className="text-[#4285F4]">Learn.</span>{' '}
            <br className="hidden sm:block" />
            Build.{' '}
            <span className="text-[#34A853]">Grow.</span>
          </h1>

          {/* Supporting text */}
          <p className="text-lg sm:text-xl text-[#5F6368] leading-relaxed mb-8 max-w-2xl">
            Discover technology events, bootcamps, workshops and communities powered by Kaizen Q Events. Join thousands of developers, students and tech enthusiasts across India.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/events')}
              rightIcon={<ArrowRight size={18} />}
              id="hero-explore-events"
            >
              Explore Events
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/login')}
              id="hero-join-kqe"
            >
              Join KQE
            </Button>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-6 mt-10 pt-8 border-t border-[#E8EAED]">
            {[
              { value: '6,000+', label: 'Community Members' },
              { value: '120+', label: 'Events Hosted' },
              { value: '12+', label: 'Cities' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-extrabold text-[#1A1A2E]">{stat.value}</p>
                <p className="text-sm text-[#5F6368]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================
// EVENT DISCOVERY SECTION
// ============================================================
interface EventDiscoverySectionProps {
  onSearch: (q: string) => void;
  onCategoryChange: (cat: EventCategory) => void;
  category: EventCategory;
  query: string;
}

const EventDiscoverySection: React.FC<EventDiscoverySectionProps> = ({
  onSearch, onCategoryChange, category, query,
}) => {
  return (
    <section className="bg-[#F8F9FA] py-10 sm:py-14 border-y border-[#E8EAED]" aria-label="Event discovery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E]">Find an event near you</h2>

        <Input
          id="home-event-search"
          type="search"
          placeholder="Search for a city, state, or event"
          value={query}
          onChange={(e) => onSearch(e.target.value)}
          leftIcon={<Search size={18} />}
          className="max-w-xl py-3 text-base"
        />

        <CategoryFilter value={category} onChange={onCategoryChange} />
      </div>
    </section>
  );
};

// ============================================================
// LOCATION SECTION
// ============================================================
const LOCATIONS = [
  { name: 'Andhra Pradesh', code: 'AP', count: 12 },
  { name: 'Telangana', code: 'TG', count: 21 },
  { name: 'Karnataka', code: 'KA', count: 34 },
  { name: 'Tamil Nadu', code: 'TN', count: 18 },
  { name: 'Kerala', code: 'KL', count: 14 },
  { name: 'Maharashtra', code: 'MH', count: 22 },
  { name: 'Delhi', code: 'DL', count: 16 },
  { name: 'Pan India', code: 'IN', count: 9 },
];

const LocationSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-14 sm:py-20 bg-white" aria-label="Explore locations">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Explore KQE events by location"
          subtitle="Find technology events happening in your city and state."
          action={
            <Button variant="ghost" size="sm" rightIcon={<ChevronRight size={16} />} onClick={() => navigate('/events')}>
              View all
            </Button>
          }
        />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Map visual placeholder */}
          <div className="lg:col-span-3 rounded-2xl bg-gradient-to-br from-[#EBF3FF] to-[#F0FDF4] border border-[#E8EAED] flex flex-col items-center justify-center min-h-56 p-8 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#4285F4]/10 flex items-center justify-center mb-2">
              <Globe size={32} className="text-[#4285F4]" />
            </div>
            <p className="font-semibold text-[#1A1A2E] text-lg">Interactive Map</p>
            <p className="text-sm text-[#5F6368] max-w-xs">
              An interactive map with event pins across India will be integrated here in Phase 2.
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              {['Pulivendula', 'Bengaluru', 'Hyderabad', 'Chennai'].map(city => (
                <span key={city} className="text-xs bg-[#4285F4]/10 text-[#4285F4] font-medium px-3 py-1 rounded-full">
                  📍 {city}
                </span>
              ))}
            </div>
          </div>

          {/* Location chips */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-3 content-start">
            {LOCATIONS.map((loc) => (
              <button
                key={loc.code}
                onClick={() => navigate(`/events`)}
                className="group flex items-center justify-between bg-white border border-[#E8EAED] rounded-xl px-4 py-3 text-left hover:border-[#4285F4] hover:shadow-sm transition-all"
                aria-label={`View events in ${loc.name}`}
              >
                <div>
                  <p className="font-semibold text-sm text-[#1A1A2E] group-hover:text-[#4285F4] transition-colors">
                    {loc.name}
                  </p>
                  <p className="text-xs text-[#9AA0A6]">{loc.count} events</p>
                </div>
                <ChevronRight size={14} className="text-[#9AA0A6] group-hover:text-[#4285F4] transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ============================================================
// WHY KQE SECTION
// ============================================================
const WHY_KQE_CARDS = [
  {
    icon: <Zap size={24} className="text-[#4285F4]" />,
    title: 'Learn',
    description: 'Learn from developers and industry experts through practical, hands-on events designed to accelerate your skills.',
    color: '#EBF3FF',
  },
  {
    icon: <TrendingUp size={24} className="text-[#34A853]" />,
    title: 'Build',
    description: 'Build real projects through hands-on bootcamps, hackathons and workshops that challenge and inspire.',
    color: '#E8F5E9',
  },
  {
    icon: <Users size={24} className="text-[#EA4335]" />,
    title: 'Connect',
    description: 'Meet developers, students, founders and technology professionals who share your passion for building.',
    color: '#FFEBEE',
  },
  {
    icon: <Heart size={24} className="text-[#FBBC04]" />,
    title: 'Grow',
    description: 'Build your skills, grow your network and advance your career with the support of the KQE community.',
    color: '#FFF8E1',
  },
];

const WhyKQESection: React.FC = () => (
  <section className="py-14 sm:py-20 bg-[#F8F9FA]" aria-label="Why join KQE">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader title="Why join KQE?" centered />
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {WHY_KQE_CARDS.map((card) => (
          <div
            key={card.title}
            className="bg-white border border-[#E8EAED] rounded-xl p-6 card-hover"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: card.color }}
            >
              {card.icon}
            </div>
            <h3 className="font-bold text-[#1A1A2E] text-lg mb-2">{card.title}</h3>
            <p className="text-sm text-[#5F6368] leading-relaxed">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ============================================================
// CTA SECTION
// ============================================================
const CTASection: React.FC = () => {
  const navigate = useNavigate();
  return (
    <section className="bg-[#4285F4] py-14 sm:py-20" aria-label="Join KQE CTA">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
          Be part of the KQE community
        </h2>
        <p className="text-[#DBEAFE] text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
          Discover your next learning opportunity, connect with builders and grow with the community.
        </p>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate('/events')}
          id="cta-explore-events"
          rightIcon={<ArrowRight size={18} />}
        >
          Explore Upcoming Events
        </Button>
      </div>
    </section>
  );
};

// ============================================================
// HOME PAGE
// ============================================================
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<EventCategory>('All');
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);

  useEffect(() => {
    Promise.all([
      eventService.getAll(),
      communityService.getAll(),
    ]).then(([evts, coms]) => {
      setEvents(evts);
      setFilteredEvents(evts);
      setCommunities(coms.slice(0, 4));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    eventService.search({ query, category }).then(setFilteredEvents);
  }, [query, category]);

  return (
    <div className="fade-in">
      <HeroSection />

      <EventDiscoverySection
        onSearch={setQuery}
        onCategoryChange={setCategory}
        category={category}
        query={query}
      />

      {/* Upcoming Events */}
      <section className="py-14 sm:py-20 bg-white" aria-label="Upcoming events">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <SectionHeader
            title="Upcoming events"
            subtitle="Don't miss what's happening in the KQE community."
            action={
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight size={16} />} onClick={() => navigate('/events')}>
                View all events
              </Button>
            }
          />
          <EventGrid events={filteredEvents} loading={loading} skeletonCount={6} />
        </div>
      </section>

      <LocationSection />

      {/* Communities */}
      <section className="py-14 sm:py-20 bg-white" aria-label="Explore communities">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <SectionHeader
            title="Explore KQE communities"
            subtitle="Join a local chapter near you and be part of the movement."
            action={
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight size={16} />} onClick={() => navigate('/communities')}>
                View all
              </Button>
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {communities.map((com) => (
              <CommunityCard key={com.id} community={com} />
            ))}
          </div>
        </div>
      </section>

      <WhyKQESection />
      <CTASection />
    </div>
  );
};

export default HomePage;
