# Givelight

Givelight is a personal public experiment in generosity. The product is not an NGO marketplace, charity registry, or multi-cause fundraising app. It is a transparent live fund where small public contributions can be reviewed and added to a verified fund before they appear publicly.

## Product rules

- No fake NGO or campaign content
- No fake beneficiary claims or guaranteed payouts
- No fake verified partner badges
- No fake donor names, donations, or countdowns
- Public totals and leaderboard update only from verified admin-approved records
- Manual QR payment + manual admin review is the current workflow

## Local setup

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Firebase setup

Create a Firebase project and enable:

- Authentication
  - Anonymous sign-in
  - Google provider
- Firestore
- Realtime Database
- Storage

Set the public web config in your environment file, for example:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
```

## Admin claim setup

Use the owner’s real Google/Gmail UID from Firebase Console:

1. Go to Firebase Console → Authentication → Users
2. Copy the owner Google UID
3. Run:

```bash
npm run set-admin -- YOUR_FIREBASE_UID
```

Then tell the owner to log out and log back in, or call `getIdToken(true)` to refresh the token.

## Verify admin claim

```bash
npm run verify-admin -- YOUR_FIREBASE_UID
```

## Firebase CLI commands

```bash
firebase login
firebase use <project-id>
firebase deploy --only firestore:rules,storage,functions
```

## Cloud Functions billing note

The Firebase functions and admin tooling rely on Firebase services. Some features, including Cloud Functions and Storage, require a Firebase billing plan / Blaze project depending on your Firebase setup.

## Owner workflow

- Add payment QR methods in the admin dashboard
- Review self-confirmed contributions
- Approve or reject each contribution manually
- Add founder contributions as required
- Publish future plans or transparency updates only when the owner is ready

## QR upload workflow

- Upload QR images in the admin area
- Add payee name, account or UPI ID, and payment link
- Mark the active region and currency
- Keep the payment method active only when the owner is ready to receive public contributions

## Production checklist

- Anonymous Auth enabled
- Google provider enabled
- Firestore rules deployed
- Realtime Database rules deployed
- Storage rules deployed
- Admin custom claim set via Firebase Admin SDK only
- No client-side admin role grant
- Manual verification process documented for the owner
- No secrets committed to Git

## Development and emulator testing

```bash
firebase emulators:start
npm run dev
```

## Manual payment limitation

This app is intentionally built around manual QR payment confirmation and manual review by the owner. There is no automatic merchant payment gateway, webhook, or instant credit system yet.

## Important security warning

Never commit Firebase service-account JSON or other secrets. Keep all privileged operations in Firebase Admin SDK scripts or Cloud Functions, not in frontend code.
