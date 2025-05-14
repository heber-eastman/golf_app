import { messaging } from '../config/firebase';

async function testFirebaseSetup() {
  try {
    // Try to send a test message to verify Firebase is working
    const message = {
      notification: {
        title: 'Test Notification',
        body: 'This is a test notification from the Golf App',
      },
      topic: 'test',
    };

    const response = await messaging.send(message);
    console.log('Successfully sent test message:', response);
  } catch (error) {
    console.error('Error sending test message:', error);
  }
}

testFirebaseSetup(); 