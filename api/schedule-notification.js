// Vercel Serverless Function
// This code will run on a Node.js environment on Vercel's servers.

export default async function handler(request, response) {
    // Allow only POST requests
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message, scheduleTime } = request.body;

    if (!message || !scheduleTime) {
        return response.status(400).json({ error: 'Message and scheduleTime are required.' });
    }

    const ONE_SIGNAL_APP_ID = "ead62052-c065-4208-af7f-26372838c61d";
    const ONE_SIGNAL_REST_API_KEY = "lqdi7k3upuo4ediitxwkfyjy3";

    if (!ONE_SIGNAL_APP_ID || !ONE_SIGNAL_REST_API_KEY) {
        return response.status(500).json({ error: 'OneSignal environment variables are not configured.' });
    }

    const body = {
        app_id: ONE_SIGNAL_APP_ID,
        contents: { en: message },
        included_segments: ['Subscribed Users'],
        send_after: scheduleTime,
    };

    try {
        const onesignalResponse = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${ONE_SIGNAL_REST_API_KEY}`,
            },
            body: JSON.stringify(body),
        });

        const data = await onesignalResponse.json();

        if (onesignalResponse.ok) {
            response.status(200).json({ success: true, data });
        } else {
            response.status(onesignalResponse.status).json({ error: 'Failed to send notification to OneSignal.', details: data });
        }
    } catch (error) {
        response.status(500).json({ error: 'An internal error occurred.', details: error.message });
    }
}
