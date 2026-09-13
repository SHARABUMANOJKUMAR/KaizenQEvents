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

      try {
        await setDoc(doc(db, 'admin_overrides', docId), overrideData);
      } catch (err) {
        console.warn('Firestore save failed (likely rules issue). Falling back to local storage.', err);
      }
      
      // Always save to local storage as fallback/cache
      try {
        const localKey = `kqe_admin_overrides_${bootcampTitle.replace(/[^a-zA-Z0-9_]/g, '_')}`;
        const existing = JSON.parse(localStorage.getItem(localKey) || '[]');
        // Remove existing override for this docId to avoid duplicates
        const updated = existing.filter((o: any) => o._docId !== docId);
        updated.push({ ...overrideData, _docId: docId });
        localStorage.setItem(localKey, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save to local storage', e);
        throw new Error('Failed to permanently save the change. Please check your browser settings.');
      }
    } catch (err) {
      console.error('Failed to process admin override:', err);
      throw new Error('Failed to permanently save the change. Please try again.');
    }
  },

  /**
   * Fetch all overrides for a specific bootcamp.
   */
  getOverrides: async (bootcampTitle: string): Promise<AdminOverride[]> => {
    let overrides: AdminOverride[] = [];
    
    // Try fetch from Firestore
    try {
      const q = query(
        collection(db, 'admin_overrides'),
        where('bootcampTitle', '==', bootcampTitle)
      );
      
      const snapshot = await getDocs(q);
      
      snapshot.forEach((doc) => {
        overrides.push(doc.data() as AdminOverride);
      });
    } catch (err) {
      console.warn('Failed to fetch admin overrides from Firestore (rules issue?):', err);
    }
    
    // Merge from local storage
    try {
      const localKey = `kqe_admin_overrides_${bootcampTitle.replace(/[^a-zA-Z0-9_]/g, '_')}`;
      const localOverrides = JSON.parse(localStorage.getItem(localKey) || '[]');
      
      // Merge them, preferring local storage if there's a conflict since it might be newer if Firestore failed
      const mergedMap = new Map();
      overrides.forEach(o => {
          const id = `${o.email}_${o.timestamp}`;
          mergedMap.set(id, o);
      });
      localOverrides.forEach((o: any) => {
          const id = `${o.email}_${o.timestamp}`;
          mergedMap.set(id, o);
      });
      
      return Array.from(mergedMap.values());
    } catch (e) {
       console.error('Failed to read from local storage', e);
       return overrides;
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
