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
- **Data Persistence**: CSV storage engine (`data/students.csv`) + In-memory store
- **Deployment**: Render Web Service

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
   ALLOWED_COLLEGE_EMAIL_DOMAIN=".edu.in"
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

---

## 📜 License

This project is licensed under the MIT License. Developed for University Student Grievance Redressal Committees (SGRC).

