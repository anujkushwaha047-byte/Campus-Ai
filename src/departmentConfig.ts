export interface DepartmentAssignee {
  id: string;
  name: string;
  role: string;
}

export interface DepartmentDefinition {
  id: string;
  name: string;
  assignees: DepartmentAssignee[];
}

export const DEPARTMENTS: DepartmentDefinition[] = [
  {
    id: "hostel-warden",
    name: "Hostel / Warden",
    assignees: [
      { id: "warden-a", name: "Warden A", role: "Hostel Warden" },
      { id: "warden-b", name: "Warden B", role: "Hostel Warden" },
    ],
  },
  {
    id: "room-maintenance",
    name: "Room Maintenance",
    assignees: [
      { id: "maintenance-staff", name: "Maintenance Staff", role: "Maintenance Staff" },
      { id: "maintenance-supervisor", name: "Maintenance Supervisor", role: "Maintenance Supervisor" },
    ],
  },
  {
    id: "it-network",
    name: "IT / Network",
    assignees: [
      { id: "it-admin", name: "IT Admin", role: "IT Administrator" },
      { id: "network-technician", name: "Network Technician", role: "Network Technician" },
    ],
  },
  {
    id: "electrical",
    name: "Electrical",
    assignees: [
      { id: "electrical-staff", name: "Electrical Staff", role: "Electrical Staff" },
      { id: "chief-electrician", name: "Chief Electrician", role: "Electrical Supervisor" },
    ],
  },
  {
    id: "water-plumbing",
    name: "Water & Plumbing",
    assignees: [
      { id: "plumbing-staff", name: "Plumbing Staff", role: "Plumbing Staff" },
      { id: "plumbing-supervisor", name: "Plumbing Supervisor", role: "Plumbing Supervisor" },
    ],
  },
  {
    id: "mess-food",
    name: "Mess / Food",
    assignees: [{ id: "mess-manager", name: "Mess Manager", role: "Mess Manager" }],
  },
  {
    id: "housekeeping",
    name: "Housekeeping",
    assignees: [{ id: "housekeeping-lead", name: "Housekeeping Lead", role: "Housekeeping Lead" }],
  },
  {
    id: "academic-classroom",
    name: "Academic / Classroom",
    assignees: [{ id: "academic-coordinator", name: "Academic Coordinator", role: "Academic Coordinator" }],
  },
  {
    id: "security",
    name: "Security",
    assignees: [{ id: "security-supervisor", name: "Security Supervisor", role: "Security Supervisor" }],
  },
  {
    id: "administration",
    name: "Administration",
    assignees: [{ id: "admin-desk", name: "Administration Desk", role: "Administrative Officer" }],
  },
  {
    id: "other",
    name: "Other",
    assignees: [{ id: "central-support", name: "Central Support Desk", role: "Duty Officer" }],
  },
];

export function getDepartmentDefinition(name?: string): DepartmentDefinition | undefined {
  return DEPARTMENTS.find((department) => department.name === name);
}
