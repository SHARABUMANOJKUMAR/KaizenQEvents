import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Calendar, Clock, MapPin, CheckCircle2,
  User, Mail, Phone, GraduationCap, Building, BookOpen, Settings, Sparkles
} from 'lucide-react';
import { eventService } from '../services';
import { registrationService } from '../services/registration';
import type { Event } from '../types';
import { Button, Badge, Skeleton, EmptyState } from '../components/ui';
import { formatDate } from '../utils';

const YEAR_OPTIONS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  'Postgraduate / Masters',
  'Working Professional',
  'Other',
];

const EventRegisterPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [year, setYear] = useState('3rd Year');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('');

  // Google Sheet Webhook URL State
  const [webhookUrl, setWebhookUrlState] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [savedUrlMsg, setSavedUrlMsg] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (eventId) {
      eventService.getById(eventId).then((evt) => {
        if (evt) {
          setEvent(evt);
          setWebhookUrlState(registrationService.getEventWebhookUrl(evt.id));
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
    window.scrollTo({ top: 0 });
  }, [eventId]);

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (event) {
      registrationService.setEventWebhookUrl(event.id, webhookUrl);
      setSavedUrlMsg(true);
      setTimeout(() => setSavedUrlMsg(false), 2500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setSubmitting(true);

    const payload = {
      eventId: event.id,
      eventTitle: event.title,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      year,
      college: college.trim(),
      branch: branch.trim(),
    };

    await registrationService.submitRegistration(payload);

    const randomTicket = 'KQE-' + Math.floor(100000 + Math.random() * 900000);
    setTicketId(randomTicket);
    setSubmitting(false);
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <EmptyState
          title="Event Not Found"
          description="The event you are looking to register for could not be found."
          action={<Button variant="primary" onClick={() => navigate('/events')}>Browse Events</Button>}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Back Button */}
        <button
          onClick={() => navigate(`/events/${event.id}`)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5F6368] hover:text-[#1A1A2E] mb-6 transition-colors"
        >
          <ChevronLeft size={18} />
          Back to Event Details
        </button>

        {/* Header Event Card Summary */}
        <div className="bg-white rounded-2xl border border-[#E8EAED] p-6 shadow-sm mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge label={event.category} variant="blue" />
              <span className="text-xs font-semibold text-[#34A853] bg-[#E6F4EA] px-2 py-0.5 rounded-full">
                {event.status}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A2E]">{event.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5F6368] pt-1">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-[#4285F4]" />
                {formatDate(event.date)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-[#FBBC04]" />
                {event.time} – {event.endTime}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={13} className="text-[#EA4335]" />
                {event.city}, {event.state}
              </span>
            </div>
          </div>
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-20 h-20 rounded-xl object-cover shrink-0 hidden sm:block border border-[#E8EAED]"
          />
        </div>

        {/* Submitted Confirmation State */}
        {submitted ? (
          <div className="bg-white rounded-2xl border border-[#E8EAED] p-8 text-center shadow-lg fade-in space-y-6">
            <div className="w-16 h-16 bg-[#E6F4EA] text-[#34A853] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#1A1A2E]">Registration Confirmed!</h2>
              <p className="text-sm text-[#5F6368] mt-1">
                You are successfully registered for <span className="font-semibold text-[#1A1A2E]">{event.title}</span>.
              </p>
            </div>

            {/* Ticket Card */}
            <div className="bg-[#F8F9FA] border border-dashed border-[#4285F4]/40 rounded-xl p-5 text-left max-w-md mx-auto space-y-3">
              <div className="flex justify-between items-center border-b border-[#E8EAED] pb-2">
                <span className="text-xs font-semibold uppercase text-[#5F6368]">Registration ID</span>
                <span className="text-sm font-mono font-bold text-[#4285F4]">{ticketId}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[#9AA0A6]">Attendee:</span>
                  <p className="font-semibold text-[#1A1A2E]">{fullName}</p>
                </div>
                <div>
                  <span className="text-[#9AA0A6]">Year / Status:</span>
                  <p className="font-semibold text-[#1A1A2E]">{year}</p>
                </div>
                <div>
                  <span className="text-[#9AA0A6]">Email:</span>
                  <p className="font-semibold text-[#1A1A2E] truncate">{email}</p>
                </div>
                <div>
                  <span className="text-[#9AA0A6]">Phone:</span>
                  <p className="font-semibold text-[#1A1A2E]">{phone}</p>
                </div>
                <div>
                  <span className="text-[#9AA0A6]">College / Inst:</span>
                  <p className="font-semibold text-[#1A1A2E]">{college}</p>
                </div>
                <div>
                  <span className="text-[#9AA0A6]">Branch:</span>
                  <p className="font-semibold text-[#1A1A2E]">{branch || 'N/A'}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-[#E8EAED] flex items-center justify-between text-xs text-[#5F6368]">
                <span>⏰ {event.time} – {event.endTime}</span>
                <span>📍 {event.city}</span>
              </div>
            </div>

            {/* WhatsApp Group & QR Code Banner */}
            <div className="bg-[#111B21] text-white border border-[#25D366]/40 rounded-2xl p-6 text-center max-w-md mx-auto space-y-4 shadow-xl">
              <div className="flex items-center justify-center gap-2 text-[#25D366] font-bold text-base">
                <span>💬 Join {event.title} WhatsApp Group</span>
              </div>
              <p className="text-xs text-[#8696A0] leading-relaxed">
                Scan the QR code below or click the button to join the official WhatsApp group for live announcements and materials.
              </p>

              {/* QR Code Container */}
              <div className="bg-white p-3 rounded-2xl w-48 h-48 mx-auto shadow-md flex items-center justify-center border-4 border-[#25D366]">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                    event.whatsappGroupUrl || 'https://chat.whatsapp.com'
                  )}`}
                  alt={`${event.title} WhatsApp Group QR Code`}
                  className="w-full h-full object-contain"
                />
              </div>
              <p className="text-[11px] text-[#8696A0]">Scan with your phone camera or WhatsApp</p>

              <a
                href={event.whatsappGroupUrl || 'https://chat.whatsapp.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm rounded-xl shadow-lg transition-all transform hover:scale-105 w-full"
              >
                Join WhatsApp Group
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button variant="primary" onClick={() => navigate(`/events/${event.id}`)}>
                Back to Event Details
              </Button>
              <Button variant="secondary" onClick={() => setSubmitted(false)}>
                Register Another Attendee
              </Button>
            </div>
          </div>
        ) : (
          /* Registration Form */
          <div className="bg-white rounded-2xl border border-[#E8EAED] shadow-sm p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#E8EAED] pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-[#1A1A2E]">Attendee Registration Form</h2>
                <p className="text-xs text-[#5F6368]">Please fill in your basic details to complete registration.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowConfig(!showConfig)}
                className="text-xs text-[#4285F4] hover:underline flex items-center gap-1 font-medium"
              >
                <Settings size={14} />
                Google Sheet Config
              </button>
            </div>

            {/* Collapsible Google Sheet Webhook Configuration */}
            {showConfig && (
              <div className="bg-[#EEF4FE] border border-[#4285F4]/30 rounded-xl p-4 text-xs space-y-3 fade-in">
                <div className="flex items-center justify-between font-semibold text-[#1A1A2E]">
                  <span className="flex items-center gap-1.5 text-[#4285F4]">
                    <Sparkles size={15} />
                    Google Sheet Webhook for "{event.title}"
                  </span>
                </div>
                <p className="text-[#5F6368] leading-relaxed">
                  Paste the Google Apps Script Web App URL for this specific bootcamp sheet below. Registrations for this event will post directly into this sheet.
                </p>
                <form onSubmit={handleSaveWebhook} className="flex gap-2">
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrlState(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3 py-1.5 bg-white border border-[#E8EAED] rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#4285F4]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#4285F4] text-white rounded-lg font-semibold hover:bg-[#3367D6] transition-colors"
                  >
                    Save URL
                  </button>
                </form>
                {savedUrlMsg && (
                  <p className="text-[#34A853] font-semibold">✓ Webhook URL saved successfully!</p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1.5">
                  Full Name <span className="text-[#EA4335]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8EAED] rounded-xl text-sm font-medium text-[#1A1A2E] placeholder-[#9AA0A6] focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/15 transition-all"
                  />
                </div>
              </div>

              {/* Grid: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1.5">
                    Email Address <span className="text-[#EA4335]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                      <Mail size={16} />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8EAED] rounded-xl text-sm font-medium text-[#1A1A2E] placeholder-[#9AA0A6] focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/15 transition-all"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1.5">
                    Phone Number <span className="text-[#EA4335]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                      <Phone size={16} />
                    </div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8EAED] rounded-xl text-sm font-medium text-[#1A1A2E] placeholder-[#9AA0A6] focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/15 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Grid: Year of Study & Branch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Year of Study */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1.5">
                    Year of Study / Status <span className="text-[#EA4335]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                      <GraduationCap size={16} />
                    </div>
                    <select
                      required
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8EAED] rounded-xl text-sm font-medium text-[#1A1A2E] focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/15 transition-all"
                    >
                      {YEAR_OPTIONS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Branch / Department */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1.5">
                    Department / Branch <span className="text-[#EA4335]">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                      <BookOpen size={16} />
                    </div>
                    <input
                      type="text"
                      required
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      placeholder="e.g. CSE / ECE / AI & DS"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8EAED] rounded-xl text-sm font-medium text-[#1A1A2E] placeholder-[#9AA0A6] focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/15 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* College / Organization */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1.5">
                  College / University / Organization <span className="text-[#EA4335]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9AA0A6]">
                    <Building size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    placeholder="Enter your college or company name"
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8EAED] rounded-xl text-sm font-medium text-[#1A1A2E] placeholder-[#9AA0A6] focus:outline-none focus:border-[#4285F4] focus:ring-2 focus:ring-[#4285F4]/15 transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={submitting}
                  id="submit-registration-btn"
                >
                  Submit Registration
                </Button>
                <p className="text-center text-xs text-[#9AA0A6] mt-3">
                  By registering, you agree to receive event updates & confirmation details.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRegisterPage;
