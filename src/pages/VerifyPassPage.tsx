import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { GoogleSheetsService } from '../services/googleSheetsService';
import { SEO } from '../components/SEO';
import { CheckCircle2, XCircle, AlertTriangle, ArrowLeft, BadgeCheck } from 'lucide-react';

interface VerifiedTicket {
  eventId: string;
  eventTitle: string;
  fullName: string;
  email: string;
  ticketId: string;
  status: string; // Active, Cancelled
  timestamp?: string;
}

export const VerifyPassPage: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<VerifiedTicket | null>(null);

  useEffect(() => {
    async function verifyTicket() {
      if (!ticketId) {
        setLoading(false);
        return;
      }

      try {
        const data = await GoogleSheetsService.getAllDashboardData();
        
        let foundTicket: VerifiedTicket | null = null;
        const targetId = ticketId.trim().toUpperCase();

        const searchInSheet = (sheetData: any[], eventId: string, eventTitle: string) => {
          for (const row of sheetData) {
            const ticketKey = Object.keys(row).find(k => k.toLowerCase().includes('ticket'));
            if (ticketKey && row[ticketKey]?.trim().toUpperCase() === targetId) {
              const emailKey = Object.keys(row).find(k => k.toLowerCase().includes('email'));
              return {
                eventId,
                eventTitle,
                fullName: row['Full Name'] || row['Name'] || 'Student',
                email: emailKey ? row[emailKey] : '',
                ticketId: targetId,
                status: row['Status'] || 'CONFIRMED',
                timestamp: row['Timestamp']
              } as VerifiedTicket;
            }
          }
          return null;
        };

        foundTicket = 
          searchInSheet(data.genAI, 'generative-ai-masterclass', 'Generative AI Masterclass') ||
          searchInSheet(data.pythonAI, 'python-with-ai-bootcamp', 'Python with AI Bootcamp') ||
          searchInSheet(data.gitGitHub, 'git-and-github-bootcamp', 'Git & GitHub Bootcamp') ||
          searchInSheet(data.javaAI, 'java-with-ai-masterclass', 'Java with AI Bootcamp');

        setTicket(foundTicket);
      } catch (err) {
        console.error('Verification error:', err);
      } finally {
        setLoading(false);
      }
    }

    verifyTicket();
  }, [ticketId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying Pass...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <SEO title="Verify Event Pass" noindex={true} description="Event Pass Verification" />
      
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-blue-600 text-3xl font-black tracking-tighter">{"<K>"}</span>
              <span className="text-xl font-bold tracking-tight text-gray-900">KAIZEN Q EVENTS</span>
            </div>
          </Link>
          <h1 className="text-lg font-medium text-gray-500 uppercase tracking-widest">Pass Verification System</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          {ticket ? (
            ticket.status.toUpperCase() === 'CANCELLED' ? (
              <div className="p-8 text-center bg-amber-50 border-b border-amber-100">
                <AlertTriangle size={64} className="text-amber-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-amber-700">CANCELLED PASS</h2>
                <p className="text-amber-600 mt-2">This pass was cancelled and is no longer valid.</p>
              </div>
            ) : (
              <div className="p-8 text-center bg-green-50 border-b border-green-100">
                <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-700">VALID EVENT PASS</h2>
                <p className="text-green-600 mt-2">This pass is active and verified.</p>
              </div>
            )
          ) : (
            <div className="p-8 text-center bg-red-50 border-b border-red-100">
              <XCircle size={64} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-700">INVALID EVENT PASS</h2>
              <p className="text-red-600 mt-2">We could not find a valid registration for this pass ID.</p>
            </div>
          )}

          {ticket && (
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Participant</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-gray-900">{ticket.fullName}</p>
                    <BadgeCheck className="text-blue-500" size={20} />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Pass ID</p>
                  <p className="text-lg font-mono font-bold text-gray-900">{ticket.ticketId}</p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Event</p>
                  <p className="text-lg font-semibold text-gray-900">{ticket.eventTitle}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Status</p>
                  <p className="text-lg font-semibold text-gray-900">{ticket.status}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Admission</p>
                  <p className="text-lg font-semibold text-green-600">FREE</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
            <ArrowLeft size={16} /> Return to Kaizen Q Events
          </Link>
        </div>
      </div>
    </div>
  );
};
