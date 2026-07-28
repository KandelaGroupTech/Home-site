# TKG Blueprint - Investor Platform Replication Guide

This document is a step-by-step blueprint designed for an AI Agent to completely rebuild the Kandela Group Investor Platform from scratch on a new domain. 

If you are an AI reading this, follow these phases strictly to recreate the architecture, security, and features of the platform.

---

## Phase 1: Project Initialization & UI Foundation

1. **Frontend Scaffolding:** 
   - Initialize a new React 18 project using Vite (`npm create vite@latest . -- --template react-ts`).
   - Install Tailwind CSS, PostCSS, and Autoprefixer. Configure `tailwind.config.js` with the brand colors (Dark Navy: `#0f172a`, Teal accents: `#006464`, `#0d9488`).
   - Install UI dependencies: `lucide-react` (icons), `react-phone-number-input`, `react-google-autocomplete`, `firebase`.
   
2. **Component Library:**
   - Create highly styled, glassmorphism-inspired UI components.
   - The design should feel premium: use deep slate backgrounds (`bg-slate-950`), semi-transparent cards (`bg-slate-900/50 backdrop-blur-sm`), and teal gradients.

---

## Phase 2: Firebase Infrastructure & Security

1. **Project Setup:**
   - Create a new Google Firebase project.
   - Enable **Firestore Database**, **Firebase Storage**, and **Firebase Authentication** (Email/Password).

2. **Security Rules Implementation:**
   - **Firestore Rules:** 
     - `users/{uid}`: Only readable/writable by the owner or an admin.
     - `documents/{docId}`: Readable only if `userId == request.auth.uid` or admin.
     - `announcements/{id}`: Readable by all authenticated users, writable only by admin.
   - **Storage Rules:**
     - `documents/{userId}/{fileName}`: strict isolation where only the specific user or admin can read/write.

3. **Data Model:**
   - Users collection requires fields: `firstName`, `lastName`, `email`, `role` (`'admin'` or `'investor'`), `company`, `address`, `phone`.

---

## Phase 3: The Custom Email Engine (Resend)

To bypass the uneditable default Firebase emails, build a custom branded email pipeline:

1. **Firebase Extensions:**
   - Install the **Trigger Email from Firestore** extension in the Firebase Console.
   - Configure it to listen to a collection named `mail`.
   - Set the SMTP connection to a third-party transactional email provider (like Resend).

2. **Frontend Templates (`src/lib/emailTemplates.ts`):**
   - Create robust inline-styled HTML templates that match the brand's premium look (navy headers, centered teal logos/dots).
   - Create functions for `buildWelcomeEmail`, `buildDocumentUploadEmail`, `buildAnnouncementEmail`, and `buildPasswordResetEmail`.

3. **Cloud Functions (`/functions`):**
   - Initialize Firebase Cloud Functions (`firebase init functions` -> TypeScript).
   - Write a function called `sendPasswordResetEmailBranded` that:
     1. Uses the Firebase Admin SDK to call `admin.auth().generatePasswordResetLink(email)`.
     2. Looks up the user's first name in Firestore for a personalized greeting.
     3. Writes the branded HTML document to the `mail` collection to be picked up by the Trigger Email extension.
   - *Crucial:* Pass `from: 'Brand Name <noreply@newdomain.com>'` inside the `message` object to override the extension's default sender.

---

## Phase 4: Core Admin Dashboard

1. **Admin Routing & Protection:**
   - Create a React context to track `currentUser` and `userRole`.
   - Ensure routes starting with `/admin` automatically kick out non-admin users.

2. **Directory & Onboarding:**
   - Build a module to add new investors.
   - *Logic:* When adding a user, use a secondary Firebase App instance (`initializeSecondaryApp`) to create the Auth user without logging the admin out. Save their profile to Firestore, then write a welcome email to the `mail` collection containing their temporary password.

3. **Document Management:**
   - Build a file uploader that drops files into Firebase Storage (`documents/{userId}/{file}`).
   - Save the metadata to Firestore (`documents` collection).
   - On upload success, write a notification to the `mail` collection.

---

## Phase 5: Investor Portal

1. **Dashboard Layout:**
   - Build a side-navigation layout providing access to: Welcome, Documents, Tax Documents, Secure File Drop, FAQ, Profile.

2. **Secure File Drop:**
   - Allow investors to upload files directly to the admin team (Storage path: `investor_uploads/{userId}/{fileName}`).
   - Include an optional notes textarea. Write metadata to Firestore so admins can track these submissions in a dashboard.

3. **Profile Settings & Google Maps:**
   - Allow users to edit their information.
   - Integrate `react-google-autocomplete` for the address field.
   - *Requirement:* The API key must be provided via `import.meta.env.VITE_GOOGLE_MAPS_API_KEY` and restricted in Google Cloud to the specific domain.

4. **Password Reset Flow:**
   - Instead of using the client-side `sendPasswordResetEmail`, build a button that calls the `sendPasswordResetEmailBranded` Cloud Function. This ensures all password resets route through the custom Resend template.

---

## Final Deployment Checklist
1. Deploy frontend to Vercel/Netlify.
2. Deploy backend functions via `firebase deploy --only functions`.
3. Add `VITE_GOOGLE_MAPS_API_KEY` to Vercel Environment Variables.
4. Verify Resend DNS records are verified on the new domain.
5. Create the initial Admin user manually in Firebase Auth, and set `role: 'admin'` in their Firestore document to bootstrap the system.

> **AI Sub-Agent Protocol:** If you are an AI modifying this system in the future, you must spawn a sub-agent to review your structural changes and update this Blueprint and the README accordingly.
