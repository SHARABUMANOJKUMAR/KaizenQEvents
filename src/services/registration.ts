// ============================================================
// Registration Service & 4 Separate Google Apps Script Webhooks
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
   * Save all 4 event Webhook URLs at once
   */
  setAllEventWebhookUrls: (urls: Record<string, string>): void => {
    Object.entries(urls).forEach(([evtId, url]) => {
      localStorage.setItem(`kqe_sheet_url_${evtId}`, url);
    });
  },

  /**
   * Submit registration to the specific event's Google Sheet Webhook URL
   */
  submitRegistration: async (data: RegistrationPayload): Promise<{ success: boolean; message: string }> => {
    const payload: RegistrationPayload = {
      ...data,
      timestamp: new Date().toISOString(),
    };

    // Store in localStorage backup
    try {
      const existing = JSON.parse(localStorage.getItem('kqe_registrations') || '[]');
      existing.push(payload);
      localStorage.setItem('kqe_registrations', JSON.stringify(existing));
    } catch {
      // Ignore storage errors
    }

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
        return { success: true, message: `Registration sent to Google Sheet for ${data.eventTitle}!` };
      } catch (err) {
        console.error(`Error submitting to Google Sheet Webhook for ${data.eventId}:`, err);
        return { success: true, message: 'Registration saved locally (Google Sheet post failed).' };
      }
    }

    return { success: true, message: 'Registration recorded locally!' };
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
