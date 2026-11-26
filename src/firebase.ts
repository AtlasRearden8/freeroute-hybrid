import { initializeApp, type FirebaseApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAI, getGenerativeModel, GoogleAIBackend, InferenceMode, type GenerativeModel } from "firebase/ai";

const env = import.meta.env;

export const firebaseConfigured = Boolean(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID && env.VITE_FIREBASE_APP_ID);

export interface Models {
  localFirst: GenerativeModel; // PREFER_ON_DEVICE: Gemini Nano if present, else cloud
  cloudFirst: GenerativeModel; // PREFER_IN_CLOUD: cloud if reachable, else Gemini Nano
}

let cached: Models | null = null;

export function getModels(): Models | null {
  if (!firebaseConfigured) return null;
  if (cached) return cached;

  const app: FirebaseApp = initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  });

  // App Check is enforced for Firebase AI Logic. Debug provider for local dev only.
  if (env.VITE_APPCHECK_DEBUG === "true") {
    (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(env.VITE_RECAPTCHA_SITE_KEY || "debug-placeholder"),
    isTokenAutoRefreshEnabled: true,
  });

  const ai = getAI(app, { backend: new GoogleAIBackend() });
  cached = {
    localFirst: getGenerativeModel(ai, { mode: InferenceMode.PREFER_ON_DEVICE }),
    cloudFirst: getGenerativeModel(ai, { mode: InferenceMode.PREFER_IN_CLOUD }),
  };
  return cached;
}

/** Must run from a user gesture (button click) per Chrome's user-activation rule. */
export function warmOnDeviceModel(onProgress: (pct: number) => void): void {
  const m = getModels();
  if (!m) return;
  m.localFirst.initializeDeviceModel((v: number) => onProgress(Math.round(v * 10000) / 100));
  m.cloudFirst.initializeDeviceModel(() => {});
}
