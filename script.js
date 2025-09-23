document.addEventListener('DOMContentLoaded', () => {
    const scheduleForm = document.getElementById('schedule-form');
    const responseMessage = document.getElementById('response-message');

    // Set minimum time for datetime-local input to be the current time
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    const nowString = now.toISOString().slice(0, 16);
    document.getElementById('schedule-time').min = nowString;

    scheduleForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const message = document.getElementById('message').value;
        const scheduleTime = document.getElementById('schedule-time').value;

        if (!message || !scheduleTime) {
            responseMessage.textContent = 'Please fill out both fields.';
            responseMessage.style.color = 'red';
            return;
        }

        responseMessage.textContent = 'Scheduling...';
        responseMessage.style.color = '#333';

        try {
            const response = await fetch('/api/schedule-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    scheduleTime,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                responseMessage.textContent = 'Notification scheduled successfully!';
                responseMessage.style.color = 'green';
                scheduleForm.reset();
                document.getElementById('schedule-time').min = nowString;
            } else {
                throw new Error(result.error || 'Failed to schedule notification.');
            }
        } catch (error) {
            responseMessage.textContent = `Error: ${error.message}`;
            responseMessage.style.color = 'red';
        }
    });
});
