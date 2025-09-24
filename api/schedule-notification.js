<<<<<<< HEAD
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

=======
export default async function handler(request, response) {
>>>>>>> faec5655abda72eef0a7e39ebf89a762fab65b1b
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

<<<<<<< HEAD
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
=======
    const now = new Date();
    const scheduleDate = new Date(scheduleTime);
    
    console.log('=== SCHEDULE TEST ===');
    console.log('Current time:', now.toISOString());
    console.log('Schedule time:', scheduleDate.toISOString());
    console.log('Minutes from now:', Math.round((scheduleDate - now) / (1000 * 60)));

    // Check if schedule time is in the future
    if (scheduleDate <= now) {
        return response.status(400).json({ 
            error: 'Schedule time must be in the future',
        });
    }

    // Format date for OneSignal
>>>>>>> faec5655abda72eef0a7e39ebf89a762fab65b1b
    const year = scheduleDate.getUTCFullYear();
    const month = String(scheduleDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(scheduleDate.getUTCDate()).padStart(2, '0');
    const hours = String(scheduleDate.getUTCHours()).padStart(2, '0');
    const minutes = String(scheduleDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(scheduleDate.getUTCSeconds()).padStart(2, '0');
<<<<<<< HEAD
    
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

=======
    const formattedScheduleTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} GMT+0000`;

    console.log('Formatted schedule time:', formattedScheduleTime);

    // Test 1: Send immediate notification (to confirm API works)
    console.log('\n=== TEST 1: IMMEDIATE NOTIFICATION ===');
    const immediateBody = {
        app_id: ONE_SIGNAL_APP_ID,
        contents: { en: `Immediate: ${message}` },
        included_segments: ['All']
    };

    let immediateResult = null;
>>>>>>> faec5655abda72eef0a7e39ebf89a762fab65b1b
    try {
        const immediateResponse = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Key ${ONE_SIGNAL_REST_API_KEY}`,
            },
            body: JSON.stringify(immediateBody),
        });

        immediateResult = await immediateResponse.json();
        console.log('Immediate notification result:', JSON.stringify(immediateResult, null, 2));
    } catch (error) {
        console.error('Immediate notification error:', error);
    }

<<<<<<< HEAD
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
=======
    // Test 2: Send scheduled notification
    console.log('\n=== TEST 2: SCHEDULED NOTIFICATION ===');
    const scheduledBody = {
        app_id: ONE_SIGNAL_APP_ID,
        contents: { en: `Scheduled: ${message}` },
        included_segments: ['All'],
        send_after: formattedScheduleTime,
    };

    console.log('Scheduled request body:', JSON.stringify(scheduledBody, null, 2));

    try {
        const scheduledResponse = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Key ${ONE_SIGNAL_REST_API_KEY}`,
            },
            body: JSON.stringify(scheduledBody),
        });

        const scheduledResult = await scheduledResponse.json();
        
        console.log('Scheduled notification status:', scheduledResponse.status);
        console.log('Scheduled notification result:', JSON.stringify(scheduledResult, null, 2));

        if (scheduledResponse.ok) {
            if (scheduledResult.id) {
                console.log('✅ SCHEDULED notification created with ID:', scheduledResult.id);
                
                // Check if it's actually scheduled by looking at the response
                if (scheduledResult.send_after) {
                    console.log('✅ Confirmation: send_after field present:', scheduledResult.send_after);
                } else {
                    console.log('⚠️ Warning: No send_after field in response, might be sent immediately');
                }
                
                response.status(200).json({ 
                    success: true, 
                    scheduledNotificationId: scheduledResult.id,
                    immediateNotificationId: immediateResult?.id,
                    scheduledFor: formattedScheduleTime,
                    scheduledResponse: scheduledResult,
                    message: 'Both notifications created. Check OneSignal dashboard and wait for scheduled time.'
                });
            } else {
                console.log('⚠️ Scheduled API call succeeded but no notification ID');
                response.status(200).json({ 
                    success: false,
                    error: 'Scheduled notification API succeeded but no ID returned',
                    scheduledResponse: scheduledResult,
                    immediateNotificationId: immediateResult?.id
                });
            }
        } else {
            console.log('❌ Scheduled notification failed');
            response.status(scheduledResponse.status).json({ 
                error: 'Failed to schedule notification', 
                details: scheduledResult,
                immediateNotificationId: immediateResult?.id
            });
        }
    } catch (error) {
        console.error('❌ Scheduled notification error:', error);
        response.status(500).json({ 
            error: 'Error creating scheduled notification', 
            details: error.message,
            immediateNotificationId: immediateResult?.id
>>>>>>> faec5655abda72eef0a7e39ebf89a762fab65b1b
        });
    }
}