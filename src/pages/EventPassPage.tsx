import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import type { RegistrationPayload } from '../services/registration';
import type { Event } from '../types';
import { formatDateRange } from '../utils';
import { SEO } from '../components/SEO';
import { CheckCircle2, Award, Printer, ArrowLeft, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    if (!reg && ticketId) {
      const fetchTicket = async () => {
        try {
          const targetId = ticketId.trim().toUpperCase();
          let foundTicket: RegistrationPayload | null = null;
          
          try {
            const { collection, query, where, getDocs } = await import('firebase/firestore');
            const { db } = await import('../services/firebase');
            const q = query(collection(db, 'registrations'), where('ticketId', '==', targetId));
            const snapshot = await getDocs(q);
            
            if (!snapshot.empty) {
              foundTicket = snapshot.docs[0].data() as RegistrationPayload;
            }
          } catch (fbErr) {
            console.warn("Firestore search failed or was blocked by rules.", fbErr);
          }

          // Fallback to Google Sheets if not found in Firestore
          if (!foundTicket) {
            const { GoogleSheetsService } = await import('../services/googleSheetsService');
            const data = await GoogleSheetsService.getAllDashboardData();
            
            // Normalize key lookup – column headers can vary in case/spacing
            const getField = (row: Record<string, string | undefined>, ...keys: string[]): string => {
              // First try exact match
              for (const key of keys) {
                if (row[key] !== undefined && row[key] !== '') return row[key]!;
              }
              // Then try case-insensitive match
              const rowKeys = Object.keys(row);
              for (const key of keys) {
                const found = rowKeys.find(k => k.toLowerCase().replace(/[\s_-]/g, '') === key.toLowerCase().replace(/[\s_-]/g, ''));
                if (found && row[found] !== undefined && row[found] !== '') return row[found]!;
              }
              return '';
            };

            const searchInSheet = (sheetData: Record<string, string | undefined>[], eventId: string, eventTitle: string) => {
              if (!sheetData || sheetData.length === 0) return null;
              
              const row = sheetData.find(r => {
                const rowTicketId = getField(r, 'Ticket ID', 'ticketId', 'ticket_id', 'TicketID');
                return rowTicketId.trim().toUpperCase() === targetId;
              });
              
              if (row) {
                const fullName = getField(row, 'Full Name', 'fullName', 'Name', 'name');
                const email = getField(row, 'Email', 'email', 'Email Address');
                const phone = getField(row, 'Phone Number', 'phone', 'Phone', 'Mobile');
                const year = getField(row, 'Year of Study / Status', 'yearOfStudy', 'Year', 'year');
                const college = getField(row, 'College / Organization', 'college', 'College', 'Organization');
                const dept = getField(row, 'Department / Branch', 'department', 'branch', 'Department', 'Branch');
                const timestamp = getField(row, 'Timestamp', 'timestamp');

                return {
                  eventId,
                  eventTitle,
                  fullName: fullName || 'Student',
                  email,
                  phone,
                  yearOfStudy: year,
                  year,
                  college,
                  department: dept,
                  branch: dept,
                  ticketId: targetId,
                  timestamp: timestamp || new Date().toISOString()
                } as unknown as RegistrationPayload;
              }
              return null;
            };

            foundTicket = 
              searchInSheet(data.genAI as Record<string, string | undefined>[], 'ai-bootcamp-01', 'Generative AI Masterclass') ||
              searchInSheet(data.pythonAI as Record<string, string | undefined>[], 'python-bootcamp-02', 'Python with AI Bootcamp') ||
              searchInSheet(data.gitGitHub as Record<string, string | undefined>[], 'git-github-03', 'Git & GitHub Bootcamp') ||
              searchInSheet(data.javaAI as Record<string, string | undefined>[], 'java-bootcamp-04', 'Java with AI Bootcamp');
          }

          if (foundTicket) {
            setReg(foundTicket);
          }
        } catch (error) {
          console.error("Error fetching pass:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchTicket();
    } else {
      setLoading(false);
    }
  }, [reg, ticketId]);

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
    <div className="min-h-screen bg-gray-100 py-4 sm:py-8 px-2 sm:px-4 flex flex-col font-sans">
      <SEO 
        title="Event Pass - Kaizen Q Events"
        description="Your official Kaizen Q Events registration pass"
      />
      
      {/* Controls - Hidden when printing */}
      <div className="max-w-lg sm:max-w-2xl mx-auto w-full mb-6 flex justify-between items-center print:hidden px-2 sm:px-0">
        <a 
          href={user ? '/dashboard' : '/'}
          className="flex items-center gap-2 px-4 py-2 bg-white border rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 font-medium"
        >
          <ArrowLeft size={16} /> <span className="hidden sm:inline">{user ? 'Back to Dashboard' : 'Go to Home'}</span><span className="sm:hidden">Back</span>
        </a>
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={async () => {
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: 'Kaizen Q Events Pass',
                    text: `Check out my event pass for ${reg.eventTitle}!`,
                    url: window.location.href,
                  });
                } catch (err) {
                  console.error('Error sharing:', err);
                }
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }
            }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg shadow-sm hover:bg-blue-100 font-medium transition-colors"
          >
            <Share2 size={16} /> <span className="hidden sm:inline">Share Pass</span><span className="sm:hidden">Share</span>
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 sm:px-6 py-2 text-white rounded-lg shadow font-medium bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <Printer size={16} /> Print Pass
          </button>
        </div>
      </div>

      {/* The Ticket / Pass - optimized for A4 */}
      <div id="ticket-content" className="ticket-container bg-white w-full max-w-lg sm:max-w-[210mm] sm:min-h-[297mm] shadow-2xl print:shadow-none print:w-full print:min-h-0 print:m-0 mx-auto relative overflow-hidden border border-gray-200">
        
        {/* Top Header */}
        <div className="bg-[linear-gradient(135deg,#FFD700,#FFA500,#2563EB,#16A34A)] text-white p-10 flex flex-col items-center justify-center relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-transparent to-transparent"></div>
          <div className="flex items-center justify-center mb-6 relative z-10 bg-white rounded-xl p-4 shadow-sm">
            <img 
              src="https://res.cloudinary.com/dwv8kc9vb/image/upload/v1788465282/KAIZEN_Q_EVENTS_kxjtz4.png" 
              alt="Kaizen Q Events Logo" 
              crossOrigin="anonymous"
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
              <QRCodeCanvas 
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
