// Enhanced serverless function for both manual and auto notifications
export default async function handler(request, response) {
    // Enable CORS
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    if (request.method === 'GET') {
        // Return current auto notification status
        return response.status(200).json({
            message: 'Notification scheduler API is running',
            endpoints: {
                'POST /': 'Schedule a notification',
                'GET /': 'API status'
            }
        });
    }

    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    const { message, scheduleTime, isAuto = false } = request.body;

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
    
    // Check if schedule time is in the future
    const now = new Date();
    if (scheduleDate <= now) {
        return response.status(400).json({ 
            error: 'Schedule time must be in the future',
            currentTime: now.toISOString(),
            scheduleTime: scheduleDate.toISOString()
        });
    }
    
    // Format date as "YYYY-MM-DD HH:MM:SS GMT+0000"
    const year = scheduleDate.getUTCFullYear();
    const month = String(scheduleDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(scheduleDate.getUTCDate()).padStart(2, '0');
    const hours = String(scheduleDate.getUTCHours()).padStart(2, '0');
    const minutes = String(scheduleDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(scheduleDate.getUTCSeconds()).padStart(2, '0');
    
    const formattedScheduleTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} GMT+0000`;

    // Add emoji for auto notifications to distinguish them
    const finalMessage = isAuto ? `🤖 ${message}` : message;

    const body = {
        app_id: ONE_SIGNAL_APP_ID,
        contents: { en: finalMessage },
        included_segments: ['All'],
        send_after: formattedScheduleTime,
    };

    // Log for debugging (especially useful for auto notifications)
    console.log(`${isAuto ? 'AUTO' : 'MANUAL'} notification scheduled:`, {
        message: finalMessage,
        scheduleTime: formattedScheduleTime,
        originalTime: scheduleTime
    });

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

        if (onesignalResponse.ok && data.id) {
            const responseData = {
                success: true,
                notificationId: data.id,
                scheduledFor: formattedScheduleTime,
                isAuto: isAuto,
                message: isAuto 
                    ? 'Auto notification scheduled successfully!'
                    : 'Notification scheduled successfully! Check OneSignal Delivery section to track it.'
            };

            console.log(`✅ ${isAuto ? 'AUTO' : 'MANUAL'} notification created:`, data.id);
            
            response.status(200).json(responseData);
        } else {
            console.error(`❌ Failed to create ${isAuto ? 'AUTO' : 'MANUAL'} notification:`, data);
            response.status(onesignalResponse.status).json({ 
                error: 'Failed to schedule notification', 
                details: data,
                isAuto: isAuto
            });
        }
    } catch (error) {
        console.error(`❌ Error creating ${isAuto ? 'AUTO' : 'MANUAL'} notification:`, error);
        response.status(500).json({ 
            error: 'An internal error occurred.', 
            details: error.message,
            isAuto: isAuto
        });
    }
}