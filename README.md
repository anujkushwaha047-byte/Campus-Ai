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
- 🎓 **Verified Student Authentication**: Multi-factor OTP validation for registered `@its.edu.in` addresses with rate limiting and secure session tokens.
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
   Copy `.env.example` to `.env`. Empty secret fields are intentional: local demo mode works without production credentials. If enabling local Resend delivery, set `EMAIL_PROVIDER=resend`, a private Resend API key, and a sender address at a domain verified in Resend. Never commit `.env`.

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

- `render.yaml` declares a paid Starter web service and a 1 GB persistent disk mounted at `/var/data`; it sets `DATA_DIR=/var/data` and `EMAIL_PROVIDER=resend`. The running Render service must actually have this blueprint applied and the disk mounted. If configuring the service manually, attach a persistent disk with mount path `/var/data` and set `DATA_DIR=/var/data` in the service's Environment settings. Do not point `DATA_DIR` at an unmounted path: startup creates the directory and performs a write/delete check, but cannot determine whether a writable directory is persistent. All JSON/CSV stores, including the student roster, managed accounts, login throttling, and revoked sessions, are under `DATA_DIR`. The single-instance disk-backed design requires a paid Render service and does not support scaling this service to multiple instances.
- **Temporary Render Free demo (not persistent):** Render Free does not provide a persistent disk. For a short-lived demo only, explicitly set `ALLOW_EPHEMERAL_DATA=true` and `DATA_DIR=/tmp/campuscare-data` in the service's Environment settings. This opt-in is accepted only when `DATA_DIR` is inside the operating system temporary directory; the app still checks that it is writable and prints a warning at startup. Do not use this mode for real student or complaint records. The student CSV, complaints, notifications, managed accounts, rate-limit counters, and logout revocations can disappear on restart, sleep, or redeploy; provision the real student CSV again after data loss. The signing secret is generated afresh for each process, so every user must log in again after a restart. Authentication and Resend OTP checks stay enabled, but persisted rate limits reset with the temporary storage. Use a paid persistent disk for continuity and production use. Keep all other production configuration and authentication requirements unchanged.
- **Required Render variables:** `NODE_ENV=production`, `DEMO_MODE=false`, `APP_URL`, `AUTH_SECRET`, `ADMIN_PASSWORD`, `STAFF_CREDENTIALS`, `SECTOR_ADMIN_CREDENTIALS`, `SUPER_ADMIN_NAME`, `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`, `EMAIL_PROVIDER=resend`, `RESEND_API_KEY`, `OTP_FROM_EMAIL`, `DATA_DIR=/var/data`, and `ALLOWED_COLLEGE_EMAIL_DOMAIN=@its.edu.in`. Render injects `PORT`. `CORS_ALLOWED_ORIGINS` is optional and accepts a comma-separated list of additional exact HTTPS origins. `ADMIN_EMAIL` is optional and defaults to `admin@college.edu`; `GEMINI_API_KEY` is optional unless Gemini features are required.
- **Credential formats:** `AUTH_SECRET` must be a unique, non-placeholder, high-entropy secret of at least 32 bytes; generate one with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`. `APP_URL` must be the exact public HTTPS origin, with no path or trailing slash. `ADMIN_PASSWORD` is 12-200 characters and belongs to `ADMIN_EMAIL`. `STAFF_CREDENTIALS` must be a JSON object containing all four supported keys: `warden@college.edu`, `maintenance@college.edu`, `it.staff@college.edu`, and `electrical@college.edu`. `SECTOR_ADMIN_CREDENTIALS` must be a JSON object containing all sixteen keys: `it.admin@college.edu`, `electrical.admin@college.edu`, `water.admin@college.edu`, `mess.admin@college.edu`, `housekeeping.admin@college.edu`, `hostel.admin@college.edu`, `fire.admin@college.edu`, `security.admin@college.edu`, `facilities.admin@college.edu`, `transport.admin@college.edu`, `sports.admin@college.edu`, `academics.admin@college.edu`, `exam.admin@college.edu`, `library.admin@college.edu`, `fees.admin@college.edu`, and `general.admin@college.edu`. Each JSON value must be a string containing a distinct 12-200 character password; all passwords must be unique across `ADMIN_PASSWORD`, both maps, and `SUPER_ADMIN_PASSWORD`. Emails must be exact lowercase map keys. `SUPER_ADMIN_NAME` is 1-100 characters, `SUPER_ADMIN_EMAIL` must match a valid email address, and `SUPER_ADMIN_PASSWORD` must be 12-200 characters. Enter actual passwords and secrets only in Render's private Environment settings; do not put them in `render.yaml`, `.env.example`, or source control.
- **Resend OTP setup:** Set `EMAIL_PROVIDER=resend`; `RESEND_API_KEY` must match `^re_[A-Za-z0-9_-]{8,}$` and must not use a placeholder/test prefix. `OTP_FROM_EMAIL` must match the app's email-address syntax and use a domain verified and authorized in Resend. The app checks configuration shape at startup; Resend confirms that the key and sender are authorized when delivery is attempted. Student email OTP is sent only to the registered matching roll-number/email pair at `@its.edu.in`. Production responses, page content, client bundle, and logs must not disclose OTP values. Provider rejection/network failures do not create a verifiable challenge or an authenticated session; their send response intentionally remains generic so it does not reveal whether a student is registered.
- **Configure and redeploy on Render:**
  1. For normal production, open the existing `campus-ai` Web Service and confirm it is on a paid plan with a persistent disk mounted at `/var/data`. If using Render Free for a temporary demo only, skip the disk and instead explicitly set `ALLOW_EPHEMERAL_DATA=true` and `DATA_DIR=/tmp/campuscare-data`; read the limitations above before proceeding.
  2. Open **Environment**. Add or correct every required variable listed above. Set `DATA_DIR` to `/var/data`, `EMAIL_PROVIDER` to `resend`, and the student email domain to `@its.edu.in`. Render's blueprint supplies these three non-secret settings only when the blueprint is applied; verify they are actually present on the live service.
  3. Set `APP_URL` to the service's exact HTTPS URL. Generate `AUTH_SECRET` privately. Create strong unique passwords for all accounts and enter the JSON credential maps in Render without changing or omitting any account keys. Obtain `RESEND_API_KEY` from Resend and verify the sending domain before setting `OTP_FROM_EMAIL`. Do not paste secrets into GitHub, `render.yaml`, or deployment logs.
  4. Save the environment changes, then use **Manual Deploy → Deploy latest commit** (or trigger a deploy after saving). Watch the deploy logs: startup must complete and `/api/health` must pass. A missing, invalid, or unwritable setting is intentionally a startup failure; correct it in Render rather than weakening validation.
  5. Provision the institution's actual student roster as `students.csv` under the persistent disk using the existing header `student_id,roll_number,email,phone,email_verified,registration_date`. Production OTP works only for a unique matching roster record with an `@its.edu.in` address. Test delivery with an enrolled student and check provider delivery status in Resend; never use or expose OTP values as a demo shortcut.
- Authentication tokens remain valid across server restarts only when the same `AUTH_SECRET` is retained. Legacy static Admin/Warden/Staff tokens are also bound to their configured password version and are invalidated when the corresponding environment password changes. Demo tokens are rejected when demo mode is disabled.
- Tokens must carry session schema version 2. Tokens issued before this rollout are rejected, including existing student, static staff/admin, and managed-admin sessions; users must sign in again after deployment. Keep the existing `AUTH_SECRET` unchanged to avoid additional, unrelated token invalidation.
- The first server startup hashes the configured Super Admin password and persists the account in `admin-accounts.json`. Later restarts do not reset it from environment variables. To rotate it, use the Super Admin password-change form on the Admin Dashboard; the current password is required and existing Super Admin sessions are revoked. College Admin account changes are serialized to prevent concurrent duplicate emails.
- Super Admin can create College Admin accounts using passwords of at least 12 characters, deactivate/reactivate them, and reset their passwords. Deactivation and password reset invalidate that account's existing sessions. College Admins cannot access account-management endpoints or promote accounts.
- Super Admin can manage Warden and department Staff accounts through `GET`/`POST /api/admin/staff-accounts`, `PATCH /api/admin/staff-accounts/:id` (active state), and `POST /api/admin/staff-accounts/:id/reset-password`. New accounts receive a generated department Staff ID (for example, `IT/002`); Super Admin may supply a valid unused ID. IDs are checked against student roll numbers and other staff IDs, are immutable after creation, and accounts can only have the `warden` or `staff` role. Passwords are stored as scrypt hashes; hashes are never returned. This is an API-only management surface, not an additional UI.
- The existing Staff Login identifier accepts either a legacy configured staff email or the assigned Staff ID, and still requires that account's existing password. Legacy configured accounts retain the IDs `WARDEN/001`, `MAINT/001`, `IT/001`, and `ELEC/001`; managed staff accounts use persistent `staff-accounts.json` records. Student roll-number/email/OTP login and its screen are unchanged.
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
