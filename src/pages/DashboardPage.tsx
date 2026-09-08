import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Ticket, Award, CheckCircle2,
  ExternalLink, Building, ArrowRight, Printer
} from 'lucide-react';
import { Button, Skeleton } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { registrationService } from '../services/registration';
import { events } from '../data/events';
import type { Event } from '../types';
import { formatDateRange } from '../utils';
import { SEO } from '../components/SEO';

interface UserRegistration {
  eventId: string;
  eventTitle: string;
  fullName: string;
  email: string;
  phone: string;
  year: string;
  college: string;
  branch: string;
  timestamp?: string;
  ticketId?: string;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [matchedEvents, setMatchedEvents] = useState<{ reg: UserRegistration; event?: Event }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      if (!user?.email) {
        setMatchedEvents([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const userRegs = await registrationService.getUserRegistrations(user.email);

        const mapped = userRegs.map((reg) => {
          const found = events.find((e) => e.id === reg.eventId || e.title === reg.eventTitle);
          return {
            reg: {
              ...reg,
              ticketId: (reg as any).ticketId || `KQE-${Math.floor(100000 + Math.random() * 900000)}`,
            },
            event: found,
          };
        });

        setMatchedEvents(mapped);
      } catch (err) {
        console.warn('Dashboard data load error:', err);
        setMatchedEvents([]);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [user]);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-10 sm:py-14 fade-in">
      <SEO 
        title="My Dashboard | Kaizen Q Events" 
        description="View your registered bootcamps and tech events." 
        noindex={true} 
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header Card */}
        <div className="bg-white border border-[#E8EAED] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#4285F4] to-[#34A853] text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
                {getInitials(user?.displayName)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-extrabold text-[#1A1A2E]">
                    {user?.displayName || 'Community Member'}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-0.5 rounded-full">
                    <CheckCircle2 size={12} /> Active Student
                  </span>
                </div>
                <p className="text-sm text-[#5F6368] mt-0.5">{user?.email || 'Authenticated User'}</p>
                {user?.college && (
                  <p className="text-xs text-[#9AA0A6] mt-1 flex items-center gap-1">
                    <Building size={12} /> {user.college} {user.branch ? `• ${user.branch}` : ''} {user.year ? `(${user.year})` : ''}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/events')}
                rightIcon={<ArrowRight size={16} />}
              >
                Explore More Bootcamps
              </Button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#E8EAED]">
            <div className="bg-[#F8F9FA] rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-[#4285F4]">{matchedEvents.length}</p>
              <p className="text-xs font-semibold text-[#5F6368] mt-1">Registered Events</p>
            </div>
            <div className="bg-[#F8F9FA] rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-[#34A853]">4</p>
              <p className="text-xs font-semibold text-[#5F6368] mt-1">Available Bootcamps</p>
            </div>
            <div className="bg-[#F8F9FA] rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-[#FBBC04]">100%</p>
              <p className="text-xs font-semibold text-[#5F6368] mt-1">Free Admission</p>
            </div>
            <div className="bg-[#F8F9FA] rounded-2xl p-4 text-center">
              <p className="text-2xl font-black text-[#EA4335]">{matchedEvents.length * 2}+ hrs</p>
              <p className="text-xs font-semibold text-[#5F6368] mt-1">Hands-on Learning</p>
            </div>
          </div>
        </div>

        {/* Section: My Registered Events & Passes */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#1A1A2E]">My Registered Bootcamps & Event Passes</h2>
              <p className="text-xs text-[#5F6368] mt-0.5">
                Real-time active registration tickets synced with Google Sheets & Firebase.
              </p>
            </div>
            <span className="text-xs font-bold bg-[#EBF3FF] text-[#4285F4] px-3 py-1 rounded-full">
              {matchedEvents.length} Active Pass{matchedEvents.length !== 1 ? 'es' : ''}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full rounded-3xl" />
              <Skeleton className="h-64 w-full rounded-3xl" />
            </div>
          ) : matchedEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matchedEvents.map(({ reg, event }, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#E8EAED] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-28 h-28 bg-[#4285F4]/5 rounded-bl-full pointer-events-none" />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#4285F4] bg-[#EBF3FF] px-2.5 py-1 rounded-lg">
                          {event?.category || 'Tech Bootcamp'}
                        </span>
                        {event?.id === 'evt-001' ? (
                          <span className="text-[10px] font-bold bg-[#FFF8E1] text-[#B78103] px-2 py-0.5 rounded-md border border-[#FFE082]">
                            3 Days Bootcamp
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] px-2 py-0.5 rounded-md border border-[#C8E6C9]">
                            5 Days Bootcamp
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-mono font-bold text-[#5F6368] bg-[#F1F3F4] px-2 py-0.5 rounded-md">
                        {reg.ticketId}
                      </span>
                    </div>

                    <h3 className="text-lg font-extrabold text-[#1A1A2E] leading-snug">
                      {event?.title || reg.eventTitle}
                    </h3>

                    {event?.speakers && event.speakers.length > 0 && (
                      <p className="text-xs text-[#5F6368] font-medium">
                        Instructor: <strong className="text-[#1A1A2E]">{event.speakers[0].name}</strong>
                      </p>
                    )}

                    <div className="space-y-1.5 text-xs text-[#5F6368]">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#4285F4]" />
                        <span className="font-semibold text-[#1A1A2E]">
                          {event ? formatDateRange(event.date, event.endDate) : 'October 2026'} • Evening {event?.time || '06:00 PM'} - {event?.endTime || '07:30 PM'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-[#34A853]" />
                        <span className="font-semibold text-[#2E7D32]">Online Live Workshop (Google Meet / Zoom)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award size={14} className="text-[#34A853]" />
                        <span>Verified Digital Certificate Included</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E8EAED] flex items-center justify-between gap-3">
                    {event?.whatsappGroupUrl && (
                      <a
                        href={event.whatsappGroupUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-[#25D366] hover:underline flex items-center gap-1"
                      >
                        <ExternalLink size={12} /> WhatsApp Group
                      </a>
                    )}
                    <div className="flex gap-2 ml-auto">
                      {event && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/events/${event.id}`)}
                        >
                          View Details
                        </Button>
                      )}
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/pass/${reg.ticketId}`, { state: { reg, event } })}
                      >
                        <Printer size={13} className="mr-1" /> Print Pass
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#E8EAED] rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#EBF3FF] text-[#4285F4] flex items-center justify-center mx-auto">
                <Ticket size={28} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1A1A2E]">No Registered Bootcamps Yet</h3>
                <p className="text-xs text-[#5F6368] max-w-md mx-auto mt-1">
                  You haven't registered for any events yet. Explore upcoming hands-on bootcamps in Git, Java, Python AI, and GenAI!
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/events')}
                rightIcon={<ArrowRight size={16} />}
              >
                Browse All Events & Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
