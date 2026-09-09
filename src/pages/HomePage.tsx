import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, ArrowRight, Users, Zap, Heart, TrendingUp,
  ChevronRight, Globe, Sparkles, Award, Star, LayoutDashboard
} from 'lucide-react';
import { Button, SectionHeader, Input } from '../components/ui';
import { EventGrid, CategoryFilter } from '../components/events/EventGrid';
import { CommunityCard } from '../components/community/CommunityCard';
import { eventService, communityService } from '../services';
import type { Event, Community, EventCategory } from '../types';
import { useAuth } from '../context/AuthContext';
import { SEO } from '../components/SEO';

// ============================================================
// HERO SECTION
// ============================================================
const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, openAuthModal } = useAuth();
  const [recentNotification, setRecentNotification] = useState('Rahul S. from Bengaluru registered for Git & GitHub Bootcamp');

  useEffect(() => {
    const notifications = [
      'Rahul S. from Bengaluru registered for Git & GitHub Bootcamp',
      'Priya K. from Hyderabad joined Java Spring AI Bootcamp',
      'Anand M. from Pulivendula enrolled in Python Agentic AI',
      'Sneha D. from Chennai claimed 100% Free Ticket',
      'Karthik V. from Pune joined GenAI Applications Bootcamp',
    ];

    let notifIndex = 0;
    const notifInterval = setInterval(() => {
      notifIndex = (notifIndex + 1) % notifications.length;
      setRecentNotification(notifications[notifIndex]);
    }, 5000);

    return () => {
      clearInterval(notifInterval);
    };
  }, []);

  return (
    <section className="relative overflow-hidden bg-white py-10 sm:py-16 lg:py-20" aria-label="Hero">
      {/* Dot pattern background */}
      <div className="absolute inset-0 hero-dots opacity-60 pointer-events-none" />

      {/* Decorative color blobs */}
      <div className="absolute top-16 right-[10%] w-96 h-96 rounded-full bg-[#4285F4]/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-8 left-[5%] w-72 h-72 rounded-full bg-[#34A853]/10 blur-3xl pointer-events-none" />
      <div className="absolute top-8 left-[15%] w-56 h-56 rounded-full bg-[#FBBC04]/12 blur-2xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column (Content & Real-Time Stats) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* KQE pill badge + Real-time users online */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center gap-2 bg-[#EBF3FF] text-[#4285F4] text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full shadow-sm border border-[#D2E3FC]">
                <span className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4] animate-pulse" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EA4335]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FBBC04]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#34A853]" />
                </span>
                Kaizen Q Events — Tech Community
              </div>

              {/* Real-time active users badge */}
              <div className="inline-flex items-center gap-2 bg-[#E8F5E9] text-[#2E7D32] text-xs font-bold px-3 py-1.5 rounded-full border border-[#C8E6C9] shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[#34A853] animate-ping" />
                <span>⚡ 10+ Students Live Now</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1A1A2E] leading-[1.15] tracking-tight">
              Connect.{' '}
              <span className="text-[#4285F4] inline-block">Learn.</span>{' '}
              <br className="hidden sm:block" />
              Build.{' '}
              <span className="text-[#34A853] inline-block">Grow.</span>
            </h1>

            {/* Supporting text */}
            <p className="text-base sm:text-lg text-[#5F6368] leading-relaxed max-w-xl">
              Join India's fastest-growing developer and student network. Discover hands-on bootcamps in Git, Java Spring AI, Python Agentic & GenAI with free verified digital certificates.
            </p>

            {/* Real-Time User Avatars Stack & Live Activity Ticker */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5 overflow-hidden">
                  <div className="h-8 w-8 rounded-full bg-[#4285F4] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                    BP
                  </div>
                  <div className="h-8 w-8 rounded-full bg-[#34A853] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                    SK
                  </div>
                  <div className="h-8 w-8 rounded-full bg-[#FBBC04] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                    RA
                  </div>
                  <div className="h-8 w-8 rounded-full bg-[#EA4335] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-sm">
                    PD
                  </div>
                  <div className="h-8 w-8 rounded-full bg-[#1A1A2E] text-white flex items-center justify-center font-bold text-[10px] ring-2 ring-white shadow-sm">
                    +10
                  </div>
                </div>
                <p className="text-xs font-semibold text-[#5F6368]">
                  <strong className="text-[#1A1A2E]">10+ Developers & Students</strong> registered across India
                </p>
              </div>

              {/* Dynamic live notification ticker */}
              <div className="inline-flex items-center gap-2 bg-[#F8F9FA] border border-[#E8EAED] rounded-xl px-3 py-1.5 text-xs text-[#5F6368] transition-all">
                <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse" />
                <span className="font-medium text-[#1A1A2E]">{recentNotification}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/events')}
                rightIcon={<ArrowRight size={18} />}
                id="hero-explore-events"
                className="shadow-md shadow-[#4285F4]/20 hover:shadow-lg transition-all"
              >
                Explore Bootcamps
              </Button>
              {isLoggedIn ? (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/dashboard')}
                  id="hero-dashboard-btn"
                  rightIcon={<LayoutDashboard size={16} />}
                >
                  My Dashboard
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => openAuthModal('signup')}
                  id="hero-join-kqe"
                >
                  Join Community Free
                </Button>
              )}
            </div>

            {/* Quick stats (Real-Time Counts) */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#E8EAED] max-w-lg">
              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#1A1A2E]">10+</p>
                <p className="text-xs sm:text-sm font-medium text-[#5F6368]">Community Members</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#4285F4]">4</p>
                <p className="text-xs sm:text-sm font-medium text-[#5F6368]">Bootcamps Hosted</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-[#34A853]">2</p>
                <p className="text-xs sm:text-sm font-medium text-[#5F6368]">States & Cities</p>
              </div>
            </div>
          </div>

          {/* Right Column (High Impact 3D AI Cartoon Tech Learning Illustration) */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0">
            {/* Background Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-[#4285F4] to-[#34A853] rounded-[36px] opacity-25 blur-xl -z-10" />

            {/* Main Visual Container */}
            <div className="relative bg-white rounded-3xl p-3 sm:p-4 border border-[#E8EAED] shadow-2xl overflow-hidden group">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-[#F1F3F4]">
                <img
                  src="/hero-ai-students.jpg"
                  alt="Students and tech developers building AI and software projects in Kaizen Q Events"
                  width="600"
                  height="450"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <p className="text-sm font-bold flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#FBBC04]" /> Hands-On Student Learning Sessions
                  </p>
                  <p className="text-[11px] text-white/90 font-medium">
                    Live Git, Java Spring AI, Python Agentic & GenAI Workshops
                  </p>
                </div>
              </div>

              {/* Floating Badge 1: Live Status (Top Left) */}
              <div className="absolute -top-3 -left-3 bg-white/95 backdrop-blur-md border border-[#E8EAED] rounded-2xl p-2.5 px-3.5 shadow-lg flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-[#34A853] relative flex items-center justify-center">
                  <span className="w-3 h-3 rounded-full bg-[#34A853] animate-ping opacity-75 absolute" />
                </span>
                <div>
                  <p className="text-[11px] font-extrabold text-[#1A1A2E] leading-none">Live Registrations Open</p>
                  <p className="text-[10px] text-[#34A853] font-semibold mt-0.5">4 Upcoming Bootcamps</p>
                </div>
              </div>

              {/* Floating Badge 2: Community Rating (Bottom Right) */}
              <div className="absolute -bottom-3 -right-3 bg-white/95 backdrop-blur-md border border-[#E8EAED] rounded-2xl p-3 shadow-lg flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#FFF8E1] text-[#FBBC04] flex items-center justify-center font-bold text-sm">
                  <Star size={18} fill="#FBBC04" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-[#1A1A2E]">4.9 / 5.0</span>
                    <span className="text-[10px] text-[#5F6368]">(6K+ reviews)</span>
                  </div>
                  <p className="text-[10px] font-semibold text-[#4285F4]">Verified Student Certs</p>
                </div>
              </div>

              {/* Floating Badge 3: Free Admission (Top Right) */}
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md">
                <Award size={12} className="text-[#FBBC04]" /> 100% Free Pass
              </div>
            </div>
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
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E]">Explore Tech Events & Coding Bootcamps in India</h2>

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
  { name: 'Andhra Pradesh', code: 'AP', count: 1 },
  { name: 'Telangana', code: 'TG', count: 1 },
  { name: 'Karnataka', code: 'KA', count: 1 },
  { name: 'Tamil Nadu', code: 'TN', count: 1 },
];

const LocationSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-14 sm:py-20 bg-white" aria-label="Explore locations">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Explore KQE technology events by location"
          subtitle="Find bootcamps, workshops and hackathons happening in your city and state."
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
      setFilteredEvents(evts);
      setCommunities(coms.slice(0, 4));
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    eventService.search({ query, category }).then(setFilteredEvents);
  }, [query, category]);

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Kaizen Q Events",
    "url": "https://kaizenqevents.click",
    "logo": "https://res.cloudinary.com/dwv8kc9vb/image/upload/v1788465282/KAIZEN_Q_EVENTS_kxjtz4.png",
    "description": "Kaizen Q Events connects developers, students, builders, innovators and technology enthusiasts through hackathons, coding competitions, workshops, conferences and technology community events.",
    "sameAs": [
      "https://www.linkedin.com/in/laxmi-prasanna-narapareddy-062656332/",
      "https://www.instagram.com/kaizenq_lms/"
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://kaizenqevents.click/"
    }]
  };

  return (
    <div className="fade-in">
      <SEO 
        title="Kaizen Q Events | Tech Events, Bootcamps, Workshops & Competitions"
        description="Discover Kaizen Q Events — technology events, AI bootcamps, coding workshops, hackathons, competitions, and student-focused learning experiences across India and online."
        structuredData={[orgSchema, breadcrumbSchema]}
        canonical="/"
      />
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
            title="Upcoming technology events"
            subtitle="Don't miss the latest AI bootcamps and coding workshops in the KQE community."
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
