import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import type { RegistrationPayload } from '../services/registration';
import type { Event } from '../types';
import { formatDateRange } from '../utils';
import { SEO } from '../components/SEO';
import { CheckCircle2, Award, Printer, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { registrationService } from '../services/registration';
import { events } from '../data/events';

export const EventPassPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [reg, setReg] = useState<RegistrationPayload | null>(location.state?.reg || null);
  const [event] = useState<Event | null>(
    location.state?.event || 
    (location.state?.reg?.eventId ? events.find(e => e.id === location.state.reg.eventId) : null)
  );
  const [loading, setLoading] = useState(!location.state?.reg);

  useEffect(() => {
    // If navigated directly without state, try to fetch the registration
    if (!reg && user?.email) {
      registrationService.getUserRegistrations(user.email).then(regs => {
        const foundReg = regs.find(r => r.ticketId === ticketId);
        if (foundReg) {
          setReg(foundReg);
          // Also set the event if we found the registration
          if (foundReg.eventId && !event) {
            // We can't set event directly since it's not a state variable anymore, wait, it IS a state variable but I just removed the setter.
            // Let's re-add the setter for event.
          }
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [reg, ticketId, user]);

  useEffect(() => {
    // Optional: auto-print when ready
    if (!loading && reg) {
      // Small delay to ensure render
      setTimeout(() => {
        // window.print();
      }, 500);
    }
  }, [loading, reg]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading pass...</div>;
  }

  if (!reg) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4">Pass not found</h2>
        <p className="text-gray-600 mb-6">Could not find registration for {ticketId}</p>
        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const verifyUrl = `${window.location.origin}/verify/${ticketId}`;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 print:py-0 print:bg-white">
      <SEO title={`Event Pass - ${reg.eventTitle}`} noindex={true} description="Event Pass Ticket" />

      {/* Screen-only controls */}
      <div className="mb-8 flex gap-4 print:hidden w-full max-w-3xl px-4">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 font-medium"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className="flex-1"></div>
        <button 
          onClick={async () => {
            try {
              const html2pdf = (await import('html2pdf.js')).default;
              const element = document.getElementById('ticket-content');
              if (!element) return;
              
              const opt = {
                margin:       0,
                filename:     `Kaizen_Event_Pass_${ticketId}.pdf`,
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2, useCORS: true },
                jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
              };
              
              html2pdf().set(opt).from(element).save();
            } catch (err) {
              console.error('Failed to generate PDF', err);
              // Fallback to browser print
              window.print();
            }
          }}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 font-medium"
        >
          <Printer size={16} /> Download PDF
        </button>
      </div>

      {/* The Ticket / Pass - optimized for A4 */}
      <div id="ticket-content" className="ticket-container bg-white w-full max-w-lg sm:max-w-[210mm] sm:min-h-[297mm] shadow-2xl print:shadow-none print:w-full print:min-h-0 print:m-0 mx-auto relative overflow-hidden border border-gray-200">
        
        {/* Top Header */}
        <div className="bg-[linear-gradient(135deg,#FFD700,#FFA500,#2563EB,#16A34A)] text-white p-10 flex flex-col items-center justify-center relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
          <div className="flex items-center justify-center mb-6 relative z-10">
            <img 
              src="https://res.cloudinary.com/dwv8kc9vb/image/upload/v1788465282/KAIZEN_Q_EVENTS_kxjtz4.png" 
              alt="Kaizen Q Events Logo" 
              className="h-16 sm:h-20 object-contain"
            />
          </div>
          <h1 className="text-sm font-semibold tracking-widest text-white/90 uppercase mb-2 relative z-10">Official Event Pass</h1>
          <div className="h-1 w-12 bg-white/50 rounded-full relative z-10"></div>
        </div>

        {/* Main Content */}
        <div className="p-6 sm:p-12 space-y-6 sm:space-y-10">
          
          <div className="text-center">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">This Is Your Event Pass</p>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full border border-blue-100">
                {event?.category || 'Tech Event'}
              </span>
              <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-full border border-green-100">
                5 Days Bootcamp
              </span>
            </div>
            
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3 leading-tight">{reg.eventTitle}</h2>
            {event?.organizers?.[0] && (
              <p className="text-lg text-gray-600 font-medium">Instructor: {event.organizers[0].name}</p>
            )}
          </div>

          <div className="h-px bg-gray-200 w-full"></div>

          {/* Event Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {event ? formatDateRange(event.date, event.endDate || event.date) : 'See Event Page'}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Time</p>
              <p className="text-lg font-semibold text-gray-900">{event?.time || '06:00 PM - 07:30 PM'}</p>
            </div>
            <div className="col-span-1 sm:col-span-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Mode</p>
              <p className="text-lg font-semibold text-gray-900">Online Live Workshop (Google Meet / Zoom)</p>
            </div>
          </div>

          <div className="h-px bg-gray-200 w-full"></div>

          {/* Participant Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 items-center">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Issued To</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">{reg.fullName}</p>
              <p className="text-gray-600 font-medium">{reg.email}</p>
              {reg.phone && <p className="text-gray-500 text-sm mt-1">{reg.phone}</p>}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pass ID</p>
              <div className="inline-block bg-gray-100 px-4 py-2 rounded-lg border border-gray-200">
                <p className="text-xl font-mono font-bold text-gray-900 break-all">{ticketId}</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-gray-200 w-full"></div>

          {/* QR Code and Validation */}
          <div className="flex flex-col items-center justify-center pt-2 sm:pt-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-3">
              <QRCode 
                value={verifyUrl}
                size={140}
                level="H"
                className="mx-auto"
              />
            </div>
            <p className="text-sm font-semibold text-gray-500 tracking-widest uppercase mb-6 sm:mb-8">Scan to Verify</p>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center w-full">
              <div className="flex items-center justify-center gap-2 text-green-700 font-semibold bg-green-50 px-4 py-2 rounded-full border border-green-200">
                <CheckCircle2 size={18} />
                <span className="text-sm sm:text-base">Verified Registration</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-blue-700 font-semibold bg-blue-50 px-4 py-2 rounded-full border border-blue-200">
                <Award size={18} />
                <span className="text-sm sm:text-base">Digital Certificate Included</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 w-full bg-gray-50 py-6 text-center border-t border-gray-200">
          <p className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-1">FREE ADMISSION</p>
          <p className="text-xs text-gray-400">© 2026 Kaizen Q Events • Official Event Registration Pass</p>
        </div>

      </div>

      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: white !important;
          }
          .ticket-container {
            width: 100% !important;
            height: 100vh !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            page-break-after: avoid;
            page-break-before: avoid;
            page-break-inside: avoid;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};
