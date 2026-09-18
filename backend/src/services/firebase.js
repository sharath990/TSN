const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');
const path = require('path');
const fs = require('fs');

let initialized = false;

const initFirebase = () => {
  if (initialized) return;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  const resolvedPath = serviceAccountPath
    ? path.resolve(__dirname, '../..', serviceAccountPath)
    : null;

  try {
    if (resolvedPath && fs.existsSync(resolvedPath)) {
      const serviceAccount = require(resolvedPath);
      admin.initializeApp({
        credential: admin.cert(serviceAccount),
      });
      initialized = true;
      console.log('Firebase Admin initialized with service account');
    } else if (projectId && projectId !== 'your-firebase-project-id') {
      admin.initializeApp({
        credential: admin.applicationDefault(),
      });
      initialized = true;
      console.log('Firebase Admin initialized with application default credentials');
    } else {
      console.warn('Firebase not configured — Google login disabled');
    }
  } catch (error) {
    console.warn('Firebase init failed:', error.message);
  }
};

const verifyFirebaseToken = async (idToken) => {
  if (!initialized) {
    throw new Error('Firebase not configured. Please set up Firebase in your .env file.');
  }

  try {
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(idToken);

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email?.split('@')[0] || 'User',
      picture: decodedToken.picture || null,
    };
  } catch (error) {
    console.error('Firebase token verification failed:', error.message);
    throw new Error('Invalid or expired Google token. Please try again.');
  }
};

initFirebase();

module.exports = { verifyFirebaseToken, initialized };
