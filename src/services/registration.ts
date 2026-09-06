// ============================================================
// Registration Service & Google Sheet Integration
// ============================================================

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
}

// Master Google Sheet & Service Account Configuration
export const MASTER_SPREADSHEET_ID = '1UmbReGn98Wh5uVG9U_CznBEklF4Xokq-fUG87NyE8bM';
export const MASTER_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1UmbReGn98Wh5uVG9U_CznBEklF4Xokq-fUG87NyE8bM/edit?gid=1020517039#gid=1020517039';
export const SERVICE_ACCOUNT_EMAIL = 'kqe-backend@shaivika-lms-ai.iam.gserviceaccount.com';
const BACKEND_URL = 'http://localhost:5000';

// Default Webhook URLs for each of the 4 events
const DEFAULT_WEBHOOK_URLS: Record<string, string> = {
  'evt-001': 'https://script.google.com/macros/s/AKfycbwhD783CrBrROpDWeM9HvGPr4k-GtdDd5qRLJ6p33ZGKqGx6gPZ35kZWxfF0A3BAlHRkg/exec',
  'evt-002': 'https://script.google.com/macros/s/AKfycbyK4enFPCsbcm_r9m2Ed_ojqoB_AqGlObq2B6SEsvGfI__OIQvu6-BU_h0tPAM_wTM_hA/exec',
  'evt-003': 'https://script.google.com/macros/s/AKfycbz1T30uvSEc5TPxUjHbBvO9Fl4kBV9-bp95r82qyEr8PSwGbPfgc7-ouw6KvuH3PAEs/exec',
  'evt-004': 'https://script.google.com/macros/s/AKfycbxcoxeqDzv8XUu-vYGmtTTTja_NKg5Ij8Lm5fVQ-zy-o9b9TtmH1IxeYfyltb5CeBh6/exec',
};

export const registrationService = {
  /**
   * Get Webhook URL for a specific event ID
   */
  getEventWebhookUrl: (eventId: string): string => {
    return localStorage.getItem(`kqe_sheet_url_${eventId}`) || DEFAULT_WEBHOOK_URLS[eventId] || '';
  },

  /**
   * Set Webhook URL for a specific event ID
   */
  setEventWebhookUrl: (eventId: string, url: string): void => {
    localStorage.setItem(`kqe_sheet_url_${eventId}`, url);
  },

  /**
   * Get all 4 event Webhook URLs
   */
  getAllEventWebhookUrls: (): Record<string, string> => {
    return {
      'evt-001': registrationService.getEventWebhookUrl('evt-001'),
      'evt-002': registrationService.getEventWebhookUrl('evt-002'),
      'evt-003': registrationService.getEventWebhookUrl('evt-003'),
      'evt-004': registrationService.getEventWebhookUrl('evt-004'),
    };
  },

  /**
   * Set all 4 event Webhook URLs at once
   */
  setAllEventWebhookUrls: (urls: Record<string, string>): void => {
    Object.entries(urls).forEach(([evtId, url]) => {
      localStorage.setItem(`kqe_sheet_url_${evtId}`, url);
    });
  },

  /**
   * Fetch registered bootcamps for a specific user email from Google Sheets & Backend
   */
  getUserRegistrations: async (email: string): Promise<RegistrationPayload[]> => {
    if (!email) return [];
    try {
      const res = await fetch(`${BACKEND_URL}/api/user/registrations?email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.registrations)) {
          // Cache in localStorage for this user
          localStorage.setItem(`kqe_user_regs_${email.toLowerCase()}`, JSON.stringify(data.registrations));
          return data.registrations;
        }
      }
    } catch (err) {
      console.warn('Backend user registrations fetch fallback:', err);
    }

    // Fallback to local storage
    try {
      const cached = localStorage.getItem(`kqe_user_regs_${email.toLowerCase()}`);
      if (cached) return JSON.parse(cached);
      const all: RegistrationPayload[] = JSON.parse(localStorage.getItem('kqe_registrations') || '[]');
      return all.filter((r) => r.email?.toLowerCase() === email.toLowerCase());
    } catch {
      return [];
    }
  },

  /**
   * Submit registration to backend (Google Sheets service account) and Apps Script Webhook
   */
  submitRegistration: async (data: RegistrationPayload): Promise<{ success: boolean; message: string }> => {
    const payload: RegistrationPayload = {
      ...data,
      timestamp: new Date().toISOString(),
    };

    // 1. Post to Backend (Direct Google Sheets Service Account)
    try {
      const response = await fetch(`${BACKEND_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        console.log('✅ Registration saved to Google Sheets via backend service account');
      }
    } catch (err) {
      console.warn('Backend registration API note:', err);
    }

    // 2. Also trigger Google Apps Script Webhook if configured
    const webhookUrl = registrationService.getEventWebhookUrl(data.eventId);
    if (webhookUrl && webhookUrl.trim() !== '') {
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn(`Webhook note for ${data.eventId}:`, err);
      }
    }

    // 3. Store in localStorage
    try {
      const existing: RegistrationPayload[] = JSON.parse(localStorage.getItem('kqe_registrations') || '[]');
      existing.unshift(payload);
      localStorage.setItem('kqe_registrations', JSON.stringify(existing));

      if (data.email) {
        const userKey = `kqe_user_regs_${data.email.toLowerCase()}`;
        const userRegs: RegistrationPayload[] = JSON.parse(localStorage.getItem(userKey) || '[]');
        userRegs.unshift(payload);
        localStorage.setItem(userKey, JSON.stringify(userRegs));
      }
    } catch {
      // Ignore storage errors
    }

    return { success: true, message: `Registration confirmed for ${data.eventTitle}!` };
  },

  getRegistrationsForEvent: (eventId: string): RegistrationPayload[] => {
    try {
      const existing: RegistrationPayload[] = JSON.parse(localStorage.getItem('kqe_registrations') || '[]');
      return existing.filter((r) => r.eventId === eventId);
    } catch {
      return [];
    }
  },
};
