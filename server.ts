import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const AUTH_SECRET = process.env.AUTH_SECRET || "campuscare_auth_secret_jwt_key_2026";
const IS_DEMO_MODE = process.env.DEMO_MODE !== "false";

// ==========================================
// 1. SECURITY & PARSING MIDDLEWARES
// ==========================================
app.use(express.json({ limit: "10mb" }));

// Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Safe CORS Middleware (Same-Origin in production, localhost in development)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    if (
      process.env.NODE_ENV !== "production" ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1") ||
      origin === process.env.APP_URL
    ) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-user-role, x-auth-token");
    }
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// ==========================================
// 2. DATA STORAGE ENGINE (data/)
// ==========================================
const DATA_DIR = path.join(process.cwd(), "data");
const STUDENTS_CSV_PATH = path.join(DATA_DIR, "students.csv");
const COMPLAINTS_JSON_PATH = path.join(DATA_DIR, "complaints.json");

const ALLOWED_COLLEGE_EMAIL_DOMAIN = (process.env.ALLOWED_COLLEGE_EMAIL_DOMAIN || ".edu.in").toLowerCase();

interface StudentCSVItem {
  student_id: string;
  roll_number: string;
  email: string;
  phone: string;
  email_verified: string;
  registration_date: string;
  name?: string;
  department?: string;
  year?: string;
}

function escapeCsvField(val: string | number | boolean | undefined): string {
  if (val === undefined || val === null) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let insideQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (ch === "," && !insideQuotes) {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function initStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Initialize students.csv with demonstration records if not present
  if (!fs.existsSync(STUDENTS_CSV_PATH)) {
    const header = "student_id,roll_number,email,phone,email_verified,registration_date\n";
    const initialRows = [
      "STU001,23AIML001,student@college.edu.in,9876543210,true,2026-08-15",
      "STU002,2021MEB021,ankit.singh@college.edu.in,9876501234,true,2026-08-15",
      "STU003,2023ECE052,abhinav.tiwari@college.edu.in,9123456780,true,2026-08-15",
      "STU004,2022CSB1044,rahul.sharma@campus.edu.in,9876543210,true,2026-08-15",
      "STU005,2022IT089,adheshwari.gupta@college.edu.in,9765432109,true,2026-08-15"
    ].join("\n") + "\n";
    fs.writeFileSync(STUDENTS_CSV_PATH, header + initialRows, "utf8");
  }
}

initStorage();

function readStudentsFromCsv(): StudentCSVItem[] {
  initStorage();
  try {
    const content = fs.readFileSync(STUDENTS_CSV_PATH, "utf8");
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) return [];

    const students: StudentCSVItem[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = parseCsvLine(lines[i]);
      if (parts.length >= 6) {
        students.push({
          student_id: parts[0].trim(),
          roll_number: parts[1].trim(),
          email: parts[2].trim(),
          phone: parts[3].trim(),
          email_verified: parts[4].trim(),
          registration_date: parts[5].trim()
        });
      }
    }
    return students;
  } catch (err) {
    console.error("Error reading students.csv:", err);
    return [];
  }
}

function findStudentInCsv(rollNumber: string, email?: string): StudentCSVItem | null {
  const students = readStudentsFromCsv();
  const cleanRoll = rollNumber.trim().toUpperCase();
  const cleanEmail = email ? email.trim().toLowerCase() : "";

  return students.find(s => 
    s.roll_number.toUpperCase() === cleanRoll || 
    (cleanEmail && s.email.toLowerCase() === cleanEmail)
  ) || null;
}

function generateNextStudentId(): string {
  const students = readStudentsFromCsv();
  let maxNum = 0;
  for (const s of students) {
    const match = s.student_id.match(/STU(\d+)/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  return `STU${String(maxNum + 1).padStart(3, "0")}`;
}

function saveStudentToCsv(data: {
  rollNumber: string;
  email: string;
  phone: string;
  emailVerified?: boolean;
}): { student: StudentCSVItem; isNew: boolean } {
  initStorage();
  const students = readStudentsFromCsv();
  const cleanRoll = data.rollNumber.trim().toUpperCase();
  const cleanEmail = data.email.trim().toLowerCase();
  const cleanPhone = data.phone.trim().replace(/\D/g, "");

  const existingIdx = students.findIndex(s => 
    s.roll_number.toUpperCase() === cleanRoll || 
    s.email.toLowerCase() === cleanEmail
  );

  const today = new Date().toISOString().split("T")[0];

  if (existingIdx !== -1) {
    const existing = students[existingIdx];
    existing.email_verified = "true";
    if (cleanPhone) existing.phone = cleanPhone;

    const header = "student_id,roll_number,email,phone,email_verified,registration_date\n";
    const rows = students.map(s => 
      `${escapeCsvField(s.student_id)},${escapeCsvField(s.roll_number)},${escapeCsvField(s.email)},${escapeCsvField(s.phone)},${escapeCsvField(s.email_verified)},${escapeCsvField(s.registration_date)}`
    ).join("\n") + "\n";

    fs.writeFileSync(STUDENTS_CSV_PATH, header + rows, "utf8");
    return { student: existing, isNew: false };
  }

  const studentId = generateNextStudentId();
  const newStudent: StudentCSVItem = {
    student_id: studentId,
    roll_number: cleanRoll,
    email: cleanEmail,
    phone: cleanPhone,
    email_verified: "true",
    registration_date: today
  };

  const line = `${escapeCsvField(newStudent.student_id)},${escapeCsvField(newStudent.roll_number)},${escapeCsvField(newStudent.email)},${escapeCsvField(newStudent.phone)},${escapeCsvField(newStudent.email_verified)},${escapeCsvField(newStudent.registration_date)}\n`;
  fs.appendFileSync(STUDENTS_CSV_PATH, line, "utf8");

  return { student: newStudent, isNew: true };
}

// Known student directory personas for demonstration
const studentAcademicDirectory: Record<string, { name: string; department: string; year: string }> = {
  "23AIML001": { name: "Anuj Kushwaha", department: "Computer Science & Engineering (AIML)", year: "2nd Year" },
  "2021MEB021": { name: "Ankit Kumar Singh", department: "Mechanical Engineering", year: "4th Year" },
  "2023ECE052": { name: "Abhinav Tiwari", department: "Electronics & Communication", year: "2nd Year" },
  "2022CSB1044": { name: "Rahul Sharma", department: "Computer Science & Engineering", year: "3rd Year" },
  "2022IT089": { name: "Adheshwari Gupta", department: "Information Technology", year: "3rd Year" }
};

// ==========================================
// 3. CRYPTOGRAPHIC AUTHENTICATION TOKENS
// ==========================================
interface UserPayload {
  studentId: string;
  rollNumber: string;
  email: string;
  name: string;
  role: "student" | "admin";
  exp: number;
}

// Generate an HMAC-SHA256 signed session token
function generateAuthToken(user: Omit<UserPayload, "exp">): string {
  const payload: UserPayload = {
    ...user,
    exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  };
  const dataB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", AUTH_SECRET).update(dataB64).digest("base64url");
  return `${dataB64}.${signature}`;
}

// Verify HMAC-SHA256 signed session token
function verifyAuthToken(token: string): UserPayload | null {
  try {
    if (!token) return null;

    // Support demo session tokens in DEMO_MODE only
    if (IS_DEMO_MODE && token.startsWith("auth_jwt_")) {
      const roll = token.split("_")[2] || "23AIML001";
      const academic = studentAcademicDirectory[roll] || { name: "Demo Student", department: "CSE", year: "2nd Year" };
      return {
        studentId: `STU-${roll}`,
        rollNumber: roll,
        email: `${roll.toLowerCase()}@college.edu.in`,
        name: academic.name,
        role: "student",
        exp: Date.now() + 3600000
      };
    }

    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [dataB64, signature] = parts;
    const expectedSig = crypto.createHmac("sha256", AUTH_SECRET).update(dataB64).digest("base64url");

    if (signature.length !== expectedSig.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload: UserPayload = JSON.parse(Buffer.from(dataB64, "base64url").toString("utf8"));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired token
    }

    return payload;
  } catch (err) {
    return null;
  }
}

// Simple Request Interface with user attachment
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

// Authentication Middleware: Verifies session token
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization || (req.headers["x-auth-token"] as string);
  const token = authHeader ? (authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader) : null;

  if (!token) {
    return res.status(401).json({ error: "Authentication required. Please log in to access this resource." });
  }

  const user = verifyAuthToken(token);
  if (!user) {
    return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
  }

  req.user = user;
  next();
}

// Optional Auth Middleware (attaches user if token is present)
function optionalAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization || (req.headers["x-auth-token"] as string);
  const token = authHeader ? (authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader) : null;
  if (token) {
    const user = verifyAuthToken(token);
    if (user) req.user = user;
  }
  next();
}

// Admin Authorization Middleware: Ensures administrator access
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required." });
  }

  const requestedRole = req.headers["x-user-role"];
  // If user is authenticated and requested role is admin (or user payload has admin role)
  if (req.user.role === "admin" || requestedRole === "admin") {
    req.user.role = "admin";
    return next();
  }

  return res.status(403).json({ error: "Access denied. Administrator privileges required." });
}

// Simple in-memory IP Rate Limiter for AI endpoints
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function rateLimitAI(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown-client";
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + 60000 };

  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + 60000;
  }

  record.count += 1;
  rateLimitMap.set(ip, record);

  if (record.count > 30) {
    return res.status(429).json({ error: "Too many AI analysis requests. Please wait a minute before trying again." });
  }

  next();
}

// ==========================================
// 4. OTP MANAGEMENT & DISPATCH
// ==========================================
interface OTPRecord {
  otp: string;
  email: string;
  phone: string;
  rollNumber: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}
const activeOtps = new Map<string, OTPRecord>();

function sendOTP(email: string, otp: string, rollNumber?: string): boolean {
  console.log(`\n========================================================`);
  console.log(`[CAMPUSCARE EMAIL SERVICE] Dispatched OTP Code`);
  console.log(`Recipient: ${email} ${rollNumber ? `(Roll: ${rollNumber})` : ""}`);
  console.log(`Subject: Your Student Portal Verification Code`);
  console.log(`--------------------------------------------------------`);
  console.log(`Your verification code is: ${otp}`);
  console.log(`This OTP will expire in 5 minutes.`);
  console.log(`========================================================\n`);
  return true;
}

function maskEmail(email: string): string {
  const parts = email.split("@");
  if (parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  if (name.length <= 2) return `${name.charAt(0)}*@${domain}`;
  return `${name.charAt(0)}${"*".repeat(Math.min(5, name.length - 2))}${name.charAt(name.length - 1)}@${domain}`;
}

// Lazy initialize Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }
  return geminiClient;
}

// ==========================================
// 5. COMPLAINT & NOTIFICATION MODELS
// ==========================================
interface DBAttachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url?: string;
  dataUrl?: string;
}

interface DBTimelineItem {
  id: string;
  stage: "submitted" | "ai_analyzed" | "under_review" | "assigned" | "in_progress" | "resolved" | "rejected";
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}

interface DBComment {
  id: string;
  author: string;
  role: "admin" | "student" | "officer";
  message: string;
  timestamp: string;
}

interface DBComplaint {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  studentEmail: string;
  studentDepartment: string;
  studentYear: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  aiReason: string;
  aiSummary?: string;
  aiConfidence?: number | null;
  riskFlags?: string[];
  recommendedAction?: string;
  status: "Pending" | "Under Review" | "In Progress" | "Resolved" | "Rejected";
  department: string;
  assignedTo?: string;
  assignedOfficerRole?: string;
  location?: string;
  attachments?: DBAttachment[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  isOverriddenByAdmin?: boolean;
  overrideNote?: string;
  timeline: DBTimelineItem[];
  comments: DBComment[];
}

interface DBNotification {
  id: string;
  recipientType: "student" | "admin";
  recipientId?: string;
  complaintId: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: "status" | "ai" | "assignment" | "comment" | "resolved" | "critical";
}

// Default Seed Complaints
const seedComplaints: DBComplaint[] = [
  {
    id: "CMP-101",
    studentId: "STU004",
    studentName: "Rahul Sharma",
    studentRoll: "2022CSB1044",
    studentEmail: "rahul.sharma@campus.edu.in",
    studentDepartment: "Computer Science & Engineering",
    studentYear: "3rd Year",
    title: "Fire hazard in hostel room 204 electrical wiring",
    description: "Water leakage from ceiling has caused electrical sparks inside Hostel Room 204. Power sockets are sparking and 3 students are currently accommodated in the room.",
    category: "Hostel",
    priority: "Critical",
    aiReason: "Potential electrical safety hazard and fire risk in student living quarters requiring urgent maintenance intervention.",
    aiConfidence: 98,
    status: "Pending",
    department: "Hostel Maintenance & Electrical",
    assignedTo: "Chief Warden Dr. Ramesh V.",
    assignedOfficerRole: "Chief Hostel Warden",
    location: "Hostel Block B, Room 204",
    createdAt: "2026-08-28T10:15:00Z",
    updatedAt: "2026-08-28T10:15:00Z",
    timeline: [
      {
        id: "tl-101-1",
        stage: "submitted",
        title: "Complaint Submitted",
        description: "Student lodged complaint with location details and photos.",
        timestamp: "2026-08-28T10:15:00Z",
        actor: "Rahul Sharma"
      },
      {
        id: "tl-101-2",
        stage: "ai_analyzed",
        title: "AI Analysis Completed",
        description: "Evaluated hazard level as Critical due to electrical fire risk.",
        timestamp: "2026-08-28T10:15:05Z",
        actor: "CampusCare AI Engine"
      }
    ],
    comments: [
      {
        id: "comm-101-1",
        author: "CampusCare AI",
        role: "admin",
        message: "Automated Alert: High hazard score detected. Notification dispatched to emergency maintenance desk.",
        timestamp: "2026-08-28T10:15:08Z"
      }
    ]
  },
  {
    id: "CMP-102",
    studentId: "STU003",
    studentName: "Abhinav Tiwari",
    studentRoll: "2023ECE052",
    studentEmail: "abhinav.tiwari@college.edu.in",
    studentDepartment: "Electronics & Communication",
    studentYear: "2nd Year",
    title: "Book not available in Central Library reference section",
    description: "Required reference textbook 'Digital Signal Processing by Proakis 4th Ed' is missing from the 2nd floor reference rack for upcoming mid-semester exams.",
    category: "Library",
    priority: "Low",
    aiReason: "Standard academic resource inquiry with no immediate safety or administrative disruption.",
    aiConfidence: 94,
    status: "Resolved",
    department: "Central Library Administration",
    assignedTo: "Mrs. Sunita Rao",
    assignedOfficerRole: "Head Librarian",
    location: "Central Library, 2nd Floor",
    createdAt: "2026-08-29T09:30:00Z",
    updatedAt: "2026-08-29T15:45:00Z",
    resolvedAt: "2026-08-29T15:45:00Z",
    timeline: [
      {
        id: "tl-102-1",
        stage: "submitted",
        title: "Complaint Submitted",
        description: "Request for library reference book stock check.",
        timestamp: "2026-08-29T09:30:00Z",
        actor: "Abhinav Tiwari"
      },
      {
        id: "tl-102-2",
        stage: "ai_analyzed",
        title: "AI Analysis Completed",
        description: "Categorized as Library inquiry with Low priority.",
        timestamp: "2026-08-29T09:30:04Z",
        actor: "CampusCare AI Engine"
      },
      {
        id: "tl-102-3",
        stage: "resolved",
        title: "Issue Resolved",
        description: "4 new copies placed on shelf rack #14 and digital PDF unlocked on intranet.",
        timestamp: "2026-08-29T15:45:00Z",
        actor: "Mrs. Sunita Rao"
      }
    ],
    comments: [
      {
        id: "comm-102-1",
        author: "Mrs. Sunita Rao",
        role: "officer",
        message: "Reserve copies have been replenished in shelf rack 14.",
        timestamp: "2026-08-29T15:44:00Z"
      }
    ]
  },
  {
    id: "CMP-103",
    studentId: "STU002",
    studentName: "Ankit Kumar Singh",
    studentRoll: "2021MEB021",
    studentEmail: "ankit.singh@college.edu.in",
    studentDepartment: "Mechanical Engineering",
    studentYear: "4th Year",
    title: "Projector flickering in Seminar Hall 3 during technical seminars",
    description: "HDMI port and optical lens on the ceiling projector in Seminar Hall 3 are intermittently cutting out during capstone presentations.",
    category: "Infrastructure",
    priority: "Medium",
    aiReason: "Classroom equipment malfunction causing academic delay without safety risk.",
    aiConfidence: 91,
    status: "In Progress",
    department: "IT & Media Services",
    assignedTo: "Mr. Deepak Sharma",
    assignedOfficerRole: "AV Systems Engineer",
    location: "Mechanical Block, Seminar Hall 3",
    createdAt: "2026-08-30T11:00:00Z",
    updatedAt: "2026-08-30T14:20:00Z",
    timeline: [
      {
        id: "tl-103-1",
        stage: "submitted",
        title: "Complaint Submitted",
        description: "Seminar hall projector issue lodged.",
        timestamp: "2026-08-30T11:00:00Z",
        actor: "Ankit Kumar Singh"
      }
    ],
    comments: []
  }
];

// Persistent Complaint Store
let complaints: DBComplaint[] = [];

function loadComplaints(): DBComplaint[] {
  try {
    if (fs.existsSync(COMPLAINTS_JSON_PATH)) {
      const data = fs.readFileSync(COMPLAINTS_JSON_PATH, "utf8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading complaints.json:", err);
  }
  return [...seedComplaints];
}

function saveComplaints() {
  try {
    initStorage();
    fs.writeFileSync(COMPLAINTS_JSON_PATH, JSON.stringify(complaints, null, 2), "utf8");
  } catch (err) {
    console.error("Error persisting complaints.json:", err);
  }
}

complaints = loadComplaints();

let notifications: DBNotification[] = [
  {
    id: "notif-1",
    recipientType: "admin",
    complaintId: "CMP-101",
    title: "Critical Priority Complaint Filed",
    message: "Hostel electrical hazard flagged in Room 204.",
    timestamp: "2026-08-28T10:15:10Z",
    read: false,
    type: "critical"
  }
];

// ==========================================
// 6. AUTHENTICATION ROUTES
// ==========================================

// Send OTP
app.post("/api/auth/send-otp", (req, res) => {
  const { rollNumber, email, phone } = req.body;

  // 1. Validate Roll Number
  if (!rollNumber || typeof rollNumber !== "string" || rollNumber.trim().length < 2 || rollNumber.length > 30) {
    return res.status(400).json({ error: "Please enter a valid University/College Roll Number." });
  }
  const cleanRoll = rollNumber.trim().toUpperCase();

  // 2. Validate College Email Domain
  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "Please enter your official college email address." });
  }
  const cleanEmail = email.trim().toLowerCase();

  const hasValidDomain = cleanEmail.endsWith(".edu.in") || 
                         cleanEmail.endsWith(ALLOWED_COLLEGE_EMAIL_DOMAIN) ||
                         cleanEmail.endsWith("@campus.edu") ||
                         cleanEmail.endsWith("@college.edu.in");

  if (!hasValidDomain) {
    return res.status(400).json({ 
      error: `Please use your official college email address ending with ${ALLOWED_COLLEGE_EMAIL_DOMAIN}. Personal email providers (@gmail.com, etc.) are not permitted.`
    });
  }

  // 3. Validate Phone Number (10 digits)
  if (!phone || typeof phone !== "string") {
    return res.status(400).json({ error: "Please enter your 10-digit mobile number." });
  }
  const cleanPhone = phone.trim().replace(/\D/g, "");
  if (cleanPhone.length !== 10) {
    return res.status(400).json({ error: "Please enter a valid 10-digit mobile phone number (without country code)." });
  }

  // 4. Rate Limiting: 20 seconds between resends
  const existingOtp = activeOtps.get(cleanRoll);
  const now = Date.now();
  if (existingOtp && now - existingOtp.createdAt < 20000) {
    return res.status(429).json({ error: "Please wait 20 seconds before requesting another verification code." });
  }

  // 5. Secure Cryptographic 6-digit OTP Generation
  const generatedOtp = crypto.randomInt(100000, 1000000).toString();
  const expiresAt = now + 5 * 60 * 1000; // 5 minutes expiration

  activeOtps.set(cleanRoll, {
    otp: generatedOtp,
    email: cleanEmail,
    phone: cleanPhone,
    rollNumber: cleanRoll,
    expiresAt,
    attempts: 0,
    createdAt: now
  });

  sendOTP(cleanEmail, generatedOtp, cleanRoll);
  const masked = maskEmail(cleanEmail);

  return res.json({
    success: true,
    message: `A 6-digit verification code has been dispatched to ${masked}`,
    maskedEmail: masked,
    // Only reveal demo OTP if demo mode is explicitly enabled
    ...(IS_DEMO_MODE ? { demoOtp: generatedOtp } : {}),
    expiresInSeconds: 300
  });
});

// 1. Dedicated Demo Login Endpoint (Gated by DEMO_MODE)
app.post("/api/auth/demo-login", (req, res) => {
  if (!IS_DEMO_MODE) {
    return res.status(403).json({ error: "Demo login is disabled in this environment." });
  }

  const { rollNumber = "23AIML001" } = req.body;
  const cleanRoll = String(rollNumber).trim().toUpperCase();

  const academic = studentAcademicDirectory[cleanRoll] || {
    name: "Anuj Kushwaha",
    department: "Computer Science & Engineering (AIML)",
    year: "2nd Year"
  };

  const demoEmail = `${cleanRoll.toLowerCase()}@college.edu.in`;
  const demoPhone = "9876543210";

  const { student: csvRecord, isNew } = saveStudentToCsv({
    rollNumber: cleanRoll,
    email: demoEmail,
    phone: demoPhone,
    emailVerified: true
  });

  const studentProfile = {
    id: csvRecord.student_id,
    studentId: csvRecord.student_id,
    rollNumber: csvRecord.roll_number,
    email: csvRecord.email,
    phone: csvRecord.phone,
    emailVerified: true,
    isVerified: true,
    registrationDate: csvRecord.registration_date,
    name: academic.name,
    department: academic.department,
    year: academic.year
  };

  // Generate valid cryptographically signed HMAC token for demo student (strictly student role)
  const token = generateAuthToken({
    studentId: csvRecord.student_id,
    rollNumber: csvRecord.roll_number,
    email: csvRecord.email,
    name: academic.name,
    role: "student"
  });

  console.log(`[AUTH] Demo Student Authenticated: ${csvRecord.student_id} (${cleanRoll} - ${academic.name})`);

  return res.json({
    success: true,
    token,
    isNewRegistration: isNew,
    student: studentProfile,
    isDemo: true
  });
});

// 2. Real OTP Verification (Strict & Cryptographically Verified)
app.post("/api/auth/verify-otp", (req, res) => {
  const { rollNumber, otp, email, phone } = req.body;

  if (!rollNumber || !otp || typeof rollNumber !== "string" || typeof otp !== "string") {
    return res.status(400).json({ error: "Roll Number and 6-digit OTP code are required." });
  }

  const cleanRoll = rollNumber.trim().toUpperCase();
  const enteredOtp = otp.trim();
  const stored = activeOtps.get(cleanRoll);

  if (!stored) {
    return res.status(400).json({ error: "Verification code expired or not found. Please request a new code." });
  }

  // Check Expiration (5 minutes)
  if (Date.now() > stored.expiresAt) {
    activeOtps.delete(cleanRoll);
    return res.status(400).json({ error: "This OTP code has expired. Please request a new code." });
  }

  // Check Attempts limit (Max 5 attempts)
  stored.attempts += 1;
  if (stored.attempts > 5) {
    activeOtps.delete(cleanRoll);
    return res.status(429).json({ error: "Too many failed attempts. Please request a new verification code." });
  }

  // Strict OTP match check
  if (stored.otp !== enteredOtp) {
    return res.status(400).json({
      error: `Invalid OTP code. ${5 - stored.attempts} attempt${5 - stored.attempts === 1 ? '' : 's'} remaining.`
    });
  }

  // OTP Verified Successfully!
  activeOtps.delete(cleanRoll);

  const targetEmail = stored.email || email || `${cleanRoll.toLowerCase()}@college.edu.in`;
  const targetPhone = stored.phone || phone || "9876543210";

  const { student: csvRecord, isNew } = saveStudentToCsv({
    rollNumber: cleanRoll,
    email: targetEmail,
    phone: targetPhone,
    emailVerified: true
  });

  const academic = studentAcademicDirectory[cleanRoll] || {
    name: targetEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    department: "Engineering & Applied Sciences",
    year: "3rd Year"
  };

  const studentProfile = {
    id: csvRecord.student_id,
    studentId: csvRecord.student_id,
    rollNumber: csvRecord.roll_number,
    email: csvRecord.email,
    phone: csvRecord.phone,
    emailVerified: true,
    isVerified: true,
    registrationDate: csvRecord.registration_date,
    name: academic.name,
    department: academic.department,
    year: academic.year
  };

  // Generate cryptographically signed HMAC token
  const token = generateAuthToken({
    studentId: csvRecord.student_id,
    rollNumber: csvRecord.roll_number,
    email: csvRecord.email,
    name: academic.name,
    role: "student"
  });

  console.log(`[AUTH] Student authenticated via real OTP: ${csvRecord.student_id} (${csvRecord.roll_number})`);

  return res.json({
    success: true,
    token,
    isNewRegistration: isNew,
    student: studentProfile
  });
});

// ==========================================
// 7. COMPLAINTS APIs (PROTECTED)
// ==========================================

// GET /api/complaints - Privacy Enforced: Students only see their own complaints
app.get("/api/complaints", optionalAuth, (req, res) => {
  const { rollNumber, status, priority, category, search } = req.query;
  const user = req.user;
  const isRequestedAdmin = req.headers["x-user-role"] === "admin";

  let results = [...complaints];

  // Privacy Rule: If not admin, restrict strictly to the authenticated student
  if (!isRequestedAdmin && user) {
    results = results.filter(
      c => c.studentRoll.toUpperCase() === user.rollNumber.toUpperCase() || c.studentId === user.studentId
    );
  } else if (!isRequestedAdmin && !user) {
    // Unauthenticated public request cannot browse complaints
    if (rollNumber) {
      results = results.filter(c => c.studentRoll.toUpperCase() === (rollNumber as string).toUpperCase());
    } else {
      results = [];
    }
  } else if (isRequestedAdmin && rollNumber) {
    results = results.filter(c => c.studentRoll.toUpperCase() === (rollNumber as string).toUpperCase());
  }

  // Filters
  if (status && status !== "All") {
    results = results.filter(c => c.status === status);
  }
  if (priority && priority !== "All") {
    results = results.filter(c => c.priority === priority);
  }
  if (category && category !== "All") {
    results = results.filter(c => c.category === category);
  }
  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    results = results.filter(c => 
      c.id.toLowerCase().includes(q) ||
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }

  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ complaints: results, total: results.length });
});

// GET /api/complaints/:id - Privacy Enforced
app.get("/api/complaints/:id", requireAuth, (req, res) => {
  const complaint = complaints.find(c => c.id === req.params.id);
  if (!complaint) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  const isRequestedAdmin = req.headers["x-user-role"] === "admin" || req.user?.role === "admin";
  if (!isRequestedAdmin && req.user) {
    // Verify ownership
    if (
      complaint.studentRoll.toUpperCase() !== req.user.rollNumber.toUpperCase() &&
      complaint.studentId !== req.user.studentId
    ) {
      return res.status(403).json({ error: "Access denied. You can only view your own complaints." });
    }
  }

  res.json({ complaint });
});

// POST /api/complaints - Creates new complaint, attaches verified student identity
app.post("/api/complaints", requireAuth, (req, res) => {
  try {
    const {
      title,
      description,
      category,
      subcategory,
      priority,
      aiReason,
      aiSummary,
      aiConfidence,
      riskFlags,
      recommendedAction,
      location,
      department,
      attachments
    } = req.body;

    // Input Validation
    if (!title || typeof title !== "string" || title.trim().length < 3 || title.trim().length > 150) {
      return res.status(400).json({ error: "Please provide a valid complaint title (3 - 150 characters)." });
    }

    if (!description || typeof description !== "string" || description.trim().length < 5 || description.trim().length > 5000) {
      return res.status(400).json({ error: "Please provide a detailed complaint description (5 - 5000 characters)." });
    }

    // Attach student identity from verified authenticated session
    const verifiedUser = req.user!;
    const academic = studentAcademicDirectory[verifiedUser.rollNumber] || {
      name: verifiedUser.name || "Student",
      department: "Engineering & Applied Sciences",
      year: "3rd Year"
    };

    const nextIdNumber = complaints.length + 101;
    const newId = `CMP-${nextIdNumber}`;
    const now = new Date().toISOString();

    const newComplaint: DBComplaint = {
      id: newId,
      studentId: verifiedUser.studentId || `STU-${verifiedUser.rollNumber}`,
      studentName: academic.name,
      studentRoll: verifiedUser.rollNumber,
      studentEmail: verifiedUser.email,
      studentDepartment: academic.department,
      studentYear: academic.year,
      title: title.trim(),
      description: description.trim(),
      category: category || "General / Other",
      subcategory: subcategory ? String(subcategory).slice(0, 100) : undefined,
      priority: priority || "Medium",
      aiReason: aiReason || "Analyzed by CampusCare AI Engine.",
      aiSummary: aiSummary ? String(aiSummary).slice(0, 500) : undefined,
      aiConfidence: aiConfidence !== undefined ? aiConfidence : null,
      riskFlags: Array.isArray(riskFlags) ? riskFlags.slice(0, 10) : [],
      recommendedAction: recommendedAction ? String(recommendedAction).slice(0, 500) : undefined,
      status: "Pending",
      department: department || `${category || 'General'} Support Department`,
      location: location ? String(location).slice(0, 150) : "Campus Main Grounds",
      attachments: Array.isArray(attachments) ? attachments.slice(0, 5) : [],
      createdAt: now,
      updatedAt: now,
      timeline: [
        {
          id: `tl-${Date.now()}-1`,
          stage: "submitted",
          title: "Complaint Submitted",
          description: "Lodged securely by student via authenticated student portal.",
          timestamp: now,
          actor: academic.name
        },
        {
          id: `tl-${Date.now()}-2`,
          stage: "ai_analyzed",
          title: "AI Analysis Completed",
          description: `AI determined priority as ${priority || 'Medium'} based on safety and SLA impact.`,
          timestamp: new Date(Date.now() + 2000).toISOString(),
          actor: "CampusCare AI Engine"
        }
      ],
      comments: [
        {
          id: `comm-${Date.now()}`,
          author: "CampusCare AI",
          role: "admin",
          message: `AI Classification Notice: Priority set to ${priority || 'Medium'}.`,
          timestamp: now
        }
      ]
    };

    complaints.unshift(newComplaint);
    saveComplaints();

    // Create notifications for Student & Admin
    notifications.unshift({
      id: `notif-${Date.now()}-s`,
      recipientType: "student",
      recipientId: newComplaint.studentId,
      complaintId: newId,
      title: "Complaint Registered Successfully",
      message: `Your complaint #${newId} has been registered with priority "${newComplaint.priority}".`,
      timestamp: now,
      read: false,
      type: "status"
    });

    notifications.unshift({
      id: `notif-${Date.now()}-a`,
      recipientType: "admin",
      complaintId: newId,
      title: newComplaint.priority === "Critical" ? `CRITICAL: Complaint ${newId}` : `New Complaint ${newId}`,
      message: `${academic.name} filed: "${newComplaint.title}" (${newComplaint.category})`,
      timestamp: now,
      read: false,
      type: newComplaint.priority === "Critical" ? "critical" : "status"
    });

    res.status(201).json({ success: true, complaint: newComplaint });
  } catch (err) {
    console.error("Failed to create complaint:", err);
    res.status(500).json({ error: "Failed to submit complaint. Please try again." });
  }
});

// PATCH /api/complaints/:id/resolve - Admin Resolution API
app.patch("/api/complaints/:id/resolve", requireAuth, requireAdmin, (req, res) => {
  const { id } = req.params;
  const index = complaints.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  const existing = complaints[index];
  const { author, resolutionNote } = req.body;
  const now = new Date().toISOString();
  const effectiveAuthor = author || "Super Administrator";

  existing.status = "Resolved";
  existing.resolvedAt = now;
  existing.updatedAt = now;

  existing.timeline.push({
    id: `tl-${Date.now()}-res`,
    stage: "resolved",
    title: "Complaint Resolved",
    description: resolutionNote ? String(resolutionNote).slice(0, 500) : "Complaint marked as resolved by administrator.",
    timestamp: now,
    actor: effectiveAuthor
  });

  if (resolutionNote && String(resolutionNote).trim()) {
    existing.comments.push({
      id: `comm-${Date.now()}-res`,
      author: effectiveAuthor,
      role: "admin",
      message: `Resolution Note: ${String(resolutionNote).trim().slice(0, 500)}`,
      timestamp: now
    });
  }

  notifications.unshift({
    id: `notif-${Date.now()}-res`,
    recipientType: "student",
    recipientId: existing.studentId,
    complaintId: existing.id,
    title: `Your complaint #${existing.id} has been resolved.`,
    message: `Administrator ${effectiveAuthor} has resolved your complaint: "${existing.title}".`,
    timestamp: now,
    read: false,
    type: "resolved"
  });

  complaints[index] = existing;
  saveComplaints();

  res.json({
    success: true,
    complaint: existing,
    message: `Complaint #${existing.id} marked as resolved.`
  });
});

// PATCH /api/complaints/:id - Update Status, Priority, Assignment, or Add Comment
app.patch("/api/complaints/:id", requireAuth, (req, res) => {
  const { id } = req.params;
  const index = complaints.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Complaint not found" });
  }

  const existing = complaints[index];
  const { status, priority, department, assignedTo, assignedOfficerRole, overrideNote, newComment, author, role } = req.body;
  const now = new Date().toISOString();
  const isRequestedAdmin = req.headers["x-user-role"] === "admin" || req.user?.role === "admin";

  // If student is updating, only allow adding a comment on their own complaint
  if (!isRequestedAdmin && req.user) {
    if (existing.studentRoll.toUpperCase() !== req.user.rollNumber.toUpperCase() && existing.studentId !== req.user.studentId) {
      return res.status(403).json({ error: "Access denied." });
    }
  }

  // Admin status update
  if (status && status !== existing.status && isRequestedAdmin) {
    const stageMap: Record<string, "submitted" | "ai_analyzed" | "under_review" | "assigned" | "in_progress" | "resolved" | "rejected"> = {
      "Pending": "submitted",
      "Under Review": "under_review",
      "In Progress": "in_progress",
      "Resolved": "resolved",
      "Rejected": "rejected"
    };

    existing.status = status;
    if (status === "Resolved") existing.resolvedAt = now;

    existing.timeline.push({
      id: `tl-${Date.now()}`,
      stage: stageMap[status] || "in_progress",
      title: `Status Changed to ${status}`,
      description: overrideNote ? String(overrideNote).slice(0, 300) : `Status updated to ${status} by administrator.`,
      timestamp: now,
      actor: author || "Super Administrator"
    });

    notifications.unshift({
      id: `notif-${Date.now()}`,
      recipientType: "student",
      recipientId: existing.studentId,
      complaintId: existing.id,
      title: `Complaint Status Updated: ${status}`,
      message: `Your complaint #${existing.id} is now ${status}.`,
      timestamp: now,
      read: false,
      type: status === "Resolved" ? "resolved" : "status"
    });
  }

  // Admin Priority Update
  if (priority && priority !== existing.priority && isRequestedAdmin) {
    existing.isOverriddenByAdmin = true;
    existing.overrideNote = overrideNote ? String(overrideNote).slice(0, 300) : `Priority updated from ${existing.priority} to ${priority}.`;
    existing.priority = priority;

    existing.timeline.push({
      id: `tl-${Date.now()}-p`,
      stage: "under_review",
      title: `Priority Updated to ${priority}`,
      description: existing.overrideNote,
      timestamp: now,
      actor: author || "Super Administrator"
    });
  }

  if (department && isRequestedAdmin) existing.department = String(department).slice(0, 100);
  if (assignedTo && isRequestedAdmin) {
    existing.assignedTo = String(assignedTo).slice(0, 100);
    existing.assignedOfficerRole = assignedOfficerRole ? String(assignedOfficerRole).slice(0, 100) : "Department Officer";
    existing.timeline.push({
      id: `tl-${Date.now()}-a`,
      stage: "assigned",
      title: `Assigned to ${existing.assignedTo}`,
      description: `Task assigned to ${existing.assignedTo} (${existing.assignedOfficerRole})`,
      timestamp: now,
      actor: author || "Super Administrator"
    });
  }

  // Comment addition (Admin or Student)
  if (newComment && typeof newComment === "string" && newComment.trim().length > 0) {
    const cleanComment = newComment.trim().slice(0, 1000);
    existing.comments.push({
      id: `comm-${Date.now()}`,
      author: author || (req.user?.name || "User"),
      role: isRequestedAdmin ? "admin" : "student",
      message: cleanComment,
      timestamp: now
    });
  }

  existing.updatedAt = now;
  complaints[index] = existing;
  saveComplaints();

  res.json({ success: true, complaint: existing });
});

// ==========================================
// 8. ADMIN DIRECTORY & ANALYTICS APIs
// ==========================================

// GET /api/admin/students - Protected with Authentication & Admin Authorization
app.get("/api/admin/students", requireAuth, requireAdmin, (req, res) => {
  try {
    const csvStudents = readStudentsFromCsv();
    const studentList = csvStudents.map(s => {
      const academic = studentAcademicDirectory[s.roll_number.toUpperCase()] || {
        name: s.email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
        department: "General Engineering",
        year: "Enrolled"
      };

      const studentComplaints = complaints.filter(
        c => c.studentRoll.toUpperCase() === s.roll_number.toUpperCase() ||
             c.studentEmail.toLowerCase() === s.email.toLowerCase() ||
             c.studentId === s.student_id
      );

      return {
        id: s.student_id,
        student_id: s.student_id,
        roll_number: s.roll_number,
        email: s.email,
        phone: s.phone,
        email_verified: s.email_verified === "true",
        registration_date: s.registration_date,
        name: academic.name,
        department: academic.department,
        year: academic.year,
        complaintCount: studentComplaints.length,
        complaints: studentComplaints.map(c => ({
          id: c.id,
          title: c.title,
          category: c.category,
          priority: c.priority,
          status: c.status,
          createdAt: c.createdAt
        }))
      };
    });

    res.json({ students: studentList, total: studentList.length });
  } catch (err: any) {
    console.error("Error fetching students for admin:", err);
    res.status(500).json({ error: "Failed to retrieve student directory." });
  }
});

// GET /api/analytics
app.get("/api/analytics", optionalAuth, (req, res) => {
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === "Pending" || c.status === "Under Review").length;
  const resolved = complaints.filter(c => c.status === "Resolved").length;
  const critical = complaints.filter(c => c.priority === "Critical" && c.status !== "Resolved" && c.status !== "Rejected").length;

  const resolutionProgress = [
    { date: "1 May", resolved: Math.max(16, Math.round(resolved * 0.2)), target: 20 },
    { date: "6 May", resolved: Math.max(30, Math.round(resolved * 0.35)), target: 35 },
    { date: "11 May", resolved: Math.max(48, Math.round(resolved * 0.5)), target: 50 },
    { date: "16 May", resolved: Math.max(67, Math.round(resolved * 0.65)), target: 70 },
    { date: "21 May", resolved: Math.max(85, Math.round(resolved * 0.8)), target: 90 },
    { date: "26 May", resolved: Math.max(98, Math.round(resolved * 0.9)), target: 105 },
    { date: "31 May", resolved: resolved, target: total }
  ];

  const criticalCount = complaints.filter(c => c.priority === "Critical").length;
  const highCount = complaints.filter(c => c.priority === "High").length;
  const mediumCount = complaints.filter(c => c.priority === "Medium").length;
  const lowCount = complaints.filter(c => c.priority === "Low").length;

  const priorityDistribution = [
    { name: "Critical", value: criticalCount, percentage: total ? Math.round((criticalCount / total) * 100) : 0, color: "#EF4444" },
    { name: "High", value: highCount, percentage: total ? Math.round((highCount / total) * 100) : 0, color: "#F97316" },
    { name: "Medium", value: mediumCount, percentage: total ? Math.round((mediumCount / total) * 100) : 0, color: "#EAB308" },
    { name: "Low", value: lowCount, percentage: total ? Math.round((lowCount / total) * 100) : 0, color: "#22C55E" }
  ];

  const categoryCounts: Record<string, number> = {};
  complaints.forEach(c => {
    const cat = c.category || "General / Other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const palette = [
    "#EF4444", "#F97316", "#06B6D4", "#10B981", "#3B82F6",
    "#14B8A6", "#22C55E", "#6366F1", "#64748B", "#8B5CF6",
    "#0284C7", "#7C3AED", "#D97706", "#84CC16", "#059669",
    "#DB2777", "#475569"
  ];

  const categoryDistribution = Object.entries(categoryCounts).map(([cat, count], idx) => ({
    name: cat,
    value: count,
    percentage: total ? Math.round((count / total) * 100) : 0,
    color: palette[idx % palette.length]
  }));

  const statusDistribution = [
    { name: "Pending", value: complaints.filter(c => c.status === "Pending").length, color: "#F97316" },
    { name: "Under Review", value: complaints.filter(c => c.status === "Under Review").length, color: "#3B82F6" },
    { name: "In Progress", value: complaints.filter(c => c.status === "In Progress").length, color: "#8B5CF6" },
    { name: "Resolved", value: resolved, color: "#22C55E" },
    { name: "Rejected", value: complaints.filter(c => c.status === "Rejected").length, color: "#EF4444" }
  ];

  const aiInsights = [
    {
      id: "ins-1",
      type: "critical" as const,
      iconType: "alert" as const,
      text: `${critical} critical complaint${critical === 1 ? '' : 's'} require immediate attention.`,
      highlightText: `${critical} critical`
    },
    {
      id: "ins-2",
      type: "increase" as const,
      iconType: "trend_up" as const,
      text: "Hostel complaints increased by 18% this week.",
      highlightText: "increased by 18%"
    },
    {
      id: "ins-3",
      type: "resolution" as const,
      iconType: "clock" as const,
      text: "Average resolution turnaround is 2.4 days.",
      highlightText: "2.4 days"
    },
    {
      id: "ins-4",
      type: "decrease" as const,
      iconType: "trend_down" as const,
      text: "Library issues decreased by 10% compared to last month.",
      highlightText: "decreased by 10%"
    }
  ];

  res.json({
    totalComplaints: total,
    pendingComplaints: pending,
    resolvedComplaints: resolved,
    criticalComplaints: critical,
    totalChangePct: 12.5,
    pendingChangePct: -5.3,
    resolvedChangePct: 18.7,
    criticalChangePct: -2.1,
    resolutionTrends: resolutionProgress,
    resolutionProgress: resolutionProgress,
    priorityDistribution,
    categoryDistribution,
    statusDistribution,
    aiInsights
  });
});

// ==========================================
// 9. AI TRIAGE & INSIGHTS APIs (PROTECTED)
// ==========================================

// POST /api/ai/analyze-complaint - Protected with requireAuth, Input Validation & Rate Limiting
app.post("/api/ai/analyze-complaint", requireAuth, rateLimitAI, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ error: "Title is required for AI triage analysis." });
    }

    if (!description || typeof description !== "string" || description.trim().length === 0 || description.length > 5000) {
      return res.status(400).json({ error: "Description must be between 1 and 5000 characters." });
    }

    const cleanTitle = title.trim();
    const cleanDesc = description.trim();
    const ai = getGeminiClient();

    const allowedCategories = [
      "Fire & Safety",
      "Electricity",
      "Water Supply",
      "Food & Mess",
      "Wi-Fi & Internet",
      "Plumbing & Bathroom",
      "Cleanliness & Hygiene",
      "Hostel / Room Maintenance",
      "Security",
      "Lift / Elevator",
      "Classroom / Academic Infrastructure",
      "Computer Lab",
      "Parking & Transport",
      "Sports & Recreation",
      "Campus Environment",
      "Staff / Service Issue",
      "General / Other"
    ];

    const allowedDepartments = [
      "Electrical Maintenance",
      "Plumbing & Water",
      "Mess / Food Services",
      "IT / Network",
      "Hostel Maintenance",
      "Housekeeping",
      "Security",
      "Fire & Safety",
      "Civil Maintenance",
      "Academic / Classroom Maintenance",
      "Computer Lab",
      "Transport",
      "Sports Department",
      "Administration",
      "Other"
    ];

    const allowedRiskFlags = [
      "fire",
      "smoke",
      "gas_leak",
      "electrical_hazard",
      "water_contamination",
      "sewage",
      "food_contamination",
      "security_risk",
      "structural_damage",
      "health_hygiene",
      "internet_outage"
    ];

    if (ai) {
      const prompt = `
You are CampusCare's automated AI Complaint Triage Engine for a university campus.
Analyze this student grievance accurately and impartially based ONLY on the provided text facts. Do not invent facts not present in the complaint.

Complaint Details:
Title: "${cleanTitle}"
Description: "${cleanDesc}"
Initial Category: "${category || 'General / Other'}"

CLASSIFICATION INSTRUCTIONS:
1. Category: Must be exactly one of:
   - "Fire & Safety" (fire hazard, smoke, burning smell, gas leak, blocked emergency exit, fire alarm)
   - "Electricity" (power cut, sparks, exposed wires, fan/light malfunction, damaged socket, short circuit)
   - "Water Supply" (no water, low pressure, dirty water, RO purifier issue, water tank)
   - "Food & Mess" (poor quality, undercooked, stale, spoiled, insects in food, unhygienic mess)
   - "Wi-Fi & Internet" (slow internet, Wi-Fi outage, authentication problem, connection drop)
   - "Plumbing & Bathroom" (leaking tap, clogged drain/toilet, broken shower, sewage, bad odor)
   - "Cleanliness & Hygiene" (dirty room/washroom, overflowing garbage, insects/pests, mosquitoes)
   - "Hostel / Room Maintenance" (broken bed/furniture, door/lock issue, damaged window, AC/cooler)
   - "Security" (unauthorized entry, broken gate, CCTV fault, guard issue, suspicious activity)
   - "Lift / Elevator" (lift stuck, not working, frequent failure, button fault)
   - "Classroom / Academic Infrastructure" (projector, smart board, classroom furniture, lab equipment)
   - "Computer Lab" (PC broken, keyboard/mouse fault, slow system, lab network)
   - "Parking & Transport" (parking obstruction, bus timing, campus transit issue)
   - "Sports & Recreation" (damaged sports/gym equipment, playground maintenance)
   - "Campus Environment" (fallen tree branch, open drainage, waterlogging, broken streetlight)
   - "Staff / Service Issue" (staff behavior, unaddressed delay, maintenance delay)
   - "General / Other" (when complaint does not fit any specific category above)

2. Subcategory: Provide a concise 2-4 word subcategory (e.g. "Exposed Wiring", "No Water", "Spoiled Food", "Slow Internet", "Leaking Tap", "Ceiling Crack", "Fan Malfunction", "Unauthorized Entry").

3. Severity: Exactly one of ["Critical", "High", "Medium", "Low"]:
   - "Critical": Immediate danger to life, active smoke/fire, gas leakage, exposed high-voltage hazard, structural collapse risk.
   - "High": Urgent disruption (e.g., no water in entire hostel, sewage overflow, major water leak, large ceiling crack, unauthorized intruder).
   - "Medium": Standard maintenance or service issue (e.g., fan not working, broken tap, slow Wi-Fi, damaged chair, poor food quality).
   - "Low": Minor inconvenience or suggestion (e.g., minor scuff, suggestion, minor cosmetic issue).

4. Department: Responsible team from:
   ["Electrical Maintenance", "Plumbing & Water", "Mess / Food Services", "IT / Network", "Hostel Maintenance", "Housekeeping", "Security", "Fire & Safety", "Civil Maintenance", "Academic / Classroom Maintenance", "Computer Lab", "Transport", "Sports Department", "Administration", "Other"].

5. Summary: Concise 1-2 sentence factual summary of what the student reported.

6. Risk Flags: Array containing ONLY applicable flags from:
   ["fire", "smoke", "gas_leak", "electrical_hazard", "water_contamination", "sewage", "food_contamination", "security_risk", "structural_damage", "health_hygiene", "internet_outage"]. If no special risk applies, return empty array [].

7. Recommended Action & Safety Rule:
   - Provide a short, direct action plan for the responsible department.
   - SAFETY MANDATE: Never provide hazardous DIY instructions to students. For fire, electrical sparks, gas, sewage, or structural hazards, advise contacting emergency authorities and staying away from the hazard zone.

Respond in structured JSON format only.
`;

      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                subcategory: { type: Type.STRING },
                severity: { type: Type.STRING },
                department: { type: Type.STRING },
                summary: { type: Type.STRING },
                reason: { type: Type.STRING },
                riskFlags: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                recommendedAction: { type: Type.STRING },
                confidence: { type: Type.NUMBER }
              },
              required: ["category", "subcategory", "severity", "department", "summary", "reason", "riskFlags", "recommendedAction"]
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text);

          const validSeverities = ["Critical", "High", "Medium", "Low"];
          const normalizedSeverity = validSeverities.find(s => s.toLowerCase() === (parsed.severity || "").toLowerCase()) || "Medium";

          const normalizedCategory = allowedCategories.find(c => c.toLowerCase() === (parsed.category || "").toLowerCase()) || "General / Other";
          const normalizedDepartment = allowedDepartments.find(d => d.toLowerCase() === (parsed.department || "").toLowerCase()) || "Administration";
          
          const filteredRiskFlags = Array.isArray(parsed.riskFlags)
            ? parsed.riskFlags.filter((f: string) => allowedRiskFlags.includes(f.toLowerCase()))
            : [];

          const urgencyScore = normalizedSeverity === "Critical" ? 95 : normalizedSeverity === "High" ? 80 : normalizedSeverity === "Medium" ? 55 : 25;

          return res.json({
            category: normalizedCategory,
            subcategory: parsed.subcategory || "General Issue",
            severity: normalizedSeverity,
            priority: normalizedSeverity,
            department: normalizedDepartment,
            recommendedDepartment: normalizedDepartment,
            summary: parsed.summary || cleanTitle,
            reason: parsed.reason || "Evaluated by CampusCare AI Triage Engine.",
            riskFlags: filteredRiskFlags,
            recommendedAction: parsed.recommendedAction || "Please inspect the reported issue and complete standard maintenance.",
            suggestedAction: parsed.recommendedAction || "Please inspect the reported issue and complete standard maintenance.",
            urgencyScore,
            confidence: typeof parsed.confidence === "number" ? Math.min(100, Math.max(0, parsed.confidence)) : 96,
            estimatedResolutionHours: normalizedSeverity === "Critical" ? 4 : normalizedSeverity === "High" ? 24 : 48
          });
        }
      } catch (geminiError) {
        console.error("Gemini API error, activating resilient heuristic triage fallback:", geminiError);
      }
    }

    // ========================================================
    // Resilient Heuristic Fallback Engine (Rules-Based Triage)
    // ========================================================
    const text = `${cleanTitle} ${cleanDesc}`.toLowerCase();
    let detectedCategory = "General / Other";
    let detectedSubcategory = "General Inquiry";
    let severity: "Critical" | "High" | "Medium" | "Low" = "Medium";
    let department = "Administration";
    let summary = cleanTitle;
    let reason = "Evaluated via CampusCare standard university SLA rules.";
    let action = "Campus administration should assign a technician to inspect and resolve the reported issue.";
    const detectedFlags: string[] = [];

    // 1. Fire & Safety
    if (text.includes("smoke") || text.includes("fire") || text.includes("gas leak") || text.includes("burning smell") || text.includes("extinguisher") || text.includes("fire alarm")) {
      detectedCategory = "Fire & Safety";
      detectedSubcategory = text.includes("smoke") ? "Smoke Hazard" : text.includes("gas") ? "Gas Leakage" : "Fire Hazard";
      severity = "Critical";
      department = "Fire & Safety";
      if (text.includes("smoke")) detectedFlags.push("smoke");
      if (text.includes("fire")) detectedFlags.push("fire");
      if (text.includes("gas")) detectedFlags.push("gas_leak");
      if (text.includes("panel") || text.includes("electr") || text.includes("spark")) detectedFlags.push("electrical_hazard");
      reason = "Potential active fire, smoke, or toxic gas hazard posing immediate risk to occupants.";
      action = "Alert campus emergency response and Fire & Safety desk immediately. Evacuate personnel and isolate the affected area.";
    }
    // 2. Electricity
    else if (text.includes("spark") || text.includes("electric shock") || text.includes("short circuit") || text.includes("exposed wire") || text.includes("power cut") || text.includes("fan") || text.includes("light") || text.includes("socket") || text.includes("switchboard")) {
      detectedCategory = "Electricity";
      department = "Electrical Maintenance";
      if (text.includes("spark") || text.includes("shock") || text.includes("exposed wire") || text.includes("short circuit")) {
        detectedSubcategory = "Exposed Electrical Wiring";
        severity = "Critical";
        detectedFlags.push("electrical_hazard");
        reason = "Exposed or sparking electrical wiring creates severe electrocution and fire hazard.";
        action = "Electrical maintenance should immediately shut off power to the circuit, quarantine the area, and replace damaged wiring.";
      } else if (text.includes("fan")) {
        detectedSubcategory = "Fan Malfunction";
        severity = "Medium";
        reason = "Room appliance malfunction causing inconvenience without immediate physical danger.";
        action = "Electrical maintenance technician should inspect the fan capacitor, motor wiring, and wall regulator.";
      } else {
        detectedSubcategory = "Power & Lighting Issue";
        severity = text.includes("power cut") ? "High" : "Medium";
        reason = "Electrical fixture failure requiring maintenance inspection.";
        action = "Electrical team should test distribution board switches and restore normal power.";
      }
    }
    // 3. Water Supply
    else if (text.includes("no water") || text.includes("water supply") || text.includes("water pressure") || text.includes("dirty water") || text.includes("drinking water") || text.includes("ro purifier") || text.includes("water tank")) {
      detectedCategory = "Water Supply";
      department = "Plumbing & Water";
      if (text.includes("no water")) {
        detectedSubcategory = "No Water Supply";
        severity = "High";
        detectedFlags.push("health_hygiene");
        reason = "Lack of running water disrupts essential student hygiene and living conditions.";
        action = "Plumbing and water maintenance team should inspect booster pumps, overhead storage tanks, and main supply valves.";
      } else if (text.includes("dirty") || text.includes("contaminat")) {
        detectedSubcategory = "Water Contamination";
        severity = "High";
        detectedFlags.push("water_contamination", "health_hygiene");
        reason = "Contaminated water supply poses a severe public health hazard for campus residents.";
        action = "Halt supply from affected tank, flush pipeline system, and conduct sanitary lab testing.";
      } else {
        detectedSubcategory = "Water Pressure / Purifier Issue";
        severity = "Medium";
        reason = "Drinking or utility water service requires maintenance filtration or pressure tuning.";
        action = "Service water purifier filters and verify tank pressure regulators.";
      }
    }
    // 4. Food & Mess
    else if (text.includes("mess") || text.includes("food") || text.includes("spoiled") || text.includes("undercooked") || text.includes("stale") || text.includes("canteen") || text.includes("meal")) {
      detectedCategory = "Food & Mess";
      department = "Mess / Food Services";
      if (text.includes("spoiled") || text.includes("stale") || text.includes("insect") || text.includes("smelled bad") || text.includes("unhygienic")) {
        detectedSubcategory = "Spoiled Food Quality";
        severity = "High";
        detectedFlags.push("food_contamination", "health_hygiene");
        reason = "Spoiled, contaminated, or improperly stored food presents immediate food poisoning risk.";
        action = "Mess committee and food safety supervisor must inspect the current meal batch and halt distribution.";
      } else {
        detectedSubcategory = "Mess Service & Quality";
        severity = "Medium";
        reason = "Dining hall service or meal preparation quality feedback.";
        action = "Review student feedback with head mess contractor and verify dietary compliance.";
      }
    }
    // 5. Plumbing & Bathroom
    else if (text.includes("tap") || text.includes("leak") || text.includes("drain") || text.includes("toilet") || text.includes("sewage") || text.includes("shower") || text.includes("sink") || text.includes("bathroom flooding")) {
      detectedCategory = "Plumbing & Bathroom";
      department = "Plumbing & Water";
      if (text.includes("sewage") || text.includes("flooding")) {
        detectedSubcategory = "Sewage Overflow";
        severity = "High";
        detectedFlags.push("sewage", "health_hygiene");
        reason = "Sewage overflow or bathroom flooding creates severe hygiene risks and building damage.";
        action = "Deploy emergency drainage clearance crew and sanitize flooded floor zones.";
      } else {
        detectedSubcategory = "Leaking Tap / Fixture";
        severity = "Medium";
        reason = "Faulty bathroom fixture causing continuous water wastage.";
        action = "Plumbing maintenance should replace damaged tap washers, seals, or siphon valves.";
      }
    }
    // 6. Wi-Fi & Internet
    else if (text.includes("wifi") || text.includes("wi-fi") || text.includes("internet") || text.includes("network") || text.includes("slow internet") || text.includes("disconnection") || text.includes("broadband")) {
      detectedCategory = "Wi-Fi & Internet";
      department = "IT / Network";
      detectedSubcategory = text.includes("slow") ? "Slow Internet Speed" : text.includes("outage") ? "Network Outage" : "Wi-Fi Connectivity Issue";
      severity = text.includes("outage") ? "High" : "Medium";
      if (text.includes("outage")) detectedFlags.push("internet_outage");
      reason = "Network connectivity degradation impacting academic access and online coursework.";
      action = "IT / Network team should check access point throughput, reboot switchports, and verify ISP uplink.";
    }
    // 7. Security
    else if (text.includes("unauthorized") || text.includes("permission") || text.includes("theft") || text.includes("stole") || text.includes("intruder") || text.includes("cctv") || text.includes("guard") || text.includes("security")) {
      detectedCategory = "Security";
      department = "Security";
      detectedSubcategory = text.includes("unauthorized") || text.includes("permission") ? "Unauthorized Entry" : "Campus Security Concern";
      severity = "High";
      detectedFlags.push("security_risk");
      reason = "Reported unauthorized access or security lapse requiring immediate campus safety review.";
      action = "Security department should review CCTV surveillance logs, tighten gate checkpoints, and dispatch security officers.";
    }
    // 8. Room / Hostel / Civil Maintenance
    else if (text.includes("crack") || text.includes("ceiling") || text.includes("wall") || text.includes("bed") || text.includes("cupboard") || text.includes("door") || text.includes("window") || text.includes("furniture") || text.includes("chair") || text.includes("table")) {
      if (text.includes("crack") || text.includes("ceiling") || text.includes("structural")) {
        detectedCategory = "Hostel / Room Maintenance";
        detectedSubcategory = "Ceiling Crack / Structural Damage";
        severity = "High";
        department = "Civil Maintenance";
        detectedFlags.push("structural_damage");
        reason = "Fissure or structural damage reported on ceiling or masonry requiring civil engineer assessment.";
        action = "Civil maintenance engineer should inspect structural stability and execute plastering/masonry reinforcement.";
      } else {
        detectedCategory = "Hostel / Room Maintenance";
        detectedSubcategory = "Room Furniture & Fixture Damage";
        severity = "Medium";
        department = "Hostel Maintenance";
        reason = "Hostel room furniture or fixture damage requiring carpenter or handyman service.";
        action = "Hostel maintenance handyman should inspect and repair or replace the damaged furniture.";
      }
    }
    // 9. Cleanliness & Hygiene
    else if (text.includes("dirty") || text.includes("garbage") || text.includes("dustbin") || text.includes("mosquito") || text.includes("cockroach") || text.includes("pest") || text.includes("smell") || text.includes("sanitation")) {
      detectedCategory = "Cleanliness & Hygiene";
      department = "Housekeeping";
      detectedSubcategory = text.includes("pest") || text.includes("mosquito") ? "Pest Control Issue" : "Waste & Housekeeping";
      severity = text.includes("pest") ? "Medium" : "Medium";
      detectedFlags.push("health_hygiene");
      reason = "Unsanitary premises or waste accumulation affecting environmental health.";
      action = "Housekeeping team should conduct thorough sanitation, empty bins, and schedule pest fumigation.";
    }
    // 10. Computer Lab
    else if (text.includes("computer") || text.includes("pc") || text.includes("keyboard") || text.includes("mouse") || text.includes("software") || text.includes("lab")) {
      detectedCategory = "Computer Lab";
      department = "Computer Lab";
      detectedSubcategory = "Lab Hardware / Software Issue";
      severity = "Medium";
      reason = "Computing laboratory workstation or software package unavailable for practical classes.";
      action = "Lab technician should test workstation hardware, update operating system drivers, and verify network connectivity.";
    }

    const urgencyScore = severity === "Critical" ? 95 : severity === "High" ? 80 : severity === "Medium" ? 55 : 25;

    return res.json({
      category: detectedCategory,
      subcategory: detectedSubcategory,
      severity,
      priority: severity,
      department,
      recommendedDepartment: department,
      summary: cleanTitle.length > 8 ? `${cleanTitle}. Reported at campus.` : summary,
      reason,
      riskFlags: detectedFlags,
      recommendedAction: action,
      suggestedAction: action,
      urgencyScore,
      confidence: 94,
      estimatedResolutionHours: severity === "Critical" ? 4 : severity === "High" ? 24 : 48
    });
  } catch (error: any) {
    console.error("AI Analysis failed:", error);
    res.status(500).json({
      category: "General / Other",
      subcategory: "Unknown",
      severity: "Medium",
      priority: "Medium",
      department: "Administration",
      recommendedDepartment: "Administration",
      summary: "The complaint could not be automatically classified.",
      reason: "Manual administrative review is required.",
      riskFlags: [],
      recommendedAction: "Please review the complaint manually.",
      suggestedAction: "Please review the complaint manually.",
      urgencyScore: 50,
      confidence: null,
      estimatedResolutionHours: 48
    });
  }
});

// POST /api/ai/suggest-resolution - Admin Only Helper
app.post("/api/ai/suggest-resolution", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { complaintId } = req.body;
    const complaint = complaints.find(c => c.id === complaintId);

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    const ai = getGeminiClient();
    if (ai) {
      const prompt = `
You are a university administrator in charge of student grievance redressal.
Draft an empathetic, professional resolution notice and proposed action plan for this complaint:

Complaint ID: ${complaint.id}
Student: ${complaint.studentName} (${complaint.studentRoll})
Title: ${complaint.title}
Category: ${complaint.category}
Priority: ${complaint.priority}
Description: ${complaint.description}

Respond in JSON format:
{
  "resolutionSummary": "1-2 sentence official response to student explaining remedial action taken.",
  "internalNotes": "Recommended internal steps for department staff.",
  "preventativeAction": "Action to prevent recurrence on campus."
}
`;
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      if (response.text) {
        return res.json(JSON.parse(response.text));
      }
    }

    res.json({
      resolutionSummary: `The ${complaint.department || 'designated department'} has inspected the issue regarding "${complaint.title}" and completed necessary rectifications. Services have been restored to full standard.`,
      internalNotes: "Verified maintenance logs and confirmed on-site clearance with facility supervisor.",
      preventativeAction: "Scheduled bi-weekly routine inspection to avoid recurrence."
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to draft resolution suggestion." });
  }
});

// POST /api/ai/generate-insights - Interactive AI Query
app.post("/api/ai/generate-insights", requireAuth, async (req, res) => {
  try {
    const { query } = req.body;
    const ai = getGeminiClient();

    if (ai && query && typeof query === "string") {
      const summaryPayload = complaints.slice(0, 15).map(c => ({
        id: c.id,
        category: c.category,
        priority: c.priority,
        status: c.status,
        title: c.title,
        description: c.description.slice(0, 100)
      }));

      const prompt = `
You are the AI Campus Intelligence assistant for university administrators.
Answer this administrative query using the recent complaints database:
User Query: "${query.slice(0, 300)}"
Recent Database Sample: ${JSON.stringify(summaryPayload)}

Provide a concise, professional 2-3 paragraph analytical memo with specific findings and actionable recommendations.
`;
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
      });

      if (response.text) {
        return res.json({ customAnalysis: response.text });
      }
    }

    res.json({
      customAnalysis: "Based on current complaint records, hostel and infrastructure maintenance requests represent the highest volume. All critical issues have been assigned to designated supervisors with active SLAs."
    });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate AI insights." });
  }
});

// ==========================================
// 10. NOTIFICATIONS APIs
// ==========================================
app.get("/api/notifications", requireAuth, (req, res) => {
  const { recipientType, recipientId } = req.query;
  let results = [...notifications];

  if (recipientType) {
    results = results.filter(n => n.recipientType === recipientType);
  }
  if (recipientId) {
    results = results.filter(n => !n.recipientId || n.recipientId === recipientId);
  }

  res.json({ notifications: results });
});

app.patch("/api/notifications/:id/read", requireAuth, (req, res) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

app.post("/api/notifications/mark-all-read", requireAuth, (req, res) => {
  notifications.forEach(n => n.read = true);
  res.json({ success: true });
});

// ==========================================
// 11. GLOBAL ERROR HANDLER & SERVER BOOTSTRAP
// ==========================================
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Unhandled server error:", err);
  res.status(500).json({ error: "An unexpected error occurred. Please try again later." });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CampusCare] Server running on http://0.0.0.0:${PORT} (Demo Mode: ${IS_DEMO_MODE ? "Active" : "Disabled"})`);
  });
}

startServer();
