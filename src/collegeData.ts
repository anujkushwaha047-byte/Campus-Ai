export const OFFICIAL_SOURCE_URLS = {
  home: "https://itsengg.edu.in/public/",
  directory: "https://itsengg.edu.in/public/Directory",
  courses: "https://itsengg.edu.in/public/Course_Offered",
} as const;

export type CourseCode =
  | "BTECH_CSE"
  | "BTECH_CSE_AI"
  | "BTECH_CSE_DS"
  | "BTECH_ECE"
  | "BTECH_CIVIL"
  | "BTECH_MECHANICAL"
  | "BTECH_ECELECTRICAL"
  | "MBA"
  | "BCA"
  | "BBA";

export interface CollegeCourse {
  code: CourseCode;
  name: string;
  level: "Undergraduate" | "Postgraduate";
  verified: boolean;
  source: string | null;
  durationYears?: number;
  approvedIntake?: number;
  verificationNote?: string;
  department: string | null;
}

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
  source: OFFICIAL_SOURCE_URLS.home,
  verified: true,
} as const;

export const COLLEGE_COURSES: CollegeCourse[] = [
  { code: "BTECH_CIVIL", name: "B.Tech Civil Engineering", level: "Undergraduate", verified: true, source: OFFICIAL_SOURCE_URLS.courses, durationYears: 4, approvedIntake: 30, department: "Civil" },
  { code: "BTECH_CSE", name: "B.Tech Computer Science and Engineering", level: "Undergraduate", verified: true, source: OFFICIAL_SOURCE_URLS.courses, durationYears: 4, approvedIntake: 750, department: "CSE" },
  { code: "BTECH_CSE_AI", name: "B.Tech Computer Science and Engineering- Artificial Intelligence", level: "Undergraduate", verified: true, source: OFFICIAL_SOURCE_URLS.courses, durationYears: 4, approvedIntake: 180, department: "CSE" },
  { code: "BTECH_CSE_DS", name: "B.Tech Computer Science and Engineering- Data Science", level: "Undergraduate", verified: true, source: OFFICIAL_SOURCE_URLS.courses, durationYears: 4, approvedIntake: 120, department: "CSE" },
  { code: "BTECH_ECELECTRICAL", name: "B.Tech Electrical and Computer Engineering", level: "Undergraduate", verified: true, source: OFFICIAL_SOURCE_URLS.courses, durationYears: 4, approvedIntake: 30, department: "Electrical and Computer Engineering" },
  { code: "BTECH_ECE", name: "B.Tech Electronics & Communications Engineering", level: "Undergraduate", verified: true, source: OFFICIAL_SOURCE_URLS.courses, durationYears: 4, approvedIntake: 60, department: "ECE" },
  { code: "BTECH_MECHANICAL", name: "B.Tech Mechanical Engineering (ME)", level: "Undergraduate", verified: true, source: OFFICIAL_SOURCE_URLS.courses, durationYears: 4, approvedIntake: 30, department: "Mechanical" },
  { code: "MBA", name: "Master of Business Administration", level: "Postgraduate", verified: true, source: OFFICIAL_SOURCE_URLS.courses, durationYears: 2, approvedIntake: 60, department: "Management Studies" },
  { code: "BCA", name: "Bachelor of Computer Applications", level: "Undergraduate", verified: false, source: null, verificationNote: "Course information pending official verification", department: null },
  { code: "BBA", name: "Bachelor of Business Administration", level: "Undergraduate", verified: false, source: null, verificationNote: "Course information pending official verification", department: null },
];

export const COLLEGE_DIRECTORY: CollegeDirectoryEntry[] = [
  { name: "Prof (Dr.) Mayank Garg", designation: "Director", department: null, phone: "0120-2331014", email: "dir.engg@its.edu.in", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "Director Office", designation: "Director Office", department: null, phone: "0120-2331010", email: "diroff.engg@its.edu.in", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "Dr. Vishnu Sharma", designation: "Dean CSE", department: "CSE", phone: "0120-2331010", email: "dean.cse@its.edu.in", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "Dr. Sanjay Yadav", designation: "DSW & HoD Mechanical", department: "Mechanical", phone: "0120-2331024", email: "dean.sw.engg@its.edu.in", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "Dr. Jaya", designation: "HoD - CSE", department: "CSE", phone: "0120-2331023", email: "hod.cse@its.edu.in", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "Dr. O. P. Choudhary", designation: "HoD - ASH", department: "ASH", phone: "0120-2331026", email: "hod.ash@its.edu.in", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "Dr. Sanjay Yadav", designation: "HoD - Civil", department: "Civil", phone: "0120-2331024", email: "hod.civil@its.edu.in", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "Dr. A. Ambikapathy", designation: "HoD - ECE", department: "ECE", phone: "0120-2331038", email: "hod.ece@its.edu.in", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "Mr. Vinod Chand", designation: "Administrator", department: null, phone: "0120-2331018", email: "admin.engg@its.edu.in", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "Mr. Mohit Kapoor", designation: "Associate Manager- HR", department: "HR", phone: "0120-2331020", email: "hr.engg@its.edu.in", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "Mr. Nitin Gupta", designation: "Registrar", department: null, phone: "0120-2331027", email: "reg.engg@its.edu.in", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
] as const;

export const COLLEGE_DEPARTMENTS = [
  { name: "CSE", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "ECE", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "Civil", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "Mechanical", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "ASH", source: OFFICIAL_SOURCE_URLS.directory, verified: true },
  { name: "Electrical and Computer Engineering", source: OFFICIAL_SOURCE_URLS.courses, verified: true },
  { name: "Management Studies", source: OFFICIAL_SOURCE_URLS.courses, verified: true },
];

export const WARDEN_CONTACT = {
  available: false,
  message: "Official warden contact information is not available in the verified ITS source.",
  source: OFFICIAL_SOURCE_URLS.directory,
  verified: false,
} as const;

export function getCourse(code?: string | null): CollegeCourse | null {
  return COLLEGE_COURSES.find(course => course.code === code) || null;
}

export function getCourseDepartment(code?: string | null): string | null {
  return getCourse(code)?.department || null;
}
