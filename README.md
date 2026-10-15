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
   AUTH_SECRET="a-persistent-random-secret-of-at-least-32-bytes"
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
   ```

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
- Render requires `APP_URL` (the exact public HTTPS origin, for example `https://your-service.onrender.com`), `AUTH_SECRET`, `ADMIN_PASSWORD`, `STAFF_CREDENTIALS`, `SECTOR_ADMIN_CREDENTIALS`, `SUPER_ADMIN_NAME`, `SUPER_ADMIN_EMAIL`, and `SUPER_ADMIN_PASSWORD`; set the credential JSON and secret values privately in Render. Each credential object must contain an individual, unique 12+ character password for every account key in its matching server-side account map; neither staff nor sector accounts share the main Admin password. `CORS_ALLOWED_ORIGINS` is an optional comma-separated list of additional exact HTTPS origins. Use an `AUTH_SECRET` of at least 32 bytes. Demo login is disabled in production. `ADMIN_EMAIL` is optional and defaults to `admin@college.edu`; `GEMINI_API_KEY` is optional unless Gemini features are required.
- Authentication tokens remain valid across server restarts only when the same `AUTH_SECRET` is retained. Legacy static Admin/Warden/Staff tokens are also bound to their configured password version and are invalidated when the corresponding environment password changes. Demo tokens are rejected when demo mode is disabled.
- The first server startup hashes the configured Super Admin password and persists the account in `admin-accounts.json`. Later restarts do not reset it from environment variables. To rotate it, use the Super Admin password-change form on the Admin Dashboard; the current password is required and existing Super Admin sessions are revoked. College Admin account changes are serialized to prevent concurrent duplicate emails.
- Super Admin can create College Admin accounts using passwords of at least 12 characters, deactivate/reactivate them, and reset their passwords. Deactivation and password reset invalidate that account's existing sessions. College Admins cannot access account-management endpoints or promote accounts.
- For backward compatibility, `ADMIN_EMAIL`/`ADMIN_PASSWORD` still authenticate the legacy `main_admin` account, which can manage complaints but cannot manage Super Admin or College Admin accounts. Sector Admin and Warden/Staff legacy identities remain supported but require distinct account-specific credentials in production; the shared `STAFF_PASSWORD` fallback is local-demo-only. There are no weak built-in password defaults.
- Login and OTP requests are each limited to 10 attempts per IP per 15 minutes, and Super Admin account mutations to 10 per authenticated administrator per 15 minutes. Keyed identities are stored under `DATA_DIR`; successful requests consume a rate-limit attempt too. Keep a stable `AUTH_SECRET` and a single disk-backed service instance for the file-based limits and logout revocations to remain effective.
- Production CORS only allows `APP_URL` and explicitly listed `CORS_ALLOWED_ORIGINS`; localhost origins are development-only. The app uses bearer tokens, not credentialed cookies.
- OTP currently has no real email provider: it is available only in local demo mode, where the OTP is returned to the demo UI. Production OTP requests fail closed with HTTP 503, so production student OTP login requires integrating and configuring a real delivery provider before deployment.
- This repository does not currently include PostgreSQL or read `DATABASE_URL`. Student records are stored in `students.csv`; complaints (including comments and timeline), notifications, and managed administrator accounts are stored in JSON files.
- File replacements use a temporary file and atomic rename to reduce truncation risk, but separate CSV/JSON files are not a transactional database and do not provide cross-file atomicity. A Render persistent disk is live storage, not a backup; arrange independent backups and test restore procedures.

---

## 📜 License

This project is licensed under the MIT License. Developed for University Student Grievance Redressal Committees (SGRC).
