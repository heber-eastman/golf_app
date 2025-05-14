import * as admin from 'firebase-admin';
import * as path from 'path';

// Initialize Firebase Admin SDK
// Note: In production, you should use environment variables for these values
// and store the service account key securely
if (!admin.apps.length) {
  try {
    const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
      path.join(__dirname, '../../config/golf-app-27b4b-firebase-adminsdk-fbsvc-8dbba234ee.json');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccountPath),
      projectId: 'golf-app-27b4b',
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

export const messaging = admin.messaging();

export default admin; 