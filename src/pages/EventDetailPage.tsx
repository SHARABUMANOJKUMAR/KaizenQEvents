import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Clock, Link2,
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

// Inline brand icons
const TwitterShareIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.713 5.987zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const LinkedInShareIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
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

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const days = Math.floor(diff / 86400000);
    if (days > 30) return `${Math.floor(days / 30)}mo ago`;
    if (days > 0) return `${days}d ago`;
    return 'Today';
  };

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
  const [shareToast, setShareToast] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    eventService.getById(eventId || '').then((evt) => {
      if (!evt) {
        setNotFound(true);
      } else {
        setEvent(evt);
      }
      setLoading(false);
    });
    window.scrollTo({ top: 0 });
  }, [eventId]);

  const handleRegister = () => {
    if (!event) return;
    navigate(`/events/${event.id}/register`);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const registeredCount = event
    ? Math.max(1, (event.currentAttendees || 1) + (registrationService.getRegistrationsForEvent(event.id).length > 1 ? registrationService.getRegistrationsForEvent(event.id).length - 1 : 0))
    : 1;

  const attendancePct = event
    ? Math.max(1, Math.round((registeredCount / (event.maxAttendees || 1)) * 100))
    : 0;

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

  const RegisterButton: React.FC<{ fullWidth?: boolean; large?: boolean }> = ({ fullWidth, large }) => (
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
        : 'Register Now'}
    </Button>
  );

  return (
    <div className="fade-in bg-white min-h-screen">
      {/* Share toast */}
      {shareToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#1A1A2E] text-white text-sm px-5 py-3 rounded-full shadow-xl animate-fade-in">
          Link copied to clipboard!
        </div>
      )}

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
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 text-sm text-[#5F6368] hover:text-[#4285F4] transition-colors border border-[#E8EAED] rounded-lg px-3 py-2"
                  aria-label="Copy link"
                >
                  <Link2 size={14} />
                  Copy Link
                </button>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[#5F6368] hover:text-[#4285F4] transition-colors border border-[#E8EAED] rounded-lg px-3 py-2"
                  aria-label="Share on Twitter"
                >
                  <TwitterShareIcon />
                  Tweet
                </a>
                <a href={`https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-[#5F6368] hover:text-[#4285F4] transition-colors border border-[#E8EAED] rounded-lg px-3 py-2"
                  aria-label="Share on LinkedIn"
                >
                  <LinkedInShareIcon />
                  Share
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

            <Divider />

            {/* Final CTA */}
            <div className="py-8 text-center space-y-3">
              <h2 className="text-xl font-bold text-[#1A1A2E]">Ready to join?</h2>
              <p className="text-sm text-[#5F6368]">
                {event.maxAttendees
                  ? `${Math.max(0, event.maxAttendees - registeredCount)} seats remaining`
                  : 'Secure your spot today.'}
              </p>
              <RegisterButton large />
            </div>
          </div>

          {/* ── Right: Sticky sidebar ── */}
          <div className="lg:col-span-1">
            <div ref={stickyRef} className="lg:sticky lg:top-24 space-y-4">
              <div className="border border-[#E8EAED] rounded-2xl p-6 bg-white shadow-sm">
                <h3 className="font-bold text-[#1A1A2E] mb-4">Registration</h3>

                {/* Attendance progress (Real-Time Count) */}
                {event.maxAttendees && (
                  <div className="mb-5">
                    <div className="flex justify-between text-xs text-[#5F6368] mb-1.5">
                      <span className="font-semibold text-[#1A1A2E]">{registeredCount} {registeredCount === 1 ? 'member registered' : 'registered'}</span>
                      <span>{event.maxAttendees} capacity</span>
                    </div>
                    <div className="w-full bg-[#E8EAED] rounded-full h-2">
                      <div
                        className="bg-[#4285F4] h-2 rounded-full transition-all"
                        style={{ width: `${Math.max(1, Math.min(attendancePct, 100))}%` }}
                      />
                    </div>
                    <p className="text-xs text-[#9AA0A6] mt-1">{attendancePct}% filled • Real-time count</p>
                  </div>
                )}

                <RegisterButton fullWidth large />

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
          <RegisterButton />
        </div>
      </div>

      {/* Bottom padding for mobile sticky bar */}
      <div className="lg:hidden h-20" />
    </div>
  );
};

export default EventDetailPage;
