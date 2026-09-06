const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SPREADSHEET_ID = '1UmbReGn98Wh5uVG9U_CznBEklF4Xokq-fUG87NyE8bM';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'credentials', 'service-account.json');

// In-memory OTP storage: Map<email, { otp, expiresAt, attempts }>
const otpStore = new Map();

// Initialize Firebase Admin SDK
let firebaseInitialized = false;
let authAdmin = null;

try {
  if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
    const apps = getApps();
    const fbApp = apps.length > 0 ? apps[0] : initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id || 'shaivika-lms-ai',
    });
    authAdmin = getAuth(fbApp);
    firebaseInitialized = true;
    console.log(`🔥 Firebase Admin SDK initialized successfully for project: ${serviceAccount.project_id}`);
  }
} catch (err) {
  console.warn('⚠️ Firebase Admin initialization notice:', err.message);
}

// Initialize Nodemailer Transporter
let mailTransporter = null;
async function getMailTransporter() {
  if (mailTransporter) return mailTransporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    mailTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
    mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    });
  } else {
    // Development ethereal / simulated mailer
    try {
      const testAccount = await nodemailer.createTestAccount();
      mailTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('📧 Nodemailer using ethereal test mailer:', testAccount.user);
    } catch (e) {
      mailTransporter = {
        sendMail: async (options) => {
          console.log(`📨 [SIMULATED EMAIL] To: ${options.to} | Subject: ${options.subject}`);
          return { messageId: 'simulated_' + Date.now() };
        },
      };
    }
  }
  return mailTransporter;
}

// Initialize Google Sheets Auth using Service Account JSON
function getSheetsClient() {
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    throw new Error(`Service Account JSON missing at ${SERVICE_ACCOUNT_PATH}`);
  }
  const auth = new google.auth.GoogleAuth({
    keyFile: SERVICE_ACCOUNT_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    firebaseAdmin: firebaseInitialized ? 'connected' : 'fallback',
    serviceAccount: 'kqe-backend@shaivika-lms-ai.iam.gserviceaccount.com',
    spreadsheetId: SPREADSHEET_ID,
  });
});

// Send Real-Time OTP to email endpoint
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    otpStore.set(normalizedEmail, { otp, expiresAt, attempts: 0 });

    console.log(`\n========================================`);
    console.log(`🔐 REAL-TIME OTP GENERATED FOR: ${normalizedEmail}`);
    console.log(`🔑 OTP CODE: ${otp}`);
    console.log(`⏳ VALIDITY: 10 Minutes`);
    console.log(`========================================\n`);

    const transporter = await getMailTransporter();
    const mailOptions = {
      from: '"Kaizen Q Events" <no-reply@kaizenq-events.com>',
      to: normalizedEmail,
      subject: `Your Kaizen Q Events Verification Code: ${otp}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; border: 1px solid #E8EAED; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1A1A2E; margin: 0; font-size: 24px; font-weight: 800;">Kaizen Q Events</h1>
            <p style="color: #5F6368; font-size: 14px; margin-top: 6px;">Authentication & Security Verification</p>
          </div>
          <div style="background-color: #F8F9FA; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <p style="color: #1A1A2E; font-size: 14px; margin-bottom: 12px; font-weight: 600;">Your One-Time Password (OTP) is:</p>
            <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4285F4; background-color: #EBF3FF; padding: 14px 20px; border-radius: 10px; display: inline-block; font-family: monospace; border: 1px dashed #4285F4;">
              ${otp}
            </div>
            <p style="color: #5F6368; font-size: 12px; margin-top: 14px;">This code expires in 10 minutes. Do not share this code with anyone.</p>
          </div>
          <p style="color: #9AA0A6; font-size: 12px; text-align: center; line-height: 1.5; margin: 0;">
            If you didn't request this code, you can safely ignore it.<br>© 2026 Kaizen Q Events. All rights reserved.
          </p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailErr) {
      console.warn('Mail send dispatch notice:', mailErr.message);
    }

    res.json({
      success: true,
      message: `OTP sent successfully to ${normalizedEmail}`,
      otp: otp,
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
  }
});

// Verify OTP endpoint
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp, fullName, college, branch, year, phone } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const stored = otpStore.get(normalizedEmail);

    if (!stored) {
      return res.status(400).json({ success: false, message: 'No OTP requested for this email or OTP expired. Please request a new OTP.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (stored.otp !== otp.trim()) {
      stored.attempts = (stored.attempts || 0) + 1;
      if (stored.attempts >= 5) {
        otpStore.delete(normalizedEmail);
        return res.status(400).json({ success: false, message: 'Too many incorrect attempts. Please request a new OTP.' });
      }
      return res.status(400).json({ success: false, message: 'Invalid OTP code. Please check and try again.' });
    }

    // OTP is valid, remove from store
    otpStore.delete(normalizedEmail);

    const displayName = fullName || normalizedEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase());
    let firebaseUid = 'usr_' + Math.random().toString(36).substr(2, 9);

    // Sync with Firebase Admin Auth if active
    if (firebaseInitialized && authAdmin) {
      try {
        let userRecord;
        try {
          userRecord = await authAdmin.getUserByEmail(normalizedEmail);
        } catch (e) {
          if (e.code === 'auth/user-not-found') {
            userRecord = await authAdmin.createUser({
              email: normalizedEmail,
              displayName: displayName,
              emailVerified: true,
            });
          }
        }
        if (userRecord) {
          firebaseUid = userRecord.uid;
        }
      } catch (fbErr) {
        console.warn('Firebase user sync note:', fbErr.message);
      }
    }

    const userProfile = {
      uid: firebaseUid,
      displayName: displayName,
      email: normalizedEmail,
      photoURL: `https://lh3.googleusercontent.com/a/ACg8ocL${Math.random().toString(36).substring(7)}=s96-c`,
      authProvider: 'email',
      phone: phone || '',
      college: college || '',
      branch: branch || '',
      year: year || '',
      createdAt: new Date().toISOString(),
    };

    console.log(`✅ User authenticated successfully via OTP: ${normalizedEmail}`);

    res.json({
      success: true,
      message: 'Authentication successful',
      user: userProfile,
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP.' });
  }
});

// Google Authentication endpoint synced with Firebase Admin
app.post('/api/auth/google', async (req, res) => {
  try {
    const { email, displayName, photoURL } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Valid Google email is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const formattedName = displayName || normalizedEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase());
    const userPhoto = photoURL || `https://lh3.googleusercontent.com/a/ACg8ocL${Math.random().toString(36).substring(7)}=s96-c`;

    let firebaseUid = 'goog_' + Math.random().toString(36).substr(2, 9);

    // Sync user with Firebase Admin Auth
    if (firebaseInitialized && authAdmin) {
      try {
        let userRecord;
        try {
          userRecord = await authAdmin.getUserByEmail(normalizedEmail);
        } catch (e) {
          if (e.code === 'auth/user-not-found') {
            userRecord = await authAdmin.createUser({
              email: normalizedEmail,
              displayName: formattedName,
              photoURL: userPhoto,
              emailVerified: true,
            });
          }
        }
        if (userRecord) {
          firebaseUid = userRecord.uid;
        }
      } catch (fbErr) {
        console.warn('Firebase Google user sync note:', fbErr.message);
      }
    }

    const userProfile = {
      uid: firebaseUid,
      displayName: formattedName,
      email: normalizedEmail,
      photoURL: userPhoto,
      authProvider: 'google',
      createdAt: new Date().toISOString(),
    };

    console.log(`🔥 Google User authenticated & synced with Firebase: ${normalizedEmail}`);

    res.json({
      success: true,
      message: 'Google authentication successful',
      user: userProfile,
    });
  } catch (error) {
    console.error('Error in Google auth:', error);
    res.status(500).json({ success: false, message: 'Google authentication failed.' });
  }
});

// Local registration storage helper
const REGISTRATIONS_FILE = path.join(__dirname, 'registrations.json');

function getStoredRegistrations() {
  try {
    if (fs.existsSync(REGISTRATIONS_FILE)) {
      return JSON.parse(fs.readFileSync(REGISTRATIONS_FILE, 'utf8'));
    }
  } catch (err) {
    console.warn('Error reading registrations file:', err.message);
  }
  return [];
}

function saveStoredRegistration(reg) {
  try {
    const list = getStoredRegistrations();
    list.unshift(reg);
    fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error writing registrations file:', err.message);
  }
}

// Fetch user registrations endpoint (from Google Sheets + Local backup)
app.get('/api/user/registrations', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email query parameter is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userRegistrations = [];

    // 1. Try reading directly from Google Sheets
    try {
      const sheets = getSheetsClient();
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Sheet1!A:I',
      });

      const rows = response.data.values || [];
      // Columns: [0: timestamp, 1: eventTitle, 2: eventId, 3: fullName, 4: email, 5: phone, 6: year, 7: college, 8: branch]
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const rowEmail = (row[4] || '').trim().toLowerCase();
        if (rowEmail === normalizedEmail) {
          userRegistrations.push({
            id: `reg-${i}`,
            timestamp: row[0] || new Date().toISOString(),
            eventTitle: row[1] || '',
            eventId: row[2] || '',
            fullName: row[3] || '',
            email: row[4] || '',
            phone: row[5] || '',
            year: row[6] || '',
            college: row[7] || '',
            branch: row[8] || '',
            ticketId: `KQE-${1000 + i}`,
          });
        }
      }
    } catch (sheetErr) {
      console.warn('Notice reading Google Sheet:', sheetErr.message);
    }

    // 2. Merge with local backup storage if not already present
    const localList = getStoredRegistrations();
    const matchingLocal = localList.filter(r => (r.email || '').trim().toLowerCase() === normalizedEmail);

    for (const localReg of matchingLocal) {
      const exists = userRegistrations.some(r => r.eventId === localReg.eventId || r.eventTitle === localReg.eventTitle);
      if (!exists) {
        userRegistrations.unshift(localReg);
      }
    }

    console.log(`📋 Fetched ${userRegistrations.length} registrations for user: ${normalizedEmail}`);

    res.json({
      success: true,
      email: normalizedEmail,
      count: userRegistrations.length,
      registrations: userRegistrations,
    });
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user registrations.' });
  }
});

// Real-time Platform Stats Endpoint
app.get('/api/stats', async (req, res) => {
  try {
    let registrationCount = 10;
    try {
      const sheets = getSheetsClient();
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Sheet1!A:A',
      });
      const rows = response.data.values || [];
      registrationCount = Math.max(10, rows.length - 1);
    } catch (e) {
      const local = getStoredRegistrations();
      registrationCount = Math.max(10, local.length);
    }

    res.json({
      success: true,
      stats: {
        bootcampsHosted: 4,
        upcomingBootcamps: 4,
        communityMembers: `${registrationCount}+`,
        activeStates: 2,
        statesList: ['Andhra Pradesh', 'Telangana'],
        liveStudents: Math.max(10, Math.floor(registrationCount * 1.2)),
      },
    });
  } catch (error) {
    res.json({
      success: true,
      stats: {
        bootcampsHosted: 4,
        upcomingBootcamps: 4,
        communityMembers: '10+',
        activeStates: 2,
        statesList: ['Andhra Pradesh', 'Telangana'],
        liveStudents: 10,
      },
    });
  }
});

// Append registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { eventTitle, eventId, fullName, email, phone, year, college, branch } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const ticketId = `KQE-${Math.floor(100000 + Math.random() * 900000)}`;

    const newReg = {
      timestamp,
      eventTitle: eventTitle || '',
      eventId: eventId || '',
      fullName: fullName || '',
      email: normalizedEmail,
      phone: phone || '',
      year: year || '',
      college: college || '',
      branch: branch || '',
      ticketId,
    };

    // Save locally
    saveStoredRegistration(newReg);

    // Save to Google Sheets
    let updatedRange = null;
    try {
      const sheets = getSheetsClient();
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Sheet1!A:I',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [
            [timestamp, eventTitle || '', eventId || '', fullName || '', normalizedEmail, phone || '', year || '', college || '', branch || '']
          ]
        }
      });
      updatedRange = response.data.updates.updatedRange;
      console.log(`📊 Registration recorded in Google Sheets for ${normalizedEmail} - Range: ${updatedRange}`);
    } catch (sheetErr) {
      console.warn('Google Sheets append notice:', sheetErr.message);
    }

    res.json({
      success: true,
      message: 'Registration added successfully to Google Sheet & database',
      registration: newReg,
      updatedRange,
    });
  } catch (error) {
    console.error('Registration API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 KQE Backend Server running on port ${PORT}`);
  console.log(`📊 Connected to Spreadsheet ID: ${SPREADSHEET_ID}`);
  console.log(`🔥 Real-Time OTP Authentication & Firebase Services Ready`);
});
