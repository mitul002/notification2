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

    if (!ONE_SIGNAL_APP_ID || !ONE_SIGNAL_REST_API_KEY) {
        return response.status(500).json({ error: 'OneSignal environment variables are not configured.' });
    }

    // Current time for reference
    const now = new Date();
    const scheduleDate = new Date(scheduleTime);
    
    console.log('=== SCHEDULING DEBUG ===');
    console.log('Current time:', now.toISOString());
    console.log('Schedule time:', scheduleDate.toISOString());

    // Check if schedule time is in the future
    if (scheduleDate <= now) {
        return response.status(400).json({ 
            error: 'Schedule time must be in the future',
            currentTime: now.toISOString(),
            scheduleTime: scheduleDate.toISOString()
        });
    }

    // Format date for OneSignal
    const year = scheduleDate.getUTCFullYear();
    const month = String(scheduleDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(scheduleDate.getUTCDate()).padStart(2, '0');
    const hours = String(scheduleDate.getUTCHours()).padStart(2, '0');
    const minutes = String(scheduleDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(scheduleDate.getUTCSeconds()).padStart(2, '0');
    const formattedScheduleTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} GMT+0000`;

    console.log('Formatted schedule time:', formattedScheduleTime);

    // Try different targeting approaches
    const targetingOptions = [
        { included_segments: ['All'] },
        { included_segments: ['Active Users'] },
        { included_segments: ['Subscribed Users'] },
        { included_segments: ['Engaged Users'] }
    ];

    for (let i = 0; i < targetingOptions.length; i++) {
        console.log(`\n=== ATTEMPT ${i + 1}: Testing with targeting:`, targetingOptions[i]);
        
        const body = {
            app_id: ONE_SIGNAL_APP_ID,
            contents: { en: `${message} (Test ${i + 1})` },
            ...targetingOptions[i],
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
            
            console.log(`Response ${i + 1} status:`, onesignalResponse.status);
            console.log(`Response ${i + 1} data:`, JSON.stringify(data, null, 2));

            if (onesignalResponse.ok && data.id) {
                console.log(`✅ SUCCESS with targeting option ${i + 1}:`, targetingOptions[i]);
                console.log('Notification ID:', data.id);
                
                return response.status(200).json({ 
                    success: true, 
                    data,
                    successfulTargeting: targetingOptions[i],
                    notificationId: data.id,
                    scheduledFor: formattedScheduleTime
                });
            } else if (onesignalResponse.ok) {
                console.log(`⚠️ API call succeeded but no notification ID returned for option ${i + 1}`);
                console.log('This usually means no users match the targeting criteria');
            }
        } catch (error) {
            console.error(`❌ Error with targeting option ${i + 1}:`, error);
        }
    }

    // If all targeting options failed, try immediate notification to test if you have any subscribers
    console.log('\n=== TESTING IMMEDIATE NOTIFICATION ===');
    const immediateBody = {
        app_id: ONE_SIGNAL_APP_ID,
        contents: { en: 'Test immediate notification - checking for subscribers' },
        included_segments: ['All']
    };

    try {
        const immediateResponse = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Key ${ONE_SIGNAL_REST_API_KEY}`,
            },
            body: JSON.stringify(immediateBody),
        });

        const immediateData = await immediateResponse.json();
        console.log('Immediate notification response:', JSON.stringify(immediateData, null, 2));

        if (immediateData.id) {
            console.log('✅ You have subscribers! The issue is with scheduled notifications specifically');
        } else {
            console.log('❌ No immediate notification sent either - you might have no subscribers');
        }
    } catch (error) {
        console.error('Error testing immediate notification:', error);
    }

    // Return the information about what we found
    return response.status(200).json({ 
        success: false,
        message: 'Notification API calls succeeded but no notification ID returned',
        possibleReasons: [
            'No users subscribed to receive notifications',
            'Selected segment has no users',
            'OneSignal configuration issue',
            'Scheduled notifications might not be available for your plan'
        ],
        suggestion: 'Check OneSignal Dashboard > Audience to see if you have any subscribers'
    });
}
