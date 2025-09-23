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

    const ONE_SIGNAL_APP_ID = process.env.ONE_SIGNAL_APP_ID;
    const ONE_SIGNAL_REST_API_KEY = process.env.ONE_SIGNAL_REST_API_KEY;

    if (!ONE_SIGNAL_APP_ID || !ONE_SIGNAL_REST_API_KEY) {
        return response.status(500).json({ error: 'OneSignal environment variables are not configured.' });
    }

    // Convert the scheduleTime to OneSignal's expected format
    const scheduleDate = new Date(scheduleTime);
    
    // OneSignal expects format like "2024-09-25 14:30:00 GMT+0000"
    const year = scheduleDate.getUTCFullYear();
    const month = String(scheduleDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(scheduleDate.getUTCDate()).padStart(2, '0');
    const hours = String(scheduleDate.getUTCHours()).padStart(2, '0');
    const minutes = String(scheduleDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(scheduleDate.getUTCSeconds()).padStart(2, '0');
    
    const formattedScheduleTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} GMT+0000`;

    // Log for debugging
    console.log('Original schedule time:', scheduleTime);
    console.log('Formatted schedule time:', formattedScheduleTime);
    console.log('Message:', message);

    const body = {
        app_id: ONE_SIGNAL_APP_ID,
        contents: { en: message },
        included_segments: ['Subscribed Users'],
        send_after: formattedScheduleTime,
    };

    try {
        const onesignalResponse = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Key ${ONE_SIGNAL_REST_API_KEY}`,
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
