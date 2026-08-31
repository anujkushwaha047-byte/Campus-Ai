import React from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Bot,
  BarChart3,
  FolderTree,
  AlertOctagon,
  Clock,
  FileSpreadsheet,
  Settings,
  LogOut,
  PlusCircle,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  User,
  ChevronRight,
  Sparkles,
  X
} from "lucide-react";
import { StudentProfile } from "../types";

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: "admin" | "student";
  studentProfile: StudentProfile | null;
  onLogout: () => void;
  isOpenOnMobile: boolean;
  onCloseMobile: () => void;
  criticalCount?: number;
  pendingCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  userRole,
  studentProfile,
  onLogout,
  isOpenOnMobile,
  onCloseMobile,
  criticalCount = 20,
  pendingCount = 28,
}) => {
  const adminMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "all_complaints", label: "Complaints", icon: FileText, hasSub: true },
    { id: "students", label: "Students", icon: Users, hasSub: true },
    { id: "ai_reports", label: "AI Reports", icon: Bot, hasSub: true, badge: "AI" },
    { id: "analytics", label: "Analytics", icon: BarChart3, hasSub: true },
    { id: "categories", label: "Categories", icon: FolderTree },
    {
      id: "critical",
      label: "Critical Complaints",
      icon: AlertOctagon,
      count: criticalCount,
      countColor: "bg-red-500/20 text-red-400 border border-red-500/30",
    },
    {
      id: "pending",
      label: "Pending Complaints",
      icon: Clock,
      count: pendingCount,
      countColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    },
    { id: "reports", label: "Reports", icon: FileSpreadsheet },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const studentMenuItems = [
    { id: "student_dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "submit_complaint", label: "Submit Complaint", icon: PlusCircle, highlight: true },
    { id: "my_complaints", label: "My Complaints", icon: FileText },
    { id: "track_status", label: "Complaint Status", icon: ShieldCheck },
    { id: "notifications", label: "Notifications", icon: Clock },
    { id: "help_support", label: "Help & Support", icon: HelpCircle },
    { id: "profile", label: "Profile", icon: User },
  ];

  const menuItems = userRole === "admin" ? adminMenuItems : studentMenuItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenOnMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Dark Navy Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#061B3A] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-[#09254A] lg:translate-x-0 ${
          isOpenOnMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className="h-20 px-6 flex items-center justify-between border-b border-[#0A2750]">
            <div className="flex items-center gap-3">
              {/* Brand Icon Shield/Bot */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#146EF5] to-[#3B82F6] flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
                <ShieldCheck className="w-6 h-6 text-white stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-lg text-white tracking-tight">CampusCare</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    AI
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">Management System</span>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#09254A]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-6 space-y-1.5 overflow-y-auto max-h-[calc(100vh-210px)]">
            {menuItems.map((item: any) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? "bg-[#146EF5] text-white font-semibold shadow-md shadow-blue-600/30"
                      : "text-slate-300 hover:text-white hover:bg-[#09254A]"
                  } ${item.highlight ? "border border-blue-500/40 bg-blue-900/30 text-blue-200" : ""}`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon
                      className={`w-5 h-5 shrink-0 ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-400/20 text-blue-300">
                        {item.badge}
                      </span>
                    )}

                    {item.count !== undefined && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${item.countColor}`}>
                        {item.count}
                      </span>
                    )}

                    {item.hasSub && (
                      <ChevronRight
                        className={`w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-transform ${
                          isActive ? "text-white" : ""
                        }`}
                      />
                    )}
                  </div>
                </button>
              );
            })}

            {/* Logout Action in list */}
            <div className="pt-3 mt-3 border-t border-[#0A2750]">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-all duration-150"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Profile Pill (inspired by reference image) */}
        <div className="p-4 border-t border-[#0A2750] bg-[#05162F]/70">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#09254A]/80 border border-[#0D3160]">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-inner">
                {userRole === "admin" ? "AD" : studentProfile?.name ? studentProfile.name.charAt(0) : "ST"}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#09254A] rounded-full" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate leading-tight">
                {userRole === "admin" ? "Super Admin" : studentProfile?.name || "Student User"}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {userRole === "admin" ? "Super Administrator" : studentProfile?.rollNumber || "Enrolled Student"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
