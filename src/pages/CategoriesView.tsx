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
      category: "Hostel",
      lead: "Dr. Ramesh V. (Chief Warden)",
      office: "Hostel Administrative Wing, Ground Floor",
      contact: "warden.hostel@campus.edu",
      description: "Room maintenance, plumbing, electricals, sanitation, mess quality, and room allocation.",
      sla: "24-48 Hours",
      color: "from-blue-500 to-indigo-600",
    },
    {
      category: "Faculty",
      lead: "Prof. Ananya Sen (Dean Academics)",
      office: "Academic Council Secretariat, Main Building",
      contact: "dean.academics@campus.edu",
      description: "Course delivery, attendance discrepancies, lecture timetable clashes, and academic grievances.",
      sla: "3-5 Business Days",
      color: "from-emerald-500 to-teal-600",
    },
    {
      category: "Library",
      lead: "Mrs. Sunita Rao (Head Librarian)",
      office: "Central University Library, 2nd Floor",
      contact: "library.desk@campus.edu",
      description: "Book availability, digital journal database access, reading hall noise, and overdue fine appeals.",
      sla: "24 Hours",
      color: "from-purple-500 to-indigo-600",
    },
    {
      category: "Examination",
      lead: "Dr. Arvind Swamy (Controller of Exams)",
      office: "Examination Cell, Admin Block Room 104",
      contact: "exams@campus.edu",
      description: "Hall tickets, re-evaluation requests, marksheet corrections, and exam hall logistics.",
      sla: "48-72 Hours",
      color: "from-pink-500 to-rose-600",
    },
    {
      category: "IT",
      lead: "Er. Sandeep Joshi (Network Director)",
      office: "Campus IT Data Center, Tech Park",
      contact: "it.helpdesk@campus.edu",
      description: "Campus Wi-Fi connectivity, student ERP login issues, laboratory hardware, and projector repairs.",
      sla: "12-24 Hours",
      color: "from-cyan-500 to-blue-600",
    },
    {
      category: "Infrastructure",
      lead: "Er. K. N. Sastry (Chief Estate Officer)",
      office: "Civil & Estate Works Section",
      contact: "estate@campus.edu",
      description: "Classroom furniture, lift maintenance, drinking water coolers, and campus lighting.",
      sla: "48 Hours",
      color: "from-amber-500 to-orange-600",
    },
    {
      category: "Transport",
      lead: "Mr. Baldev Singh (Transport Officer)",
      office: "Bus Garage & Fleet Control Desk",
      contact: "transport@campus.edu",
      description: "University bus route delays, route expansion requests, and bus pass validation.",
      sla: "48 Hours",
      color: "from-sky-500 to-blue-600",
    },
    {
      category: "Fees",
      lead: "Mr. R. K. Mukherjee (Chief Accounts Officer)",
      office: "Finance & Accounts Branch, Ground Floor",
      contact: "finance.student@campus.edu",
      description: "Semester fee receipts, scholarship disbursements, refund processing, and challan errors.",
      sla: "3-4 Business Days",
      color: "from-violet-500 to-purple-600",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF1] shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">
          Campus Grievance Categories & Department Desks
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
                  <h3 className="font-bold text-base">{item.category} Department</h3>
                  <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                    {categoryCount} total tickets
                  </span>
                </div>

                <div className="p-5 space-y-3.5 text-xs">
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-semibold text-slate-400">Head Officer:</span>
                      <span className="font-bold text-slate-900">{item.lead}</span>
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
