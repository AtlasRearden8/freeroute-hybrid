# Firebase setup (about 10 minutes, fewest clicks)

Do this on your own computer, signed into Google. When you are done, send me only the values listed at the bottom. I do not need to log into your Google or Firebase account.

## 1. Create the project and turn on AI Logic
1. Open https://console.firebase.google.com/ and click **Create a project** (or **Add project**).
2. Name it `freeroute-hybrid`. You can turn **Google Analytics** off to skip that screen. Click through until the project opens.
3. In the left menu open **AI Services** → **AI Logic** (if you do not see it, use the search box at the top of the console and type `AI Logic`).
4. Click **Get started**. When asked for a Gemini API provider, choose **Gemini Developer API** (the free-tier option). Finish the guided steps, including registering a **Web** app if it asks. If it does not, go to Project overview → the gear → **Project settings** → **Your apps** → the **</>** web icon, nickname `freeroute-hybrid`, and register the app.

## 2. Copy the web config (this is not a secret)
Still under **Project settings** → **Your apps** → your web app, you will see a `firebaseConfig` object. Copy these six values back to me in chat (or email). They are public client config, not passwords:

- `apiKey`
- `authDomain`
- `projectId`
- `storageBucket`
- `messagingSenderId`
- `appId`

## 3. Optional but needed for a public demo: reCAPTCHA site key
Firebase AI Logic enforces **App Check**. For a site other people can open:

1. Open https://www.google.com/recaptcha/admin and create a **reCAPTCHA v3** key.
2. Add the domains `atlasrearden8.github.io` and `localhost`.
3. In Firebase: **Build** (or **Security**) → **App Check** → your web app → register **reCAPTCHA v3** and paste the **site key**.
4. Send me the reCAPTCHA **site key** (it starts something like `6L…` and is meant to be public in the web app).

**Stop there for the secret key.** reCAPTCHA also shows a **secret key**. I do **not** need it for this app, and it must not go in the repo or in ordinary chat. If you ever think I need it, send it only through the vault, never pasted in a message.

You can skip step 3 for now. With only the web config from step 2 I can test the cloud path locally using App Check’s debug token (I will walk you through registering that token if we need it). The public demo still needs step 3 before judges visit the site.

## What to send back, in one message
- The six `firebaseConfig` values (safe to paste here).
- The reCAPTCHA **site key** only, if you created one (safe to paste here).
- Do not send the reCAPTCHA **secret key** unless I ask, and then only through the vault.


## If the web config is already sent: one more click

Registering the web app is not the same as enabling AI Logic. A test call just now returned: the Firebase AI API (`firebasevertexai.googleapis.com`) is not enabled on project `freeroute-hybrid`.

Open this page and click **Get started** (or **Enable**):

https://console.firebase.google.com/project/freeroute-hybrid/ailogic/

Wait a minute, then tell me it's on. I can retest from here. No new values to copy.
