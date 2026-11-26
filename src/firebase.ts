import { initializeApp, type FirebaseApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAI, getGenerativeModel, GoogleAIBackend, InferenceMode, type GenerativeModel } from "firebase/ai";
import { firebaseWebConfig, firebaseConfigured as configPresent } from "./firebase-config";

const env = import.meta.env;

export const firebaseConfigured = configPresent;

export interface Models {
  localFirst: GenerativeModel; // PREFER_ON_DEVICE: Gemini Nano if present, else cloud
  cloudFirst: GenerativeModel; // PREFER_IN_CLOUD: cloud if reachable, else Gemini Nano
}

let cached: Models | null = null;
let appCheckInitialized = false;

export function getModels(): Models | null {
  if (!firebaseConfigured) return null;
  if (cached) return cached;

  const app: FirebaseApp = initializeApp({
    apiKey: firebaseWebConfig.apiKey,
    authDomain: firebaseWebConfig.authDomain,
    projectId: firebaseWebConfig.projectId,
    appId: firebaseWebConfig.appId,
    storageBucket: firebaseWebConfig.storageBucket,
    messagingSenderId: firebaseWebConfig.messagingSenderId,
  });

  // App Check is only initialized when a reCAPTCHA *site* key is present, or when
  // a local debug token is explicitly requested. Skipping it lets us see whether
  // AI Logic actually requires App Check (the live demo should work without it if
  // enforcement is off).
  const recaptchaSiteKey = env.VITE_RECAPTCHA_SITE_KEY as string | undefined;
  const debug = env.VITE_APPCHECK_DEBUG === "true";
  if (!appCheckInitialized && (recaptchaSiteKey || debug) && typeof self !== "undefined") {
    if (debug) {
      (self as unknown as { FIREBASE_APPCHECK_DEBUG_TOKEN: boolean }).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    if (recaptchaSiteKey) {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(recaptchaSiteKey),
        isTokenAutoRefreshEnabled: true,
      });
      appCheckInitialized = true;
    }
  }

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
