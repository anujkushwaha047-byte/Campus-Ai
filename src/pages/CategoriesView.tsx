import React from "react";
import { FolderTree, Building, ShieldCheck, Clock, Users, ArrowRight } from "lucide-react";
import { Category, Complaint } from "../types";

interface CategoriesViewProps {
  complaints: Complaint[];
  onSelectCategoryFilter: (category: Category) => void;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  complaints,
  onSelectCategoryFilter,
}) => {
  const categoryConfigs: {
    category: Category;
    lead: string;
    office: string;
    contact: string;
    description: string;
    sla: string;
    color: string;
  }[] = [
    {
      category: "Fire & Safety",
      lead: "Er. V. K. Malhotra (Chief Fire Safety Officer)",
      office: "Campus Emergency Control Center, Room 101",
      contact: "firesafety@campus.edu",
      description: "Fire hazards, smoke alarms, emergency exits, gas leaks, and fire suppression systems.",
      sla: "Immediate (1-2 Hours)",
      color: "from-rose-600 to-red-700",
    },
    {
      category: "Electricity",
      lead: "Er. Sandeep Verma (Chief Electrical Engineer)",
      office: "Electrical Substation & Maintenance Office",
      contact: "electrical@campus.edu",
      description: "Power cuts, short circuits, exposed wires, room fans, switchboards, and backup generators.",
      sla: "4-12 Hours",
      color: "from-amber-500 to-orange-600",
    },
    {
      category: "Water Supply",
      lead: "Er. K. N. Sastry (Water Supply Superintendent)",
      office: "Hydro & Water Works Section, Pump House 2",
      contact: "waterworks@campus.edu",
      description: "Drinking water quality, RO purifiers, supply shortages, pressure issues, and tank maintenance.",
      sla: "4-8 Hours",
      color: "from-cyan-500 to-blue-600",
    },
    {
      category: "Food & Mess",
      lead: "Dr. Arvind Swamy (Hostel Mess Warden)",
      office: "Central Dining & Mess Administration Hall",
      contact: "mess.committee@campus.edu",
      description: "Meal hygiene, food contamination, catering delays, menu adherence, and drinking water in dining halls.",
      sla: "4-12 Hours",
      color: "from-emerald-500 to-teal-600",
    },
    {
      category: "Wi-Fi & Internet",
      lead: "Er. Sandeep Joshi (Network & IT Director)",
      office: "Campus IT Data Center, Tech Park",
      contact: "it.helpdesk@campus.edu",
      description: "Hostel Wi-Fi coverage, campus broadband outages, student portal logins, and bandwidth speeds.",
      sla: "12-24 Hours",
      color: "from-blue-600 to-indigo-700",
    },
    {
      category: "Plumbing & Bathroom",
      lead: "Mr. Baldev Singh (Plumbing Supervisor)",
      office: "Sanitary & Plumbing Cell, Ground Floor",
      contact: "plumbing@campus.edu",
      description: "Leaking taps, blocked drains, flush repairs, shower faults, and sewage issues.",
      sla: "12-24 Hours",
      color: "from-teal-500 to-cyan-700",
    },
    {
      category: "Cleanliness & Hygiene",
      lead: "Mrs. Sunita Rao (Housekeeping Head)",
      office: "Campus Sanitation & Housekeeping Office",
      contact: "housekeeping@campus.edu",
      description: "Hostel room sanitation, garbage clearing, pest control, washroom disinfection, and common areas.",
      sla: "12 Hours",
      color: "from-emerald-600 to-green-700",
    },
    {
      category: "Hostel / Room Maintenance",
      lead: "Dr. Ramesh V. (Chief Hostel Warden)",
      office: "Hostel Administrative Wing, Ground Floor",
      contact: "warden.hostel@campus.edu",
      description: "Broken beds, doors, locks, study tables, wardrobes, ceiling fans, and room infrastructure.",
      sla: "24-48 Hours",
      color: "from-indigo-500 to-blue-700",
    },
    {
      category: "Security",
      lead: "Capt. M. S. Rana (Chief Security Officer)",
      office: "Main Gate Security HQ & CCTV Control Room",
      contact: "security.hq@campus.edu",
      description: "Unauthorized campus access, perimeter security, lost and found, CCTV footage, and safety patrols.",
      sla: "2-4 Hours",
      color: "from-slate-700 to-slate-900",
    },
    {
      category: "Lift / Elevator",
      lead: "Er. R. K. Mukherjee (Lift Maintenance Engineer)",
      office: "Estate Vertical Transport Division",
      contact: "elevators@campus.edu",
      description: "Elevator breakdown, emergency alarm bells, door malfunctions, and maintenance inspections.",
      sla: "2-6 Hours",
      color: "from-purple-600 to-indigo-800",
    },
    {
      category: "Classroom / Academic Infrastructure",
      lead: "Prof. Ananya Sen (Dean Academics)",
      office: "Academic Council Secretariat, Main Building",
      contact: "dean.academics@campus.edu",
      description: "Classroom projectors, smart boards, furniture, podium microphones, and acoustics.",
      sla: "24-48 Hours",
      color: "from-sky-600 to-blue-800",
    },
    {
      category: "Computer Lab",
      lead: "Prof. Rajesh Gupta (Computer Center Head)",
      office: "CSE Computer Labs 1-4, 2nd Floor",
      contact: "lab.cse@campus.edu",
      description: "PC hardware, software licenses, lab network, peripherals, and programming IDE environments.",
      sla: "12-24 Hours",
      color: "from-violet-600 to-purple-800",
    },
    {
      category: "Parking & Transport",
      lead: "Mr. Baldev Singh (Transport Officer)",
      office: "Bus Garage & Fleet Control Desk",
      contact: "transport@campus.edu",
      description: "College bus routes, driver conduct, student shuttle schedules, and campus parking bays.",
      sla: "24-48 Hours",
      color: "from-amber-600 to-orange-700",
    },
    {
      category: "Sports & Recreation",
      lead: "Dr. S. K. Yadav (Sports Director)",
      office: "Campus Gymnasium & Sports Complex",
      contact: "sports@campus.edu",
      description: "Badminton court, gym gear, cricket/football grounds, table tennis, and sports kits.",
      sla: "2-3 Days",
      color: "from-lime-600 to-emerald-700",
    },
    {
      category: "Campus Environment",
      lead: "Er. K. N. Sastry (Chief Estate Officer)",
      office: "Horticulture & Civil Works Section",
      contact: "estate.green@campus.edu",
      description: "Street lighting, drainage channels, pathway repairs, garden pruning, and campus waterlogging.",
      sla: "2-4 Days",
      color: "from-green-600 to-teal-800",
    },
    {
      category: "Staff / Service Issue",
      lead: "Dr. P. K. Sharma (Registrar Office)",
      office: "Administration Block, Room 102",
      contact: "registrar@campus.edu",
      description: "Staff behavior, departmental response delays, unresolved tickets, and administrative assistance.",
      sla: "3-4 Business Days",
      color: "from-pink-600 to-rose-700",
    },
    {
      category: "General / Other",
      lead: "Student Welfare Desk",
      office: "Student Affairs Building, Ground Floor",
      contact: "studentaffairs@campus.edu",
      description: "General queries, miscellaneous grievances, and inter-departmental student support.",
      sla: "3-5 Business Days",
      color: "from-slate-500 to-slate-700",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF1] shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">
          Campus Grievance Categories &amp; Department Desks
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Explore dedicated university redressal bodies, assigned officers, and guaranteed SLA resolution commitments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryConfigs.map((item) => {
          const categoryCount = complaints.filter((c) => c.category === item.category).length;
          const pendingCount = complaints.filter(
            (c) => c.category === item.category && c.status !== "Resolved" && c.status !== "Rejected"
          ).length;

          return (
            <div
              key={item.category}
              className="bg-white rounded-2xl border border-[#E5EAF1] shadow-xs overflow-hidden hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className={`p-4 bg-gradient-to-r ${item.color} text-white flex items-center justify-between`}>
                  <h3 className="font-bold text-base">{item.category}</h3>
                  <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                    {categoryCount} ticket{categoryCount === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="p-5 space-y-3.5 text-xs">
                  <p className="text-slate-600 leading-relaxed min-h-[36px]">{item.description}</p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold text-slate-400">Head Officer:</span>
                      <span className="font-bold text-slate-900 truncate max-w-[170px]">{item.lead}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold text-slate-400">Resolution SLA:</span>
                      <span className="font-bold text-emerald-600">{item.sla}</span>
                    </div>

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold text-slate-400">Active Queue:</span>
                      <span className="font-bold text-amber-600">{pendingCount} pending</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <button
                  onClick={() => onSelectCategoryFilter(item.category)}
                  className="w-full py-2 px-3 rounded-xl border border-blue-200 text-[#146EF5] hover:bg-blue-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>View All {item.category} Tickets</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
