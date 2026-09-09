import React, { useEffect, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import type { RegistrationPayload } from '../services/registration';
import type { Event } from '../types';
import { formatDateRange } from '../utils';
import { SEO } from '../components/SEO';
import { CheckCircle2, Award, Printer, ArrowLeft, Share2, Download } from 'lucide-react';
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
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

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
          <ArrowLeft size={16} />
          <span className="hidden sm:inline">{user ? 'Back to Dashboard' : 'Go to Home'}</span>
          <span className="sm:hidden">Back</span>
        </a>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Share Pass */}
          <button 
            title="Share Pass"
            onClick={async () => {
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: 'Kaizen Q Events Pass',
                    text: `My event pass for ${reg.eventTitle} — Kaizen Q Events`,
                    url: window.location.href,
                  });
                } catch (_) { /* user cancelled */ }
              } else {
                await navigator.clipboard.writeText(window.location.href);
                alert('Pass link copied to clipboard!');
              }
            }}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg shadow-sm hover:bg-blue-100 font-medium transition-colors"
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Print Pass */}
          <button 
            title="Get a Pass"
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-50 text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-100 font-medium transition-colors"
          >
            <Printer size={16} />
            <span className="hidden sm:inline">Get a Pass</span>
          </button>

          {/* Download PDF */}
          <button 
            title="Download PDF"
            disabled={isPdfGenerating}
            onClick={async () => {
              if (isPdfGenerating) return;
              setIsPdfGenerating(true);
              try {
                const { jsPDF } = await import('jspdf');

                const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                const W = 210; // A4 width mm

                // ── HEADER gradient (orange → blue) ──
                for (let i = 0; i < 60; i++) {
                  const r = Math.round(255 - (255 - 37)  * (i / 60));
                  const g = Math.round(165 - (165 - 99) * (i / 60));
                  const b = Math.round(0   + (235 - 0)  * (i / 60));
                  pdf.setFillColor(r, g, b);
                  pdf.rect(0, i, W, 1, 'F');
                }

                // ── Logo ──
                try {
                  const logoRes = await fetch(
                    'https://res.cloudinary.com/dwv8kc9vb/image/upload/v1788465282/KAIZEN_Q_EVENTS_kxjtz4.png',
                    { mode: 'cors' }
                  );
                  if (logoRes.ok) {
                    const blob = await logoRes.blob();
                    const reader = new FileReader();
                    const logoBase64: string = await new Promise((res) => {
                      reader.onload = () => res(reader.result as string);
                      reader.readAsDataURL(blob);
                    });
                    // White box behind logo
                    pdf.setFillColor(255, 255, 255);
                    pdf.roundedRect(W / 2 - 28, 8, 56, 30, 3, 3, 'F');
                    pdf.addImage(logoBase64, 'PNG', W / 2 - 26, 9, 52, 28);
                  }
                } catch (_) { /* logo fetch failed — skip */ }

                // OFFICIAL EVENT PASS label
                pdf.setFontSize(9);
                pdf.setTextColor(255, 255, 255);
                pdf.setFont('helvetica', 'bold');
                pdf.text('OFFICIAL EVENT PASS', W / 2, 50, { align: 'center' });
                // Underline
                pdf.setDrawColor(255, 255, 255);
                pdf.setLineWidth(0.5);
                pdf.line(W / 2 - 12, 52, W / 2 + 12, 52);

                // ── BODY ──
                let y = 70;

                // "THIS IS YOUR EVENT PASS" label
                pdf.setFontSize(7);
                pdf.setTextColor(160, 160, 160);
                pdf.setFont('helvetica', 'bold');
                pdf.text('THIS IS YOUR EVENT PASS', W / 2, y, { align: 'center' });
                y += 8;

                // Category badges
                const cat = reg.eventTitle?.toUpperCase().includes('PYTHON') ? 'BOOTCAMP' :
                            reg.eventTitle?.toUpperCase().includes('JAVA')   ? 'BOOTCAMP' :
                            reg.eventTitle?.toUpperCase().includes('GIT')    ? 'BOOTCAMP' : 'TECH EVENT';
                pdf.setFontSize(7);
                pdf.setFillColor(239, 246, 255);
                pdf.setDrawColor(191, 219, 254);
                pdf.setTextColor(29, 78, 216);
                pdf.roundedRect(W / 2 - 30, y - 3.5, 24, 6, 1.5, 1.5, 'FD');
                pdf.text(cat, W / 2 - 18, y + 0.5, { align: 'center' });

                pdf.setFillColor(240, 253, 244);
                pdf.setDrawColor(187, 247, 208);
                pdf.setTextColor(21, 128, 61);
                pdf.roundedRect(W / 2 + 6, y - 3.5, 30, 6, 1.5, 1.5, 'FD');
                pdf.text('5 DAYS BOOTCAMP', W / 2 + 21, y + 0.5, { align: 'center' });
                y += 12;

                // Event Title
                pdf.setFontSize(20);
                pdf.setTextColor(17, 24, 39);
                pdf.setFont('helvetica', 'bold');
                const titleLines = pdf.splitTextToSize(reg.eventTitle || 'Event', W - 40);
                pdf.text(titleLines, W / 2, y, { align: 'center' });
                y += titleLines.length * 10 + 4;

                // Divider
                pdf.setDrawColor(229, 231, 235);
                pdf.setLineWidth(0.3);
                pdf.line(20, y, W - 20, y);
                y += 8;

                // Event Details row
                const col1 = 25, col2 = W / 2 + 5;
                const labelColor: [number, number, number] = [156, 163, 175];
                const valueColor: [number, number, number] = [17, 24, 39];

                const printLabel = (label: string, x: number, yy: number) => {
                  pdf.setFontSize(7); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(...labelColor);
                  pdf.text(label, x, yy);
                };
                const printValue = (val: string, x: number, yy: number) => {
                  pdf.setFontSize(11); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(...valueColor);
                  pdf.text(val, x, yy);
                };

                printLabel('DATE', col1, y);
                printLabel('TIME', col2, y);
                y += 4;
                printValue(reg.eventTitle?.toLowerCase().includes('git') ? 'See Event Page' : 'See Event Page', col1, y);
                printValue('06:00 PM - 07:30 PM', col2, y);
                y += 8;

                printLabel('MODE', col1, y); y += 4;
                printValue('Online Live Workshop (Google Meet / Zoom)', col1, y); y += 8;

                // Divider
                pdf.setDrawColor(229, 231, 235);
                pdf.line(20, y, W - 20, y);
                y += 8;

                // Participant Details
                printLabel('ISSUED TO', col1, y); y += 4;
                pdf.setFontSize(16); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(17, 24, 39);
                pdf.text(reg.fullName || 'Student', col1, y); y += 6;
                pdf.setFontSize(10); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(75, 85, 99);
                pdf.text(reg.email || '', col1, y);
                if (reg.phone) { y += 5; pdf.setFontSize(9); pdf.text(reg.phone, col1, y); }
                
                // Pass ID (right column)
                const passIdY = y - 10;
                printLabel('PASS ID', col2, passIdY);
                pdf.setFillColor(243, 244, 246);
                pdf.setDrawColor(229, 231, 235);
                pdf.roundedRect(col2 - 2, passIdY + 2, 65, 10, 2, 2, 'FD');
                pdf.setFontSize(12); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(17, 24, 39);
                pdf.text(ticketId || '', col2 + 1, passIdY + 9);

                y += 10;

                // Divider
                pdf.setDrawColor(229, 231, 235);
                pdf.line(20, y, W - 20, y);
                y += 8;

                // ── QR Code ──
                const qrCanvas = document.querySelector<HTMLCanvasElement>('canvas');
                if (qrCanvas) {
                  const qrData = qrCanvas.toDataURL('image/png');
                  const qrSize = 45;
                  const qrX = W / 2 - qrSize / 2;
                  // White border box
                  pdf.setFillColor(255, 255, 255);
                  pdf.setDrawColor(243, 244, 246);
                  pdf.roundedRect(qrX - 3, y - 3, qrSize + 6, qrSize + 6, 3, 3, 'FD');
                  pdf.addImage(qrData, 'PNG', qrX, y, qrSize, qrSize);
                  y += qrSize + 8;
                }

                // Scan to verify label
                pdf.setFontSize(7); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(107, 114, 128);
                pdf.text('SCAN TO VERIFY', W / 2, y, { align: 'center' });
                y += 10;

                // Status badges
                const badgeY = y;
                // Verified
                pdf.setFillColor(240, 253, 244); pdf.setDrawColor(187, 247, 208);
                pdf.roundedRect(W / 2 - 75, badgeY, 65, 10, 2, 2, 'FD');
                pdf.setFontSize(8); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(21, 128, 61);
                pdf.text('✓ Verified Registration', W / 2 - 42, badgeY + 6.5, { align: 'center' });
                // Certificate
                pdf.setFillColor(239, 246, 255); pdf.setDrawColor(191, 219, 254);
                pdf.roundedRect(W / 2 + 10, badgeY, 65, 10, 2, 2, 'FD');
                pdf.setFontSize(8); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(29, 78, 216);
                pdf.text('★ Digital Certificate Included', W / 2 + 42, badgeY + 6.5, { align: 'center' });

                // ── FOOTER ──
                pdf.setFillColor(249, 250, 251);
                pdf.rect(0, 282, W, 15, 'F');
                pdf.setDrawColor(229, 231, 235);
                pdf.line(0, 282, W, 282);
                pdf.setFontSize(8); pdf.setFont('helvetica', 'bold'); pdf.setTextColor(17, 24, 39);
                pdf.text('FREE ADMISSION', W / 2, 288, { align: 'center' });
                pdf.setFontSize(7); pdf.setFont('helvetica', 'normal'); pdf.setTextColor(156, 163, 175);
                pdf.text('© 2026 Kaizen Q Events • Official Event Registration Pass', W / 2, 293, { align: 'center' });

                pdf.save(`Kaizen_Event_Pass_${ticketId}.pdf`);
              } catch (err) {
                console.error('PDF generation failed', err);
                alert("PDF generation failed. Opening print dialog instead — choose 'Save as PDF'.");
                window.print();
              } finally {
                setIsPdfGenerating(false);
              }
            }}
            className={`flex items-center gap-2 px-3 sm:px-5 py-2 text-white rounded-lg shadow font-medium transition-colors ${isPdfGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            <Download size={16} />
            <span>{isPdfGenerating ? 'Generating…' : 'Download PDF'}</span>
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
              <p className="text-lg text-gray-600 font-medium">Instructor: {event.speakers?.[0]?.name ?? event.organizers?.[0]?.name}</p>
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
