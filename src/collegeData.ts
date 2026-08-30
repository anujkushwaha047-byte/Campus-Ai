export const OFFICIAL_SOURCE_URLS = {
  home: "https://itsengg.edu.in/public/",
  directory: "https://itsengg.edu.in/public/Directory",
  courses: "https://itsengg.edu.in/public/Course_Offered",
} as const;

export interface CollegeDirectoryEntry {
  name: string;
  designation: string;
  department: string | null;
  phone: string | null;
  email: string | null;
  source: string;
  verified: boolean;
}

export const COLLEGE_INFORMATION = {
  name: "I.T.S Engineering College",
  address: "46, Knowledge Park III, Greater Noida - 201310",
  phone: "1800-180-0840",
  email: "admission.ec@its.edu.in",
  website: "https://itsengg.edu.in/public/",
  source: OFFICIAL_SOURCE_URLS.home,
  verified: true,
} as const;

export const COLLEGE_DIRECTORY: CollegeDirectoryEntry[] = [
  { name: "Prof (Dr.) Mayank Garg", designation: "Director", department: "Institutional Leadership", phone: "0120-2331014", email: "dir.engg@its.edu.in", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "Dr. Vishnu Sharma", designation: "Dean CSE", department: "Computer Science & Engineering", phone: "0120-2331010", email: "dean.cse@its.edu.in", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "Dr. Jaya", designation: "HoD - CSE", department: "Computer Science & Engineering", phone: "0120-2331023", email: "hod.cse@its.edu.in", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "Dr. Sanjay Yadav", designation: "DSW & HoD Mechanical", department: "Mechanical Engineering", phone: "0120-2331024", email: "dean.sw.engg@its.edu.in", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "Dr. A. Ambikapathy", designation: "HoD - ECE", department: "Electronics & Communication", phone: "0120-2331038", email: "hod.ece@its.edu.in", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "Dr. O. P. Choudhary", designation: "HoD - Applied Science & Humanities", department: "Applied Sciences", phone: "0120-2331026", email: "hod.ash@its.edu.in", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "Mr. Nitin Gupta", designation: "Registrar", department: "Administration", phone: "0120-2331027", email: "reg.engg@its.edu.in", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
] as const;

export const TEAM_MEMBERS = [
  {
    name: "Anuj Kushwaha",
    role: "Lead Student Developer",
    isLead: true,
    department: "Computer Science & Engineering (AIML)",
    institution: "I.T.S Engineering College",
    contributions: ["System Architecture", "AI Integration & Gemini API", "End-to-End Full Stack Development"],
  },
  {
    name: "Ankit Kumar Singh",
    role: "Student Developer",
    isLead: false,
    department: "Computer Science & Engineering (AIML)",
    institution: "I.T.S Engineering College",
    contributions: ["Frontend UI/UX", "Component Engineering", "Testing & Verification"],
  },
  {
    name: "Abhinav Tiwari",
    role: "Student Developer",
    isLead: false,
    department: "Computer Science & Engineering (AIML)",
    institution: "I.T.S Engineering College",
    contributions: ["API Integration", "Database Architecture", "SLA & Analytics Module"],
  },
] as const;

export const PROJECT_CREDITS = [
  { area: "Concept & Development", description: "Architected for academic institution grievance redressal and AI triage." },
  { area: "UI/UX & Design System", description: "Engineered with Tailwind CSS, Plus Jakarta Sans typography, and modern responsive cards." },
  { area: "Backend & API Integration", description: "Node.js & Express REST endpoints for authentication, triage, and complaint tracking." },
  { area: "AI Integration", description: "Google Gemini AI API (@google/genai) for urgency analysis, sentiment scoring, and automated categorization." },
  { area: "Database & Authentication", description: "Verified .edu.in student multi-factor OTP verification with CSV registry and in-memory persistence." },
  { area: "Testing & Deployment", description: "Automated Vite production build, TypeScript verification, and Render cloud hosting." },
] as const;
