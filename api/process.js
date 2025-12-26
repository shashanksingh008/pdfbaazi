export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper to read the stream into a buffer
async function getBuffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const AUTH_TOKEN = process.env.CEREBRIUM_AUTH_TOKEN;
    const CEREBRIUM_URL = 'https://api.aws.us-east-1.cerebrium.ai/v4/p-ba56f76c/imagesfrompdfs-backend/process';

    if (!AUTH_TOKEN) {
        return res.status(500).json({ error: 'CEREBRIUM_AUTH_TOKEN is not configured in Vercel' });
    }

    try {
        // Read the incoming request body into a buffer
        const buffer = await getBuffer(req);

        const response = await fetch(CEREBRIUM_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': req.headers['content-type']
            },
            body: buffer
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            error: 'Failed to connect to Cerebrium',
            details: error.message 
        });
    }
}
