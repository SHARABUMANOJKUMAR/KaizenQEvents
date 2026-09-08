import Papa from 'papaparse';

// Public Google Sheets CSV Export URLs (raw)
const SHEET_URLS = {
  users: 'https://docs.google.com/spreadsheets/d/1olJiRcGQHhs1bU0LbFeR-i5iKlX53A9sXUiHwSXF6MU/export?format=csv&gid=0',
  logins: 'https://docs.google.com/spreadsheets/d/1olJiRcGQHhs1bU0LbFeR-i5iKlX53A9sXUiHwSXF6MU/export?format=csv&gid=1037440371',
  generativeAI: 'https://docs.google.com/spreadsheets/d/16eCfu21GCne7Mjtjk0qxfpbHkYqfINCG-BRUHvCyTZg/export?format=csv&gid=0',
  pythonAI: 'https://docs.google.com/spreadsheets/d/1M9PNRYV7vNb-H-q9PQND5jKydh9THJFlqXxx7gUZuq8/export?format=csv&gid=0',
  gitGitHub: 'https://docs.google.com/spreadsheets/d/1wj8RxQ17DNEnYGYJQpKl76A7-gBF9dY5nfGEnxXuwes/export?format=csv&gid=0',
  javaAI: 'https://docs.google.com/spreadsheets/d/1Xk80UdTZmrXHOc3agRVZjTRmQMWcaW2EuMjhL72OGi4/export?format=csv&gid=0'
};

// In production (Netlify), route via serverless function to avoid CORS issues.
// In local dev, hit Google Sheets directly.
const isProduction = import.meta.env.PROD;
const sheetKeys: Record<string, string> = {
  [SHEET_URLS.generativeAI]: 'generativeAI',
  [SHEET_URLS.pythonAI]: 'pythonAI',
  [SHEET_URLS.gitGitHub]: 'gitGitHub',
  [SHEET_URLS.javaAI]: 'javaAI',
  [SHEET_URLS.users]: 'users',
  [SHEET_URLS.logins]: 'logins',
};

function resolveUrl(rawUrl: string): string {
  if (!isProduction) return rawUrl;
  const key = sheetKeys[rawUrl];
  return key ? `/.netlify/functions/fetch-sheet?sheet=${key}` : rawUrl;
}

// Generic fetch and parse function
async function fetchSheetData<T>(url: string, mockFallbackData: T[]): Promise<T[]> {
  try {
    const resolvedUrl = resolveUrl(url);
    const response = await fetch(resolvedUrl);
    if (!response.ok) {
      console.warn(`Failed to fetch data: ${response.status}. Using mock data instead.`);
      return mockFallbackData;
    }
    const csvData = await response.text();
    
    // Check if we got an HTML page (meaning it's not public or redirecting to login)
    if (csvData.trim().toLowerCase().startsWith('<!doctype html>')) {
      console.warn('Received HTML instead of CSV. The Google Sheet might not be public. Using mock data instead.');
      return mockFallbackData;
    }

    return new Promise((resolve) => {
      Papa.parse<T>(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data.length === 0) {
            resolve(mockFallbackData);
          } else {
            resolve(results.data);
          }
        },
        error: (error: Error) => {
          console.error('Parse error, using mock data', error);
          resolve(mockFallbackData);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching sheet data, using mock data:', error);
    return mockFallbackData;
  }
}

// Interfaces based on typical sheet columns (will dynamically access if columns differ)
export interface BaseUser {
  Name?: string;
  Email?: string;
  Phone?: string;
  [key: string]: string | undefined;
}

export interface BootcampRegistration extends BaseUser {
  Timestamp?: string;
  Status?: string;
}

export interface LoginActivity {
  Email?: string;
  Timestamp?: string;
  Status?: string;
  [key: string]: string | undefined;
}

// Mock data for fallback
const MOCK_USERS: BaseUser[] = [
  { Name: 'John Doe', Email: 'john@example.com', Phone: '+1234567890' },
  { Name: 'Jane Smith', Email: 'jane@example.com', Phone: '+0987654321' },
];

const MOCK_LOGINS: LoginActivity[] = [
  { Email: 'john@example.com', 'Last Login': '2023-10-27 10:00:00', Status: 'Success' },
  { Email: 'jane@example.com', 'Last Login': '2023-10-27 11:30:00', Status: 'Success' },
];

const MOCK_BOOTCAMP_REGISTRATIONS: BootcampRegistration[] = [
  { Name: 'Alice Johnson', Email: 'alice@example.com', Timestamp: '2023-10-26 14:00:00', Status: 'Registered' },
  { Name: 'Bob Williams', Email: 'bob@example.com', Timestamp: '2023-10-26 15:20:00', Status: 'Registered' },
];

// Service functions
export const GoogleSheetsService = {
  getUsers: () => fetchSheetData<BaseUser>(SHEET_URLS.users, MOCK_USERS),
  getGenerativeAIRegistrations: () => fetchSheetData<BootcampRegistration>(SHEET_URLS.generativeAI, MOCK_BOOTCAMP_REGISTRATIONS),
  getPythonAIRegistrations: () => fetchSheetData<BootcampRegistration>(SHEET_URLS.pythonAI, MOCK_BOOTCAMP_REGISTRATIONS),
  getGitGithubRegistrations: () => fetchSheetData<BootcampRegistration>(SHEET_URLS.gitGitHub, MOCK_BOOTCAMP_REGISTRATIONS),
  getJavaAIRegistrations: () => fetchSheetData<BootcampRegistration>(SHEET_URLS.javaAI, MOCK_BOOTCAMP_REGISTRATIONS),
  getLogins: () => fetchSheetData<LoginActivity>(SHEET_URLS.logins, MOCK_LOGINS),

  
  // Data normalization utils
  normalizeEmail: (email?: string) => (email || '').toLowerCase().trim(),
  
  // For the dashboard to fetch all concurrently
  getAllDashboardData: async () => {
    const [users, genAI, pythonAI, gitGitHub, javaAI] = await Promise.all([
      GoogleSheetsService.getUsers().catch(() => []),
      GoogleSheetsService.getGenerativeAIRegistrations().catch(() => []),
      GoogleSheetsService.getPythonAIRegistrations().catch(() => []),
      GoogleSheetsService.getGitGithubRegistrations().catch(() => []),
      GoogleSheetsService.getJavaAIRegistrations().catch(() => [])
    ]);
    
    return {
      users,
      genAI,
      pythonAI,
      gitGitHub,
      javaAI,
      lastSync: new Date().toISOString()
    };
  }
};
