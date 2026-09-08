// Netlify serverless function to proxy Google Sheets CSV fetches
// This bypasses CORS restrictions that prevent direct browser fetches in production

const SHEET_URLS = {
  generativeAI: 'https://docs.google.com/spreadsheets/d/16eCfu21GCne7Mjtjk0qxfpbHkYqfINCG-BRUHvCyTZg/export?format=csv&gid=0',
  pythonAI: 'https://docs.google.com/spreadsheets/d/1M9PNRYV7vNb-H-q9PQND5jKydh9THJFlqXxx7gUZuq8/export?format=csv&gid=0',
  gitGitHub: 'https://docs.google.com/spreadsheets/d/1wj8RxQ17DNEnYGYJQpKl76A7-gBF9dY5nfGEnxXuwes/export?format=csv&gid=0',
  javaAI: 'https://docs.google.com/spreadsheets/d/1Xk80UdTZmrXHOc3agRVZjTRmQMWcaW2EuMjhL72OGi4/export?format=csv&gid=0',
};

exports.handler = async (event) => {
  const sheet = event.queryStringParameters?.sheet;
  const url = SHEET_URLS[sheet];

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Unknown sheet: ${sheet}` }),
    };
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Netlify Function)',
      },
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Sheet fetch failed: ${response.status}` }),
      };
    }

    const csv = await response.text();

    // Return the CSV with CORS headers so the browser can read it
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60', // cache 60s
      },
      body: csv,
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
