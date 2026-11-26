// Public Firebase *web* config for project freeroute-hybrid.
// These client values are embedded in every copy of the app by design (they are not API secrets).
// Do not put a reCAPTCHA *secret* key, service account, or App Check debug token here.

export const firebaseWebConfig = {
  apiKey: "AIzaSyBAzfvki7iTnPutvyT-FfW3l3RIrt9Enns",
  authDomain: "freeroute-hybrid.firebaseapp.com",
  projectId: "freeroute-hybrid",
  storageBucket: "freeroute-hybrid.firebasestorage.app",
  messagingSenderId: "1049397117849",
  appId: "1:1049397117849:web:0ccf335548c06abaaa4908",
  measurementId: "G-9W6P2JW86Q",
} as const;

export const firebaseConfigured = Boolean(
  firebaseWebConfig.apiKey && firebaseWebConfig.projectId && firebaseWebConfig.appId,
);
