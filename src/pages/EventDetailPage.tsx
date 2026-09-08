import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Clock,
  ChevronLeft, Users, MessageCircle, ThumbsUp, CheckCircle2,
  BookOpen, Gift, User2, Building2
} from 'lucide-react';
import { eventService } from '../services';
import { registrationService } from '../services/registration';
import type { Event, ScheduleItem as ScheduleItemType, Discussion } from '../types';
import {
  Button, Badge, StatusBadge, Avatar, Divider, Skeleton, EmptyState
} from '../components/ui';
import { SpeakerCard } from '../components/organizer/OrganizerCard';
import { formatShortDate, formatDateRange, cn } from '../utils';
import { SEO } from '../components/SEO';

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
  </svg>
);
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.163 0 7.398 2.967 7.398 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.624 0 12.017 0z"/>
  </svg>
);

// ============================================================
// Section wrapper
// ============================================================
const DetailSection: React.FC<{ id: string; title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string }> = ({
  id, title, icon, children, className,
}) => (
  <section id={id} className={cn('py-8', className)} aria-label={title}>
    <div className="flex items-center gap-2 mb-5">
      {icon && <span className="text-[#4285F4]">{icon}</span>}
      <h2 className="text-xl font-bold text-[#1A1A2E]">{title}</h2>
    </div>
    {children}
  </section>
);

// ============================================================
// Schedule item
// ============================================================
const ScheduleRow: React.FC<{ item: ScheduleItemType; isLast: boolean }> = ({ item, isLast }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className={cn(
        'w-3 h-3 rounded-full mt-1 shrink-0',
        item.type === 'keynote' ? 'bg-[#4285F4]' : item.type === 'break' ? 'bg-[#FBBC04]' : 'bg-[#34A853]'
      )} />
      {!isLast && <div className="w-px flex-1 bg-[#E8EAED] my-1" />}
    </div>
    <div className={cn('pb-5', isLast && 'pb-0')}>
      <p className="text-xs font-semibold text-[#4285F4] mb-0.5">{item.time}</p>
      <p className={cn('font-semibold text-[#1A1A2E]', item.type === 'keynote' ? 'text-base' : 'text-sm')}>
        {item.title}
      </p>
      {item.description && (
        <p className="text-sm text-[#5F6368] mt-0.5 leading-relaxed">{item.description}</p>
      )}
    </div>
  </div>
);

// ============================================================
// Discussion item
// ============================================================
const DiscussionItem: React.FC<{ discussion: Discussion }> = ({ discussion }) => {
  const [liked, setLiked] = useState(false);

  const timeAgo = React.useCallback((ts: string) => {
    const diff = new Date().getTime() - new Date(ts).getTime();
    const days = Math.floor(diff / 86400000);
    if (days > 30) return `${Math.floor(days / 30)}mo ago`;
    if (days > 0) return `${days}d ago`;
    return 'Today';
  }, []);

  return (
    <div className="py-4">
      <div className="flex gap-3">
        <Avatar src={discussion.author.avatarUrl} alt={discussion.author.name} size="sm" className="shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-[#1A1A2E]">{discussion.author.name}</span>
            <span className="text-xs text-[#9AA0A6]">{timeAgo(discussion.timestamp)}</span>
          </div>
          <p className="text-sm text-[#5F6368] leading-relaxed">{discussion.message}</p>
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setLiked(!liked)}
              className={cn(
                'flex items-center gap-1.5 text-xs transition-colors',
                liked ? 'text-[#4285F4]' : 'text-[#9AA0A6] hover:text-[#5F6368]'
              )}
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              <ThumbsUp size={13} />
              {discussion.likes + (liked ? 1 : 0)}
            </button>
            <button className="flex items-center gap-1.5 text-xs text-[#9AA0A6] hover:text-[#5F6368] transition-colors" aria-label="Reply">
              <MessageCircle size={13} />
              {discussion.replies} replies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Skeleton for detail page
// ============================================================
const DetailSkeleton: React.FC = () => (
  <div className="fade-in">
    <Skeleton className="w-full h-72 rounded-none" />
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-10 w-36" />
    </div>
  </div>
);

// ============================================================
// EVENT DETAIL PAGE
// ============================================================
const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setLoading(true);
    setNotFound(false);
    eventService.getById(eventId || '').then((evt) => {
      if (!evt) {
        setNotFound(true);
        setLoading(false);
      } else {
        setEvent(evt);
        registrationService.getRegistrationsForEvent(evt.id).then(() => {
          setLoading(false);
        });
      }
    });
    window.scrollTo({ top: 0 });
  }, [eventId]);

  const handleRegister = () => {
    if (!event) return;
    navigate(`/events/${event.id}/register`);
  };



  if (loading) return <DetailSkeleton />;

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmptyState
          title="Event not found"
          description="This event may have been removed or the URL is incorrect."
          action={<Button variant="primary" onClick={() => navigate('/events')}>Browse All Events</Button>}
        />
      </div>
    );
  }

  if (!event) return null;

  const renderRegisterButton = (fullWidth?: boolean, large?: boolean) => (
    <Button
      variant="primary"
      size={large ? 'lg' : 'md'}
      fullWidth={fullWidth}
      disabled={event.status === 'Closed'}
      onClick={handleRegister}
      id="register-now-btn"
    >
      {event.status === 'Closed'
        ? 'Registration Closed'
        : event.status === 'Waitlist'
        ? 'Join Waitlist'
        : 'Get Tickets'}
    </Button>
  );

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": event.title,
    "description": event.description || `Join us for ${event.title} in ${event.city}.`,
    "startDate": new Date(event.date).toISOString(),
    "endDate": new Date(event.endDate || event.date).toISOString(),
    "eventStatus": event.status === 'Closed' ? "https://schema.org/EventCancelled" : "https://schema.org/EventScheduled",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "location": {
      "@type": "Place",
      "name": event.venue?.name || event.city,
      "address": event.venue?.address || event.city
    },
    "image": event.bannerUrl,
    "organizer": {
      "@type": "Organization",
      "name": "Kaizen Q Events",
      "url": "https://kaizenqevents.tech"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://kaizenqevents.tech/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Events",
        "item": "https://kaizenqevents.tech/events"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": event.title,
        "item": `https://kaizenqevents.tech/events/${event.id}`
      }
    ]
  };

  return (
    <div className="fade-in bg-white min-h-screen">
      <SEO 
        title={`${event.title} | Tech Events & Bootcamps in India | Kaizen Q Events`}
        description={event.description || `Join us for ${event.title} in ${event.city}. Discover technology events and workshops.`}
        canonical={`/events/${event.id}`}
        structuredData={[eventSchema, breadcrumbSchema]}
      />


      {/* ── Banner ── */}
      <div className="relative w-full overflow-hidden" style={{ maxHeight: 420 }}>
        <img
          src={event.bannerUrl}
          alt={`${event.title} banner`}
          width="1200"
          height="360"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="w-full object-cover"
          style={{ height: 360 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 flex items-center gap-1.5 bg-white/90 backdrop-blur text-[#1A1A2E] text-sm font-medium px-3 py-2 rounded-full hover:bg-white transition-all shadow-sm"
          aria-label="Go back"
        >
          <ChevronLeft size={16} />
          Events
        </button>

        {/* Status on banner */}
        <div className="absolute top-4 right-4">
          <StatusBadge status={event.status} />
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 py-8">

          {/* ── Left: Main content ── */}
          <div className="lg:col-span-2 space-y-0">

            {/* Title block */}
            <div className="pb-6">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <Badge label={event.category} variant="blue" />
                {event.id === 'evt-001' ? (
                  <span className="text-xs font-bold bg-[#FFF8E1] text-[#B78103] px-2.5 py-1 rounded-lg border border-[#FFE082]">
                    3 Days Bootcamp
                  </span>
                ) : (
                  <span className="text-xs font-bold bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-1 rounded-lg border border-[#C8E6C9]">
                    5 Days Bootcamp
                  </span>
                )}
                <span className="text-xs font-bold bg-[#EBF3FF] text-[#4285F4] px-2.5 py-1 rounded-lg">
                  Online Mode
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A2E] leading-tight mb-4">
                {event.title}
              </h1>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-sm text-[#5F6368]">
                <span className="flex items-center gap-1.5 font-semibold text-[#2E7D32]">
                  <MapPin size={14} className="text-[#34A853]" />
                  Online Live Workshop (Google Meet / Zoom)
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[#1A1A2E]">
                  <Calendar size={14} className="text-[#4285F4]" />
                  {formatDateRange(event.date, event.endDate)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-[#EA4335]" />
                  Evening {event.time}{event.endTime ? ` – ${event.endTime}` : ''}
                </span>
              </div>

              {/* Share row */}
              <div className="flex flex-wrap items-center gap-3 mt-5">
                <a href="https://pin.it/6KVXozsrh"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[#5F6368] hover:text-[#4285F4] transition-colors border border-[#E8EAED] rounded-lg px-3 py-2"
                  aria-label="Visit Pinterest"
                >
                  <PinterestIcon />
                  Pinterest
                </a>
                <a href="https://www.instagram.com/kaizenq_lms/"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[#5F6368] hover:text-[#4285F4] transition-colors border border-[#E8EAED] rounded-lg px-3 py-2"
                  aria-label="Visit Instagram"
                >
                  <InstagramIcon />
                  Instagram
                </a>
                <a href="https://www.youtube.com/@KaizenQLMS"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[#5F6368] hover:text-[#4285F4] transition-colors border border-[#E8EAED] rounded-lg px-3 py-2"
                  aria-label="Visit YouTube"
                >
                  <YouTubeIcon />
                  YouTube
                </a>
              </div>
            </div>

            <Divider />

            {/* About */}
            <DetailSection id="about" title="About this event" icon={<BookOpen size={20} />}>
              <div className="prose prose-sm max-w-none text-[#5F6368] leading-relaxed space-y-3">
                {event.description.split('\n\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </DetailSection>

            <Divider />

            {/* What you'll learn */}
            <DetailSection id="learn" title="What you'll learn" icon={<BookOpen size={20} />}>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.whatYoullLearn.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#5F6368]">
                    <CheckCircle2 size={16} className="text-[#34A853] shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </DetailSection>

            <Divider />

            {/* What's included */}
            <DetailSection id="included" title="What's included" icon={<Gift size={20} />}>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.whatsIncluded.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[#5F6368]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4] shrink-0 mt-2" />
                    {item}
                  </li>
                ))}
              </ul>
            </DetailSection>

            <Divider />

            {/* Schedule */}
            <DetailSection id="schedule" title="Event schedule" icon={<Clock size={20} />}>
              <div className="space-y-0">
                {event.schedule.map((item, i) => (
                  <ScheduleRow key={i} item={item} isLast={i === event.schedule.length - 1} />
                ))}
              </div>
            </DetailSection>

            <Divider />

            {/* Speakers */}
            {event.speakers.length > 0 && (
              <>
                <DetailSection id="speakers" title="Speakers" icon={<User2 size={20} />}>
                  <div className="grid grid-cols-1 gap-4">
                    {event.speakers.map((speaker) => (
                      <SpeakerCard key={speaker.id} speaker={speaker} />
                    ))}
                  </div>
                </DetailSection>
                <Divider />
              </>
            )}

            {/* Organizers */}
            {event.organizers.length > 0 && (
              <>
                <DetailSection id="organizers" title="Organizers" icon={<Users size={20} />}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {event.organizers.map((org) => (
                      <div key={org.id} className="flex items-center gap-3 bg-[#F8F9FA] rounded-xl p-4">
                        <Avatar src={org.imageUrl} alt={org.name} size="md" />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-[#1A1A2E] truncate">{org.name}</p>
                          <p className="text-xs text-[#5F6368]">{org.role}</p>
                          <p className="text-xs text-[#9AA0A6]">{org.company}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </DetailSection>
                <Divider />
              </>
            )}

            {/* Partners */}
            {event.partners.length > 0 && (
              <>
                <DetailSection id="partners" title="Partners" icon={<Building2 size={20} />}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {event.partners.map((partner) => (
                      <div
                        key={partner.id}
                        className="border border-[#E8EAED] rounded-xl p-4 flex flex-col items-center gap-2 text-center bg-white"
                      >
                        <img
                          src={partner.logoUrl}
                          alt={partner.name}
                          className="w-14 h-14 object-contain rounded-lg"
                          loading="lazy"
                        />
                        <p className="text-xs font-semibold text-[#1A1A2E]">{partner.name}</p>
                        <span className="text-xs text-[#9AA0A6] bg-[#F8F9FA] px-2 py-0.5 rounded-full">
                          {partner.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </DetailSection>
                <Divider />
              </>
            )}

            {/* Venue */}
            <DetailSection id="venue" title="Venue" icon={<MapPin size={20} />}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="mb-1">
                    <p className="text-xs font-semibold text-[#9AA0A6] uppercase tracking-wide mb-1">When</p>
                    <p className="font-semibold text-[#1A1A2E]">{formatDateRange(event.date, event.endDate)}</p>
                    <p className="text-sm text-[#5F6368]">{event.time}{event.endTime ? ` – ${event.endTime}` : ''}</p>
                  </div>
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-[#9AA0A6] uppercase tracking-wide mb-1">Where</p>
                    <p className="font-semibold text-[#1A1A2E]">{event.venue.name}</p>
                    <p className="text-sm text-[#5F6368]">{event.venue.address}</p>
                    <p className="text-sm text-[#5F6368]">{event.venue.city}, {event.venue.state}</p>
                    {event.venue.pincode && <p className="text-sm text-[#9AA0A6]">PIN: {event.venue.pincode}</p>}
                  </div>
                </div>
                {/* Map placeholder */}
                <div className="rounded-xl bg-gradient-to-br from-[#EBF3FF] to-[#E8F5E9] border border-[#E8EAED] flex flex-col items-center justify-center min-h-36 p-4 text-center gap-2">
                  <MapPin size={28} className="text-[#4285F4]" />
                  <p className="text-sm font-medium text-[#1A1A2E]">{event.venue.city}, {event.venue.state}</p>
                  <p className="text-xs text-[#9AA0A6]">Interactive map available in Phase 2</p>
                </div>
              </div>
            </DetailSection>

            <Divider />

            {/* Discussions */}
            <DetailSection id="discussions" title="Discussions" icon={<MessageCircle size={20} />}>
              {event.discussions.length > 0 ? (
                <div className="divide-y divide-[#E8EAED]">
                  {event.discussions.map((d) => (
                    <DiscussionItem key={d.id} discussion={d} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#9AA0A6]">No discussions yet.</p>
              )}
              <div className="mt-4 pt-4 border-t border-[#E8EAED]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/login')}
                  id="login-to-discuss-btn"
                >
                  Log in to add a discussion
                </Button>
              </div>
            </DetailSection>


          </div>

          {/* ── Right: Sticky sidebar ── */}
          <div className="lg:col-span-1">
            <div ref={stickyRef} className="lg:sticky lg:top-24 space-y-4">
              <div className="border border-[#E8EAED] rounded-2xl p-6 bg-white shadow-sm">
                <h3 className="font-bold text-[#1A1A2E] mb-4">Registration</h3>



                {renderRegisterButton(true, true)}

                <div className="mt-4 space-y-2 text-sm text-[#5F6368]">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#9AA0A6]" />
                    <span>{formatShortDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-[#9AA0A6]" />
                    <span>{event.time}{event.endTime ? ` – ${event.endTime}` : ''}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#9AA0A6]" />
                    <span>{event.venue.name}</span>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {event.tags.length > 0 && (
                <div className="border border-[#E8EAED] rounded-2xl p-5 bg-white">
                  <h3 className="font-semibold text-sm text-[#1A1A2E] mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-[#F8F9FA] text-[#5F6368] border border-[#E8EAED] px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Organizers sidebar */}
              {event.organizers.length > 0 && (
                <div className="border border-[#E8EAED] rounded-2xl p-5 bg-white">
                  <h3 className="font-semibold text-sm text-[#1A1A2E] mb-3">Hosted by</h3>
                  <div className="space-y-3">
                    {event.organizers.map((org) => (
                      <div key={org.id} className="flex items-center gap-2.5">
                        <Avatar src={org.imageUrl} alt={org.name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[#1A1A2E] truncate">{org.name}</p>
                          <p className="text-xs text-[#9AA0A6] truncate">{org.company}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E8EAED] p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-3 max-w-xl mx-auto">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#1A1A2E] truncate">{event.title}</p>
            <p className="text-xs text-[#5F6368]">{formatShortDate(event.date)}</p>
          </div>
          {renderRegisterButton()}
        </div>
      </div>

      {/* Bottom padding for mobile sticky bar */}
      <div className="lg:hidden h-20" />
    </div>
  );
};

export default EventDetailPage;
