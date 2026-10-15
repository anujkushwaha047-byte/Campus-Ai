# 🎓 CampusCare — AI-Powered University Complaint Management System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-campus--ai--qgwx.onrender.com-blue?style=for-the-badge&logo=render)](https://campus-ai-qgwx.onrender.com)
[![Institution](https://img.shields.io/badge/Institution-I.T.S%20Engineering%20College-red?style=for-the-badge)](https://itsengg.edu.in/public/)
[![Powered By](https://img.shields.io/badge/AI-Google%20Gemini%20API-orange?style=for-the-badge&logo=google)](https://ai.google.dev/)

> **Live Deployment:** [https://campus-ai-qgwx.onrender.com](https://campus-ai-qgwx.onrender.com)

---

## 👥 Student Project Team (CSE AIML)

1. 🌟 **Anuj Kushwaha** — **Lead Student Developer**
2. **Ankit Kumar Singh** — Student Developer
3. **Abhinav Tiwari** — Student Developer

**Institution:** I.T.S Engineering College, 46 Knowledge Park III, Greater Noida

---

## 🌟 Overview

**CampusCare** is an enterprise-grade, intelligent grievance redressal and campus issue management platform engineered for universities and collegiate institutions. It bridges students, faculty, and administrative departments through AI-driven triage, transparent SLA tracking, and real-time resolution workflows.

---

## 🚀 Key Features

- 🔐 **Login-First Gateway & Route Protection**: Complete public entry point with session validation on page refresh. Protected pages strictly require verified credentials.
- 🤖 **AI Priority & Sentiment Triage**: Powered by Google Gemini AI to analyze issue descriptions, categorize complaints, assign urgency levels (Critical, High, Medium, Low), and calculate expected SLAs.
- 🎓 **Verified Student Authentication**: Multi-factor OTP validation for official `.edu.in` university email addresses with rate limiting and secure session tokens.
- ⚡ **Instant Demo Access**: 1-click test login options with pre-configured accounts for rapid demonstration and review.
- 📊 **Real-time Resolution Tracking**: Dynamic status timelines (Submitted → AI Analyzed → Under Review → Assigned → In Progress → Resolved).
- 🏢 **Multi-Department Management**: Segregated oversight for Hostels, Academics/Faculty, Library, Examination Cell, IT Infrastructure, and Campus Sanitation.
- 📈 **Institutional Analytics**: High-performance dashboard with SLA metrics, category breakdowns, and recurring issue detection.
- 💬 **Interactive Officer & Student Communication**: Real-time remarks, notes, and audit logs.

---

## 🔗 Live Application

- **Production URL**: [https://campus-ai-qgwx.onrender.com](https://campus-ai-qgwx.onrender.com)
- **Default Landing**: `/login` (Protected `/dashboard`)

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite, Lucide Icons, Recharts, Motion
- **Backend**: Node.js, Express, TypeScript, tsx
- **AI Engine**: Google Gemini API (`@google/genai`)
- **Data Persistence**: Student CSV plus JSON complaint and notification stores under `data/` (or `DATA_DIR`)
- **Deployment**: Render Web Service ..

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or bun

### Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anujkushwaha047-byte/Campus-Ai.git
   cd Campus-Ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY="your_google_gemini_api_key"
   AUTH_SECRET="REPLACE_WITH_OUTPUT_OF_node_crypto_randomBytes_48_base64url"
   ADMIN_EMAIL="admin@college.edu"
   ADMIN_PASSWORD="a-unique-strong-legacy-admin-password"
   STAFF_CREDENTIALS=""
   SECTOR_ADMIN_CREDENTIALS=""
   STAFF_PASSWORD=""
   SUPER_ADMIN_NAME="Campus Super Admin"
   SUPER_ADMIN_EMAIL="superadmin@college.edu"
   SUPER_ADMIN_PASSWORD="use-a-unique-password-of-at-least-12-characters"
   DEMO_MODE="true"
   ALLOWED_COLLEGE_EMAIL_DOMAIN=".edu.in"
   DATA_DIR="./data"
   APP_URL="http://localhost:3000"
   CORS_ALLOWED_ORIGINS=""
   # Optional locally; when set, OTPs are delivered through Resend instead of demo-code display.
   EMAIL_PROVIDER="resend"
   RESEND_API_KEY="re_replace-with-your-private-key"
   OTP_FROM_EMAIL="verified-sender@your-domain.example"
   ```
   Generate `AUTH_SECRET` with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"` and replace the placeholder; never use the placeholder value in production.

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Build for production:**
   ```bash
   npm run build
   npm run start
   ```

### Production configuration and persistence

- `render.yaml` provisions a paid Starter web service with a 1 GB persistent disk mounted at `/var/data`, and sets `DATA_DIR=/var/data`. All JSON/CSV stores, including admin accounts, login throttling, and revoked sessions, must stay under this mount. Render persistent disks require a paid service and prevent scaling that service to multiple instances.
- Render requires `APP_URL` (the exact public HTTPS origin, for example `https://your-service.onrender.com`), `AUTH_SECRET`, `ADMIN_PASSWORD`, `STAFF_CREDENTIALS`, `SECTOR_ADMIN_CREDENTIALS`, `SUPER_ADMIN_NAME`, `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`, `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, and `OTP_FROM_EMAIL`; set credential JSON and secret values privately in Render. `RESEND_API_KEY` must use Resend's `re_` key format. Verify a sending domain in Resend first; set `OTP_FROM_EMAIL` to an address at that verified domain (Resend may still reject sending if the domain or key is not active/authorized). The app validates the key's shape and sender email syntax at startup; it does not verify credentials against Resend or verify DNS ownership. Each credential object must contain an individual, unique 12+ character password for every account key in its matching server-side account map; neither staff nor sector accounts share the main Admin password. `CORS_ALLOWED_ORIGINS` is an optional comma-separated list of additional exact HTTPS origins. Use a high-entropy, non-placeholder `AUTH_SECRET` of at least 32 bytes. Demo login is disabled in production. `ADMIN_EMAIL` is optional and defaults to `admin@college.edu`; `GEMINI_API_KEY` is optional unless Gemini features are required.
- Authentication tokens remain valid across server restarts only when the same `AUTH_SECRET` is retained. Legacy static Admin/Warden/Staff tokens are also bound to their configured password version and are invalidated when the corresponding environment password changes. Demo tokens are rejected when demo mode is disabled.
- Tokens must carry session schema version 2. Tokens issued before this rollout are rejected, including existing student, static staff/admin, and managed-admin sessions; users must sign in again after deployment. Keep the existing `AUTH_SECRET` unchanged to avoid additional, unrelated token invalidation.
- The first server startup hashes the configured Super Admin password and persists the account in `admin-accounts.json`. Later restarts do not reset it from environment variables. To rotate it, use the Super Admin password-change form on the Admin Dashboard; the current password is required and existing Super Admin sessions are revoked. College Admin account changes are serialized to prevent concurrent duplicate emails.
- Super Admin can create College Admin accounts using passwords of at least 12 characters, deactivate/reactivate them, and reset their passwords. Deactivation and password reset invalidate that account's existing sessions. College Admins cannot access account-management endpoints or promote accounts.
- For backward compatibility, `ADMIN_EMAIL`/`ADMIN_PASSWORD` still authenticate the legacy `main_admin` account, which can manage complaints but cannot manage Super Admin or College Admin accounts. Sector Admin and Warden/Staff legacy identities remain supported but require distinct account-specific credentials in production; the shared `STAFF_PASSWORD` fallback is local-demo-only. There are no weak built-in password defaults.
- Login and OTP requests are each limited to 10 attempts per IP per 15 minutes, and Super Admin account mutations to 10 per authenticated administrator per 15 minutes. Keyed identities are stored under `DATA_DIR`; successful requests consume a rate-limit attempt too. AI analysis throttling remains process-local and resets on restart. Keep a stable `AUTH_SECRET` and a single disk-backed service instance for the file-based limits and logout revocations to remain effective.
- Production CORS only allows `APP_URL` and explicitly listed `CORS_ALLOWED_ORIGINS`; localhost origins are development-only. The app uses bearer tokens, not credentialed cookies.
- Student OTP uses Resend's official email API (`POST https://api.resend.com/emails`) via Node's built-in `fetch`; no provider SDK dependency is required. Production startup requires `EMAIL_PROVIDER=resend`, a `re_`-prefixed `RESEND_API_KEY`, and a syntactically valid `OTP_FROM_EMAIL` at a verified Resend domain. Missing or malformed configuration prevents production startup; real key validity and domain verification are only confirmed by the provider when a send is attempted. Unknown accounts, provider rejection, and delivery/network failures intentionally receive the same generic send response to avoid account enumeration. OTP verification also uses the same generic status/message for invalid, expired, missing, and exhausted challenges. A challenge is retained only after a successful provider response; failed delivery does not create a challenge or issue a student session. The endpoint response therefore does not confirm delivery; if no message arrives, retry later or contact the operator. Local demo OTP remains available only when `DEMO_MODE=true` and no provider is configured. OTP challenges are bound to a unique registered CSV student ID, roll number, and exact email; they expire after five minutes, are one-time, allow at most five attempts, and enforce a 20-second cooldown per roll/email pair plus the persisted per-IP limit. Challenges/cooldowns are memory-only and expire on restart; users can request a new code.
- Production does not seed demonstration student rows into a new `students.csv`. Before enabling student login on a fresh persistent disk, provision the registered roster in `students.csv` using the existing header `student_id,roll_number,email,phone,email_verified,registration_date`; OTP delivery will only be attempted when the roll number and email identify the same unique roster record. Local demo mode continues to seed the existing sample users.
- This repository does not currently include PostgreSQL or read `DATABASE_URL`. Student records are stored in `students.csv`; complaints (including comments and timeline), notifications, and managed administrator accounts are stored in JSON files.
- File replacements use a same-directory temporary file (mode `0600`) and rename to reduce partial-file exposure and truncation risk; the POSIX data directory is restricted to mode `0700` at startup. Separate CSV/JSON files are not a transactional database, do not provide cross-file atomicity or fsync durability, and have no cross-process locking. Login rate-limit records and session revocations survive restarts, while OTP challenges and cooldowns do not. `DATA_DIR` is checked for write access during startup; set it to the persistent disk mount, not the ephemeral application filesystem. This file-backed design assumes a single service instance and should not be scaled horizontally. A Render persistent disk is live storage, not a backup; arrange independent backups and test restore procedures.

---

## 📜 License

This project is licensed under the MIT License. Developed for University Student Grievance Redressal Committees (SGRC).
