require("dotenv").config();
const Labor = require("../models/Laborer");
const admin = require('firebase-admin');


const serviceAccount = require("C:/Users/Kaushal/Downloads/notify-4b111-firebase-adminsdk-fbsvc-7de843196f.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function sendNotification(phone, message) {
  try {
    const laborer = await Labor.findOne({ phone });

    if (!laborer) {
      throw new Error('Laborer not found.');
    }

    if (!laborer.fcmToken) {
      throw new Error('Laborer does not have a valid FCM token.');
    }

    const payload = {
      notification: {
        title: 'Job Notification',
        body: message,
      },
      token: laborer.fcmToken,
    };

    const response = await admin.messaging().send(payload);
    console.log('Successfully sent message:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error.message);
    throw error;
  }
}

// Send Notification API
exports.sendNotification = async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ message: 'Phone number and message are required.' });
    }

    const response = await sendNotification(phone, message);

    res.status(200).json({ message: 'Notification sent successfully!', response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

