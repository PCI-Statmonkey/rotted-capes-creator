import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

initializeApp({
  credential: applicationDefault(),
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
});

export { getAuth };
