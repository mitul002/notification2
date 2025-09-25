// /api/schedule-notification.js
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, scheduleTime } = await request.json();
  if (!message || !scheduleTime) {
    return response.status(400).json({ error: 'Message and scheduleTime are required.' });
  }

  const ONE_SIGNAL_APP_ID = process.env.ONE_SIGNAL_APP_ID;
  const ONE_SIGNAL_REST_API_KEY = process.env.ONE_SIGNAL_REST_API_KEY;

  if (!ONE_SIGNAL_APP_ID || !ONE_SIGNAL_REST_API_KEY) {
    return response.status(500).json({ error: 'OneSignal environment variables not configured.' });
  }

  const scheduleDate = new Date(scheduleTime);
  const now = new Date();
  if (scheduleDate <= now) {
    return response.status(400).json({ error: 'Schedule time must be in the future' });
  }

  // Format: "YYYY-MM-DD HH:MM:SS GMT+0000"
  const year = scheduleDate.getUTCFullYear();
  const month = String(scheduleDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(scheduleDate.getUTCDate()).padStart(2, '0');
  const hours = String(scheduleDate.getUTCHours()).padStart(2, '0');
  const minutes = String(scheduleDate.getUTCMinutes()).padStart(2, '0');
  const seconds = String(scheduleDate.getUTCSeconds()).padStart(2, '0');
  const formattedScheduleTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} GMT+0000`;

  const body = {
    app_id: ONE_SIGNAL_APP_ID,
    contents: { en: message },
    included_segments: ['All'],
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
    if (onesignalResponse.ok && data.id) {
      return response.status(200).json({
        success: true,
        notificationId: data.id,
        scheduledFor: formattedScheduleTime,
        message: 'Notification scheduled successfully!'
      });
    } else {
      return response.status(onesignalResponse.status).json({
        error: 'Failed to schedule notification',
        details: data
      });
    }
  } catch (error) {
    console.error('❌ OneSignal API error:', error);
    return response.status(500).json({
      error: 'An internal error occurred.',
      details: error.message
    });
  }
}