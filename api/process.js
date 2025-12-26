export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle binary PDF data
  },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // This is safe because it runs on Vercel's server, not the user's browser
    const AUTH_TOKEN = process.env.CEREBRIUM_AUTH_TOKEN;
    const CEREBRIUM_URL = 'https://api.aws.us-east-1.cerebrium.ai/v4/p-ba56f76c/imagesfrompdfs-backend/process';

    if (!AUTH_TOKEN) {
        return res.status(500).json({ error: 'CEREBRIUM_AUTH_TOKEN is not configured in Vercel' });
    }

    try {
        const response = await fetch(CEREBRIUM_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': req.headers['content-type']
            },
            body: req // Forward the binary PDF data directly
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Failed to connect to Cerebrium' });
    }
}
