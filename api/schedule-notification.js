export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message, scheduleTime } = request.body;

    if (!message || !scheduleTime) {
        return response.status(400).json({ error: 'Message and scheduleTime are required.' });
    }

    const ONE_SIGNAL_APP_ID = process.env.ONE_SIGNAL_APP_ID;
    const ONE_SIGNAL_REST_API_KEY = process.env.ONE_SIGNAL_REST_API_KEY;

    console.log('=== DEBUG INFO ===');
    console.log('Message:', message);
    console.log('Raw scheduleTime:', scheduleTime);
    console.log('App ID:', ONE_SIGNAL_APP_ID);
    console.log('API Key exists:', !!ONE_SIGNAL_REST_API_KEY);
    console.log('API Key length:', ONE_SIGNAL_REST_API_KEY?.length);

    if (!ONE_SIGNAL_APP_ID || !ONE_SIGNAL_REST_API_KEY) {
        return response.status(500).json({ error: 'OneSignal environment variables are not configured.' });
    }

    // Current time for reference
    const now = new Date();
    const scheduleDate = new Date(scheduleTime);
    
    console.log('Current time (server):', now.toISOString());
    console.log('Schedule time (parsed):', scheduleDate.toISOString());
    console.log('Time difference (minutes):', (scheduleDate - now) / (1000 * 60));

    // Check if schedule time is in the future
    if (scheduleDate <= now) {
        console.log('ERROR: Schedule time is in the past!');
        return response.status(400).json({ 
            error: 'Schedule time must be in the future',
            currentTime: now.toISOString(),
            scheduleTime: scheduleDate.toISOString()
        });
    }

    // Try multiple date formats that OneSignal might accept
    const isoFormat = scheduleDate.toISOString();
    
    // Format 1: OneSignal GMT format
    const year = scheduleDate.getUTCFullYear();
    const month = String(scheduleDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(scheduleDate.getUTCDate()).padStart(2, '0');
    const hours = String(scheduleDate.getUTCHours()).padStart(2, '0');
    const minutes = String(scheduleDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(scheduleDate.getUTCSeconds()).padStart(2, '0');
    const gmtFormat = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} GMT+0000`;
    
    // Format 2: Unix timestamp
    const unixTimestamp = Math.floor(scheduleDate.getTime() / 1000);

    console.log('ISO format:', isoFormat);
    console.log('GMT format:', gmtFormat);
    console.log('Unix timestamp:', unixTimestamp);

    // Try GMT format first (most common in examples)
    const body = {
        app_id: ONE_SIGNAL_APP_ID,
        contents: { en: message },
        included_segments: ['Subscribed Users'],
        send_after: gmtFormat,
    };

    console.log('Request body:', JSON.stringify(body, null, 2));

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
        console.log('OneSignal response headers:', Object.fromEntries(onesignalResponse.headers.entries()));
        console.log('OneSignal response data:', JSON.stringify(data, null, 2));

        if (onesignalResponse.ok) {
            // Check if the response contains a notification ID
            if (data.id) {
                console.log('✅ Notification scheduled with ID:', data.id);
            } else {
                console.log('⚠️ No notification ID in response - might not be scheduled');
            }
            
            response.status(200).json({ 
                success: true, 
                data,
                debugInfo: {
                    scheduledFor: gmtFormat,
                    timeFromNow: `${Math.round((scheduleDate - now) / (1000 * 60))} minutes`,
                    notificationId: data.id
                }
            });
        } else {
            console.log('❌ OneSignal API error');
            response.status(onesignalResponse.status).json({ 
                error: 'Failed to send notification to OneSignal.', 
                details: data,
                requestBody: body
            });
        }
    } catch (error) {
        console.error('❌ Fetch error:', error);
        response.status(500).json({ 
            error: 'An internal error occurred.', 
            details: error.message 
        });
    }
}
