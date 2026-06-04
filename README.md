# The Kandela Group - Investor Portal

This repository contains the full stack for The Kandela Group's custom Investor Portal and Admin Dashboard.

## 🏗️ Architecture & Tech Stack
- **Frontend Framework:** React 18 with TypeScript, built using Vite.
- **Styling:** Tailwind CSS for responsive, modern UI design.
- **Hosting:** Vercel (Frontend).
- **Backend/Database:** Google Firebase (Firestore, Firebase Storage, Firebase Auth).
- **Cloud Functions:** Node.js (TypeScript) deployed to Firebase for secure backend operations.
- **Email Delivery:** Resend SMTP routed via the Firebase "Trigger Email from Firestore" Extension.

## 🔐 Authentication & Roles
- **Firebase Auth:** Handles user authentication.
- **Role-Based Access Control (RBAC):** Users are assigned roles (`admin` or `investor`) inside their Firestore `users/{uid}` document.
- **Security Rules:** Firestore and Storage rules strictly enforce that investors can only read/write their own files, while admins have global read/write access.

## ✨ Core Features

### 1. Admin Dashboard (`/admin`)
- **Directory Management:** View, add, edit, and delete investor profiles. Adding an investor automatically provisions their Firebase Auth account and sends a branded welcome email with a temporary password.
- **Document Management:** Upload PDFs and other documents directly to specific investors.
- **Announcements:** Broadcast system-wide announcements to all active investors, automatically dispatching branded email notifications.
- **Activity Monitoring:** Review secure file drops from investors.

### 2. Investor Portal (`/dashboard`)
- **Document Vault:** Securely view and download personalized investment documents, tax documents, and legal forms.
- **Secure File Drop:** Upload sensitive documents directly to the Kandela administration team with optional notes.
- **Announcements:** Read platform-wide updates and news.
- **Profile Management:** Update personal information, mailing address (powered by Google Maps Autocomplete), contact details, and trigger secure password resets.

### 3. Automated Branded Communications
All automated emails are routed through a Firestore `mail` collection and dispatched via Resend to ensure high deliverability and consistent branding (dark navy headers, teal accents).
- **Welcome Emails:** Sent when an admin creates a new investor.
- **New Document Alerts:** Sent when an admin uploads a file to an investor's folder.
- **Announcements:** Broadcasted to all users.
- **Password Resets:** Sent via a dedicated Cloud Function (`sendPasswordResetEmailBranded`) to bypass Firebase's uneditable default templates, providing a seamless branded experience.

## 📂 Directory Structure
- `/src/components`: Reusable UI components and major dashboard views (Admin, Investor).
- `/src/pages`: Top-level route pages (Login, Dashboard).
- `/src/lib`: Core utilities (Firebase initialization, email templates).
- `/functions`: Firebase Cloud Functions backend (Node.js/TypeScript).

## 🚀 Development Setup
1. Clone the repository.
2. Run `npm install` in the root directory.
3. Run `npm install` in the `/functions` directory.
4. Ensure `.env.local` contains `VITE_GOOGLE_MAPS_API_KEY`.
5. Run `npm run dev` to start the Vite development server.
