import { collection, addDoc, getDocs, query, where, setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

export type OverrideAction = 'DELETE' | 'UPDATE';

export interface AdminOverride {
  bootcampTitle: string;
  email: string;
  timestamp: string;
  action: OverrideAction;
  payload?: any;
}

export const adminOverrideService = {
  /**
   * Save an override (delete or update) to Firestore.
   * We use a composite key of bootcampTitle_email_timestamp to ensure idempotency.
   */
  saveOverride: async (
    bootcampTitle: string, 
    email: string, 
    timestamp: string, 
    action: OverrideAction, 
    payload?: any
  ): Promise<void> => {
    try {
      const emailLower = (email || '').toLowerCase().trim();
      const safeTimestamp = (timestamp || '').trim();
      
      if (!emailLower) {
        console.warn('Cannot save override without email');
        return;
      }
      
      // Use a consistent ID so multiple updates just overwrite the same override document
      const docId = `${bootcampTitle}_${emailLower}_${safeTimestamp}`.replace(/[^a-zA-Z0-9_]/g, '_');
      
      const overrideData: AdminOverride = {
        bootcampTitle,
        email: emailLower,
        timestamp: safeTimestamp,
        action,
        payload,
      };

      await setDoc(doc(db, 'admin_overrides', docId), overrideData);
    } catch (err) {
      console.error('Failed to save admin override:', err);
      throw new Error('Failed to permanently save the change. Please check your connection.');
    }
  },

  /**
   * Fetch all overrides for a specific bootcamp.
   */
  getOverrides: async (bootcampTitle: string): Promise<AdminOverride[]> => {
    try {
      const q = query(
        collection(db, 'admin_overrides'),
        where('bootcampTitle', '==', bootcampTitle)
      );
      
      const snapshot = await getDocs(q);
      const overrides: AdminOverride[] = [];
      
      snapshot.forEach((doc) => {
        overrides.push(doc.data() as AdminOverride);
      });
      
      return overrides;
    } catch (err) {
      console.error('Failed to fetch admin overrides:', err);
      return [];
    }
  },

  /**
   * Apply overrides to a raw list of registrations
   */
  applyOverrides: (rawRegistrations: any[], overrides: AdminOverride[]): any[] => {
    let processed = [...rawRegistrations];

    // Filter out deletes first
    const deletedKeys = new Set(
      overrides
        .filter(o => o.action === 'DELETE')
        .map(o => `${o.email}_${o.timestamp}`)
    );

    processed = processed.filter(reg => {
      const email = (reg.Email || reg['Email Address'] || '').toLowerCase().trim();
      const timestamp = (reg.Timestamp || '').trim();
      return !deletedKeys.has(`${email}_${timestamp}`);
    });

    // Apply updates
    const updates = overrides.filter(o => o.action === 'UPDATE');
    
    processed = processed.map(reg => {
      const email = (reg.Email || reg['Email Address'] || '').toLowerCase().trim();
      const timestamp = (reg.Timestamp || '').trim();
      
      const update = updates.find(u => u.email === email && u.timestamp === timestamp);
      
      if (update && update.payload) {
        return { ...reg, ...update.payload };
      }
      
      return reg;
    });

    return processed;
  }
};
