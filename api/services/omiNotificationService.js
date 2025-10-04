const https = require('https');

/**
 * Sends a direct notification to an Omi user.
 * @param {string} userId - The Omi user's unique ID
 * @param {string} message - The notification text
 * @returns {Promise<object>} Response data or error
 */
function sendOmiNotification(userId, message) {
    const appId = process.env.OMI_APP_ID;
    const appSecret = process.env.OMI_APP_SECRET;

    if (!appId) throw new Error("OMI_APP_ID not set");
    if (!appSecret) throw new Error("OMI_APP_SECRET not set");

    const options = {
        hostname: 'api.omi.me',
        path: `/v2/integrations/${appId}/notification?uid=${encodeURIComponent(userId)}&message=${encodeURIComponent(message)}`,
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${appSecret}`,
            'Content-Type': 'application/json',
            'Content-Length': 0
        }
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(data ? JSON.parse(data) : {});
                    } catch (e) {
                        resolve({ raw: data });
                    }
                } else {
                    reject(new Error(`API Error (${res.statusCode}): ${data}`));
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

/**
 * Sends a task reminder notification
 * @param {string} userId - The OMI user's unique ID
 * @param {string} taskName - Name of the task
 * @param {string} dueDate - Due date of the task
 * @returns {Promise<object>} Response data
 */
async function sendTaskReminder(userId, taskName, dueDate) {
    const message = `Reminder: "${taskName}" is due ${dueDate}`;
    return sendOmiNotification(userId, message);
}

/**
 * Sends a service update notification
 * @param {string} userId - The OMI user's unique ID
 * @param {string} serviceName - Name of the service
 * @param {string} status - Status of the service
 * @returns {Promise<object>} Response data
 */
async function sendServiceUpdate(userId, serviceName, status) {
    const message = `${serviceName} status: ${status}`;
    return sendOmiNotification(userId, message);
}

/**
 * Sends a simple response notification (for webhook responses)
 * @param {string} userId - The OMI user's unique ID
 * @param {string} responseText - The response text
 * @returns {Promise<object>} Response data
 */
async function sendResponse(userId, responseText) {
    return sendOmiNotification(userId, responseText);
}

module.exports = { 
    sendOmiNotification,
    sendTaskReminder,
    sendServiceUpdate,
    sendResponse
};