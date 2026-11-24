import "server-only";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

let adminApp;

function getAdminApp() {
  if (adminApp) return adminApp;
  const serviceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };
  if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey)
    throw new Error("Firebase Admin SDK environment variables are not configured.");
  adminApp = getApps().length
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
  return adminApp;
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
export function getAdminDb() {
  return getFirestore(getAdminApp());
}
export function getAdminStorage() {
  return getStorage(getAdminApp());
}
