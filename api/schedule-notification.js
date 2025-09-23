// Test version - sends immediate notification
export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message } = request.body;

    if (!message) {
        return response.status(400).json({ error: 'Message is required.' });
    }

    const ONE_SIGNAL_APP_ID = "ead62052-c065-4208-af7f-26372838c61d";
    const ONE_SIGNAL_REST_API_KEY = "lqdi7k3upuo4ediitxwkfyjy3";

    const body = {
        app_id: ONE_SIGNAL_APP_ID,
        contents: { en: message },
        included_segments: ['All'], // Try 'All' instead of 'Subscribed Users'
    };

    console.log('Sending to OneSignal:', JSON.stringify(body, null, 2));
    console.log('Using API Key:', ONE_SIGNAL_REST_API_KEY);

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
        
        console.log('OneSignal response status:', onesignalResponse.status);
        console.log('OneSignal response data:', JSON.stringify(data, null, 2));

        if (onesignalResponse.ok) {
            response.status(200).json({ success: true, data });
        } else {
            response.status(onesignalResponse.status).json({ 
                error: 'Failed to send notification to OneSignal.', 
                details: data,
                status: onesignalResponse.status 
            });
        }
    } catch (error) {
        console.error('Fetch error:', error);
        response.status(500).json({ error: 'An internal error occurred.', details: error.message });
    }
}
