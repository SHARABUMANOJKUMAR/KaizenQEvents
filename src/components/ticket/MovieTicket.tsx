import React, { useRef } from 'react';
import { Download, Calendar, Clock, Sparkles, ShieldCheck } from 'lucide-react';
import type { Event } from '../../types';
import { formatDateRange } from '../../utils';

interface MovieTicketProps {
  ticketId: string;
  fullName: string;
  email: string;
  phone?: string;
  college?: string;
  branch?: string;
  year?: string;
  event: Event;
  qrCodeUrl?: string;
  notchBg?: string;
}

export const MovieTicket: React.FC<MovieTicketProps> = ({
  ticketId,
  fullName,
  email,
  phone,
  college,
  branch,
  year,
  event,
  qrCodeUrl,
  notchBg = 'bg-white',
}) => {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const formattedTicketId = ticketId.startsWith('KQE-') ? ticketId : `KQE-${ticketId}`;
  const qrTarget = qrCodeUrl || event.whatsappGroupUrl || `https://kaizenq-events.com/ticket/${ticketId}`;

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Movie Ticket Card */}
      <div
        ref={ticketRef}
        className="relative bg-gradient-to-b from-[#1E222D] to-[#12151C] text-white rounded-3xl shadow-2xl overflow-hidden border border-white/10"
        style={{
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5), 0 0 25px rgba(66,133,244,0.15)',
        }}
      >
        {/* Ticket Header (Movie Marquee / Gold Foil Bar) */}
        <div className="bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC04] to-[#34A853] p-[2px]">
          <div className="bg-[#181B24] px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src="https://res.cloudinary.com/dwv8kc9vb/image/upload/v1788465425/KAIZEN_Q_EVENTS_FAVICON_o8hwrj.png"
                alt="KQE Logo"
                className="h-6 w-auto object-contain"
              />
              <span className="text-[11px] font-black tracking-widest uppercase text-white/90">
                KQE CINEMA PASS
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#4285F4]/20 border border-[#4285F4]/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#93C5FD]">
              <Sparkles size={10} className="text-[#FBBC04]" />
              <span>ADMIT ONE</span>
            </div>
          </div>
        </div>

        {/* Main Event Header */}
        <div className="p-5 pb-4 space-y-2 relative">
          <div className="flex items-center justify-between text-[11px] text-white/60 font-semibold tracking-wider uppercase">
            <span>OFFICIAL LIVE WORKSHOP</span>
            <span className="text-[#34A853] font-bold">100% FREE PASS</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight tracking-tight">
            {event.title}
          </h3>

          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-white/80">
            <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
              <Calendar size={12} className="text-[#4285F4]" />
              {formatDateRange(event.date, event.endDate)}
            </span>
            <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
              <Clock size={12} className="text-[#FBBC04]" />
              {event.time} – {event.endTime}
            </span>
          </div>
        </div>

        {/* Attendee Details Grid */}
        <div className="px-5 py-3 grid grid-cols-2 gap-3 text-xs border-t border-white/10 bg-white/[0.02]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-0.5">
              ATTENDEE
            </span>
            <p className="font-bold text-white text-sm truncate">{fullName}</p>
            <p className="text-[10px] text-white/60 truncate">{email}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-0.5">
              SEAT / HALL
            </span>
            <p className="font-bold text-[#34A853] text-sm">LIVE-VIP 01</p>
            <p className="text-[10px] text-white/60">{phone ? `Ph: ${phone}` : 'ONLINE PASS'}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-0.5">
              COLLEGE / STATUS
            </span>
            <p className="font-medium text-white/90 truncate">{college || 'Student'}</p>
            {branch && <p className="text-[10px] text-white/60 truncate">{branch}</p>}
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-0.5">
              VENUE / YEAR
            </span>
            <p className="font-medium text-white/90 truncate">{event.city || 'Google Meet / Zoom'}</p>
            {year && <p className="text-[10px] text-white/60">{year}</p>}
          </div>
        </div>

        {/* ── Perforation & Side Cutout Notches ── */}
        <div className="relative py-3 flex items-center justify-between">
          {/* Left Notch (Half circle cutout) */}
          <div
            className={`w-6 h-6 rounded-full ${notchBg} -ml-3 z-20 shadow-inner`}
            style={{
              boxShadow: 'inset -3px 0 6px rgba(0,0,0,0.3)',
            }}
          />

          {/* Perforated Dashed Line */}
          <div className="flex-1 border-t-2 border-dashed border-white/20 mx-2" />

          {/* Right Notch (Half circle cutout) */}
          <div
            className={`w-6 h-6 rounded-full ${notchBg} -mr-3 z-20 shadow-inner`}
            style={{
              boxShadow: 'inset 3px 0 6px rgba(0,0,0,0.3)',
            }}
          />
        </div>

        {/* ── Ticket Stub (Barcode & QR Code) ── */}
        <div className="p-5 pt-2 bg-[#0E1118] space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">
                TICKET NUMBER
              </span>
              <p className="font-mono font-bold text-sm text-[#4285F4] tracking-wider truncate">
                {formattedTicketId}
              </p>
              <p className="text-[10px] text-white/50 flex items-center gap-1">
                <ShieldCheck size={11} className="text-[#34A853]" /> Verified Digital Pass
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-1.5 rounded-xl shrink-0 shadow-md">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrTarget)}`}
                alt="Ticket QR Code"
                className="w-16 h-16 object-contain rounded-lg"
              />
            </div>
          </div>

          {/* Realistic Barcode graphic */}
          <div className="pt-2 border-t border-white/10 flex flex-col items-center">
            <div className="h-9 w-full flex items-center justify-between px-2 opacity-75">
              {[3, 1, 4, 1, 2, 5, 2, 1, 3, 2, 4, 1, 2, 3, 5, 1, 2, 4, 1, 3, 2, 4, 1, 3, 2, 5, 1, 2, 3, 1, 4, 2].map(
                (w, idx) => (
                  <div
                    key={idx}
                    className="bg-white h-full"
                    style={{ width: `${w * 1.5}px` }}
                  />
                )
              )}
            </div>
            <span className="font-mono text-[9px] text-white/40 tracking-[0.3em] mt-1">
              * {formattedTicketId} *
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Download size={14} />
          Print / Save Ticket
        </button>
      </div>
    </div>
  );
};
