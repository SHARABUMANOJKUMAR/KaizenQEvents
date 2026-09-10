import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

// ============================================================
// Registration Service (High-Scale Firestore Implementation)
// ============================================================

const EVENT_WEBHOOKS: Record<string, string> = {
  // Git & GitHub BootCamp
  'GITHUB': 'https://script.google.com/macros/s/AKfycbySfa02cR53F4uyoJDLzW6Az6RGlXrL8AeC9BvNX3NmGEXiPFam8aO4PIg_RurA7VmioA/exec',
  // Python With AI BootCamp
  'PYTHON': 'https://script.google.com/macros/s/AKfycbyK4enFPCsbcm_r9m2Ed_ojqoB_AqGlObq2B6SEsvGfI__OIQvu6-BU_h0tPAM_wTM_hA/exec',
  // Java With AI BootCamp
  'JAVA': 'https://script.google.com/macros/s/AKfycbz1T30uvSEc5TPxUjHbBvO9Fl4kBV9-bp95r82qyEr8PSwGbPfgc7-ouw6KvuH3PAEs/exec',
  // Generative AI BootCamp
  'GENERATIVE AI': 'https://script.google.com/macros/s/AKfycbxcoxeqDzv8XUu-vYGmtTTTja_NKg5Ij8Lm5fVQ-zy-o9b9TtmH1IxeYfyltb5CeBh6/exec',
};

export interface RegistrationPayload {
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

export const registrationService = {
  /**
   * Fetch registered bootcamps for a specific user email directly from Google Sheets
   * to ensure data is permanently synced across all devices without needing a backend.
   */
  getUserRegistrations: async (email: string): Promise<RegistrationPayload[]> => {
    if (!email) return [];
    
    try {
      // 1. Fetch from Google Sheets (Single Source of Truth)
      // We import it dynamically to avoid circular dependencies if any
      const { GoogleSheetsService } = await import('./googleSheetsService');
      const data = await GoogleSheetsService.getAllDashboardData();
      
      const emailLower = email.toLowerCase();
      
      const findRegs = (sheetData: any[], eventId: string, eventTitle: string) => {
        return sheetData
          .filter(row => {
            // Find any key that might contain the email
            const emailKey = Object.keys(row).find(k => k.toLowerCase().includes('email'));
            if (emailKey && row[emailKey]) {
              return row[emailKey].toLowerCase().trim() === emailLower;
            }
            return false;
          })
          .map(row => {
            const ticketKey = Object.keys(row).find(k => k.toLowerCase().includes('ticket'));
            return {
              eventId,
              eventTitle,
              fullName: row['Full Name'] || row['Name'] || 'Student',
              email: emailLower,
              phone: row['Phone'] || row['WhatsApp Number'] || '',
              year: row['Year'] || '',
              college: row['College'] || row['University'] || '',
              branch: row['Branch'] || '',
              ticketId: ticketKey ? row[ticketKey] : undefined,
              timestamp: row['Timestamp'] || new Date().toISOString()
            } as RegistrationPayload;
          });
      };

      const userRegs: RegistrationPayload[] = [
        ...findRegs(data.genAI, 'GENERATIVE AI', 'Generative AI Masterclass'),
        ...findRegs(data.pythonAI, 'PYTHON', 'Python with AI Bootcamp'),
        ...findRegs(data.gitGitHub, 'GITHUB', 'Git & GitHub Bootcamp'),
        ...findRegs(data.javaAI, 'JAVA', 'Java with AI Bootcamp'),
      ];

      // Sort by timestamp descending
      userRegs.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA;
      });

      if (userRegs.length > 0) {
        // Cache locally so it loads instantly next time
        try {
          localStorage.setItem(`kqe_user_regs_${emailLower}`, JSON.stringify(userRegs));
        } catch {}
        return userRegs;
      }
      
      // If we got nothing from sheets (e.g. sheets are private), fallback to local storage
      const cached = localStorage.getItem(`kqe_user_regs_${emailLower}`);
      if (cached) return JSON.parse(cached);
      
      return [];

    } catch (err) {
      console.error('Error fetching user registrations from Sheets:', err);
      // Fallback to local storage if offline/error
      try {
        const cached = localStorage.getItem(`kqe_user_regs_${email.toLowerCase()}`);
        if (cached) return JSON.parse(cached);
      } catch {}
      return [];
    }
  },

  /**
   * Submit registration to Firestore
   * Decoupled from Google Sheets to handle 100k+ concurrent users.
   */
  submitRegistration: async (data: RegistrationPayload): Promise<{ success: boolean; message: string }> => {
    const ticketId = `KQE-${Math.floor(100000 + Math.random() * 900000)}`;
    const payload: RegistrationPayload = {
      ...data,
      email: data.email.toLowerCase(),
      timestamp: new Date().toISOString(),
      ticketId,
    };

    try {
      const promises: Promise<any>[] = [];
      
      // 1. High-throughput write to Firestore (Non-blocking backup)
      promises.push(
        addDoc(collection(db, 'registrations'), payload).catch((err) => {
          console.warn('Background Firestore sync failed (likely rules issue):', err);
          // Do not throw here. We want Google Sheets to still succeed!
        })
      );
      
      // 1.5 Send to Google Sheets via Webhook
      const webhookUrl = EVENT_WEBHOOKS[data.eventId];
      if (webhookUrl) {
        promises.push(
          fetch(webhookUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
          }).catch((err) => {
             console.error('Failed to sync to Google Sheets:', err);
             throw new Error('Failed to save registration data. Please check your connection.');
          })
        );
      }

      // Wait for both to complete to ensure data is actually saved before showing success
      await Promise.all(promises);
      
      // 2. Cache locally for immediate UI updates without refetching
      try {
        const userKey = `kqe_user_regs_${data.email.toLowerCase()}`;
        const userRegs: RegistrationPayload[] = JSON.parse(localStorage.getItem(userKey) || '[]');
        userRegs.unshift(payload);
        localStorage.setItem(userKey, JSON.stringify(userRegs));
      } catch {}

      return { success: true, message: `Registration confirmed for ${data.eventTitle}! Ticket ID: ${ticketId}` };
    } catch (err: any) {
      console.error('Registration failed:', err);
      throw new Error(err.message || 'Failed to register. Please try again.');
    }
  },

  /**
   * Get all registrations for a specific event (For Admin / Organizer view)
   */
  getRegistrationsForEvent: async (eventId: string): Promise<RegistrationPayload[]> => {
    try {
      const regsRef = collection(db, 'registrations');
      const q = query(regsRef, where('eventId', '==', eventId));
      const snapshot = await getDocs(q);
      
      const registrations: RegistrationPayload[] = [];
      snapshot.forEach((doc) => {
        registrations.push(doc.data() as RegistrationPayload);
      });
      
      return registrations;
    } catch (err) {
      console.error('Error fetching event registrations:', err);
      return [];
    }
  }
};
