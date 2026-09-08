import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';

// ============================================================
// Registration Service (High-Scale Firestore Implementation)
// ============================================================

const EVENT_WEBHOOKS: Record<string, string> = {
  'evt-001': 'https://script.google.com/macros/s/AKfycbySfa02cR53F4uyoJDLzW6Az6RGlXrL8AeC9BvNX3NmGEXiPFam8aO4PIg_RurA7VmioA/exec',
  'evt-002': 'https://script.google.com/macros/s/AKfycbxcoxeqDzv8XUu-vYGmtTTTja_NKg5Ij8Lm5fVQ-zy-o9b9TtmH1IxeYfyltb5CeBh6/exec',
  'evt-003': 'https://script.google.com/macros/s/AKfycbyK4enFPCsbcm_r9m2Ed_ojqoB_AqGlObq2B6SEsvGfI__OIQvu6-BU_h0tPAM_wTM_hA/exec',
  'evt-004': 'https://script.google.com/macros/s/AKfycbz1T30uvSEc5TPxUjHbBvO9Fl4kBV9-bp95r82qyEr8PSwGbPfgc7-ouw6KvuH3PAEs/exec',
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
   * Fetch registered bootcamps for a specific user email from Firestore
   */
  getUserRegistrations: async (email: string): Promise<RegistrationPayload[]> => {
    if (!email) return [];
    
    try {
      const regsRef = collection(db, 'registrations');
      const q = query(
        regsRef, 
        where('email', '==', email.toLowerCase())
      );
      
      const snapshot = await getDocs(q);
      const registrations: RegistrationPayload[] = [];
      
      snapshot.forEach((doc) => {
        registrations.push(doc.data() as RegistrationPayload);
      });
      
      // Sort by timestamp descending (client side since Firestore needs index for multiple fields)
      return registrations.sort((a, b) => {
        const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return timeB - timeA;
      });

    } catch (err) {
      console.error('Error fetching user registrations from Firestore:', err);
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
      // 1. High-throughput write to Firestore (Non-blocking / Optimistic UI)
      addDoc(collection(db, 'registrations'), payload).catch((err) => {
        console.error('Background Firestore sync failed:', err);
      });
      
      // 1.5 Send to Google Sheets via Webhook (Non-blocking)
      const webhookUrl = EVENT_WEBHOOKS[data.eventId];
      if (webhookUrl) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(payload),
        }).catch((err) => console.error('Failed to sync to Google Sheets:', err));
      }
      
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
