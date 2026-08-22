import React, { useState, useEffect } from "react";
import {
  Complaint,
  AnalyticsData,
  NotificationItem,
  StudentProfile,
  Category,
  Priority,
  ComplaintStatus
} from "./types";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { AdminDashboardView } from "./pages/AdminDashboardView";
import { StudentDashboardView } from "./pages/StudentDashboardView";
import { ComplaintsListView } from "./pages/ComplaintsListView";
import { AIReportsView } from "./pages/AIReportsView";
import { CategoriesView } from "./pages/CategoriesView";
import { HelpSupportView } from "./pages/HelpSupportView";
import { StudentProfileView } from "./pages/StudentProfileView";
import { ComplaintDetailsModal } from "./components/ComplaintDetailsModal";
import { SubmitComplaintModal } from "./components/SubmitComplaintModal";
import { StudentAuthModal } from "./components/StudentAuthModal";
import { StudentsManagementView } from "./pages/StudentsManagementView";
import { CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";
import { apiRequest, hasAuthToken } from "./api";

// Default Initial Analytics Data (Matches Reference Dashboard Metrics)
const initialAnalytics: AnalyticsData = {
  totalComplaints: 0,
  pendingComplaints: 0,
  resolvedComplaints: 0,
  criticalComplaints: 0,
  priorityDistribution: [],
  categoryDistribution: [],
  resolutionTrends: [],
  aiInsights: [],
};

export default function App() {
  const [userRole, setUserRole] = useState<"admin" | "student">("admin");
  const [currentTab, setCurrentTab] = useState("dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>({
    id: "STU-1001",
    rollNumber: "2022CSB1044",
    name: "Rahul Sharma",
    email: "rahul.sharma@campus.edu",
    phone: "9876543210",
    department: "Computer Science & Engineering",
    year: "3rd Year",
    course: "BTECH_CSE",
    emailVerified: true,
    isVerified: true,
  });

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>(initialAnalytics);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Toast Notification state
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "info" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch initial data from server
  const fetchComplaints = async () => {
    if (!hasAuthToken()) return;
    try {
      const data = await apiRequest<{ complaints?: Complaint[] }>("/api/complaints");
      if (Array.isArray(data.complaints)) {
        setComplaints(data.complaints);
      }
    } catch (err) {
      console.warn("Using local complaints cache");
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await apiRequest<AnalyticsData>("/api/analytics");
      if (data && data.totalComplaints) {
        setAnalytics(data);
      }
    } catch (err) {
      console.warn("Using local analytics cache");
    }
  };

  const fetchNotifications = async () => {
    try {
      const data = await apiRequest<{ notifications?: NotificationItem[] }>("/api/notifications");
      if (Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.warn("Using local notifications cache");
    }
  };

  useEffect(() => {
    if (hasAuthToken()) {
      fetchComplaints();
      fetchAnalytics();
      fetchNotifications();
    }
  }, []);

  // Sync tab when switching roles
  const handleSwitchRole = (role: "admin" | "student") => {
    setUserRole(role);
    if (role === "student") {
      setCurrentTab("student_dashboard");
      showToast("Switched to Student Portal View", "info");
    } else {
      setCurrentTab("dashboard");
      showToast("Switched to Super Admin Portal View", "info");
    }
  };

  const handleSelectTab = (tab: string) => {
    if (tab === "submit_complaint") {
      setIsSubmitModalOpen(true);
      return;
    }
    setCurrentTab(tab);
  };

  const handleLogout = () => {
    if (userRole === "student") {
      setIsAuthModalOpen(true);
    } else {
      handleSwitchRole("student");
    }
  };

  // Update a complaint (status, comment, officer, priority)
  const handleUpdateComplaint = async (
    updates: Partial<Complaint> & {
      newComment?: string;
      author?: string;
      role?: "admin" | "student" | "officer";
      overrideNote?: string;
    }
  ) => {
    if (!selectedComplaint) return;

    try {
      const data = await apiRequest<{ success?: boolean; complaint?: Complaint }>(`/api/complaints/${selectedComplaint.id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });

      if (data.success && data.complaint) {
        setSelectedComplaint(data.complaint);
        setComplaints((prev) =>
          prev.map((c) => (c.id === data.complaint.id ? data.complaint : c))
        );
        fetchAnalytics();
        fetchNotifications();
        showToast(`Complaint ${selectedComplaint.id} updated successfully!`);
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to update complaint.", "error");
    }
  };

  const handleNewComplaintSuccess = (newComplaint: Complaint) => {
    setComplaints((prev) => [newComplaint, ...prev]);
    fetchAnalytics();
    fetchNotifications();
    showToast(`Complaint ${newComplaint.id} registered with AI priority: ${newComplaint.priority}`);
  };

  const handleNotificationClick = (notif: NotificationItem) => {
    if (notif.complaintId) {
      const target = complaints.find((c) => c.id === notif.complaintId);
      if (target) {
        setSelectedComplaint(target);
      }
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast("All notifications marked as read.");
  };

  // Calculate current dynamic counts
  const criticalCount = complaints.filter((c) => c.priority === "Critical" && c.status !== "Resolved" && c.status !== "Rejected").length;
  const pendingCount = complaints.filter((c) => c.status === "Pending" || c.status === "Under Review").length;

  // Title calculation
  const getHeaderTitle = () => {
    switch (currentTab) {
      case "dashboard":
        return "Dashboard";
      case "all_complaints":
        return "Complaints Directory";
      case "critical":
        return "Critical Complaints (Immediate SLA)";
      case "pending":
        return "Pending Complaints";
      case "ai_reports":
        return "AI Reports & Triage Intelligence";
      case "analytics":
        return "Campus Resolution Analytics";
      case "categories":
        return "Department Redressal Categories";
      case "student_dashboard":
        return "Student Grievance Dashboard";
      case "my_complaints":
      case "track_status":
        return "My Grievances & Live Status";
      case "help_support":
        return "Help & Escalation Center";
      case "profile":
        return "Student Academic Profile";
      case "reports":
        return "Administrative Audit Reports";
      case "settings":
        return "System & AI Configuration";
      case "students":
        return "Enrolled Student Directory";
      default:
        return "Dashboard";
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] text-slate-900 flex font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Floating Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-4 fade-in duration-200">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs sm:text-sm font-semibold ${
              toast.type === "success"
                ? "bg-slate-900 text-white border-slate-700"
                : toast.type === "error"
                ? "bg-rose-600 text-white border-rose-700"
                : "bg-[#146EF5] text-white border-blue-600"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : toast.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-white shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-blue-200 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* 1. Left Dark Navy Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        userRole={userRole}
        studentProfile={studentProfile}
        onLogout={handleLogout}
        isOpenOnMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        criticalCount={criticalCount || 20}
        pendingCount={pendingCount || 28}
      />

      {/* 2. Main Body Container (Offset by sidebar on desktop) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Sticky Header */}
        <Header
          title={getHeaderTitle()}
          userRole={userRole}
          studentProfile={studentProfile}
          notifications={notifications}
          onToggleMobileMenu={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          onSwitchRole={handleSwitchRole}
          onNotificationClick={handleNotificationClick}
          onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dynamic Page Views */}
        <main className="p-4 sm:p-8 flex-1 overflow-y-auto max-w-[1600px] w-full mx-auto">
          {/* ADMIN VIEW 1: MAIN DASHBOARD */}
          {userRole === "admin" && currentTab === "dashboard" && (
            <AdminDashboardView
              analytics={analytics}
              complaints={complaints}
              onViewComplaint={(c) => setSelectedComplaint(c)}
              onNavigateToTab={setCurrentTab}
              onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
            />
          )}

          {/* ADMIN VIEW 2: ALL COMPLAINTS DIRECTORY */}
          {userRole === "admin" && currentTab === "all_complaints" && (
            <ComplaintsListView
              complaints={complaints}
              onViewComplaint={(c) => setSelectedComplaint(c)}
              title="All Campus Complaints Directory"
            />
          )}

          {/* ADMIN VIEW 3: CRITICAL COMPLAINTS */}
          {userRole === "admin" && currentTab === "critical" && (
            <ComplaintsListView
              complaints={complaints}
              onViewComplaint={(c) => setSelectedComplaint(c)}
              title="Critical Priority Complaints (Immediate Attention)"
              initialFilter={{ priority: "Critical" }}
            />
          )}

          {/* ADMIN VIEW 4: PENDING COMPLAINTS */}
          {userRole === "admin" && currentTab === "pending" && (
            <ComplaintsListView
              complaints={complaints}
              onViewComplaint={(c) => setSelectedComplaint(c)}
              title="Pending Redressal Queue"
              initialFilter={{ status: "Pending" }}
            />
          )}

          {/* ADMIN VIEW 5: AI REPORTS & INTEL */}
          {currentTab === "ai_reports" && (
            <AIReportsView analytics={analytics} complaints={complaints} />
          )}

          {/* ADMIN VIEW 6: ANALYTICS */}
          {currentTab === "analytics" && (
            <div className="space-y-6">
              <AdminDashboardView
                analytics={analytics}
                complaints={complaints}
                onViewComplaint={(c) => setSelectedComplaint(c)}
                onNavigateToTab={setCurrentTab}
                onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
              />
            </div>
          )}

          {/* ADMIN VIEW 7: CATEGORIES */}
          {currentTab === "categories" && (
            <CategoriesView
              complaints={complaints}
              onSelectCategoryFilter={(cat) => {
                setCurrentTab("all_complaints");
              }}
            />
          )}

          {/* STUDENT VIEW 1: STUDENT DASHBOARD */}
          {userRole === "student" && currentTab === "student_dashboard" && (
            <StudentDashboardView
              studentProfile={studentProfile}
              complaints={complaints}
              onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
              onViewComplaint={(c) => setSelectedComplaint(c)}
              onNavigateToTab={setCurrentTab}
            />
          )}

          {/* STUDENT VIEW 2: MY COMPLAINTS & TRACK STATUS */}
          {userRole === "student" && (currentTab === "my_complaints" || currentTab === "track_status") && (
            <ComplaintsListView
              complaints={complaints.filter(
                (c) =>
                  c.studentRoll === studentProfile?.rollNumber ||
                  c.studentEmail === studentProfile?.email
              )}
              onViewComplaint={(c) => setSelectedComplaint(c)}
              title="My Filed Grievances & Live Status"
            />
          )}

          {/* HELP & SUPPORT */}
          {currentTab === "help_support" && <HelpSupportView />}

          {/* STUDENT PROFILE */}
          {currentTab === "profile" && (
            <StudentProfileView
              studentProfile={studentProfile}
              complaints={complaints}
              onLogout={handleLogout}
              onCourseChange={(course) => setStudentProfile((profile) => profile ? { ...profile, course } : profile)}
            />
          )}

          {/* ADMIN VIEW 8: REGISTERED STUDENTS DIRECTORY (CSV STORAGE) */}
          {currentTab === "students" && (
            <StudentsManagementView
              allComplaints={complaints}
              onViewComplaint={(c) => setSelectedComplaint(c)}
            />
          )}

          {/* GENERAL FALLBACK / SETTINGS / REPORTS / NOTIFICATIONS VIEW */}
          {(currentTab === "settings" || currentTab === "reports" || currentTab === "notifications") && (
            <div className="bg-white rounded-2xl p-8 border border-[#E5EAF1] shadow-xs text-center space-y-4 max-w-xl mx-auto my-12">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#146EF5] flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                {currentTab.toUpperCase()} Module
              </h3>
              <p className="text-xs text-slate-500">
                This administrative section is fully synchronized with the CampusCare live engine. All complaint and AI analytics data are active in the primary dashboard.
              </p>
              <button
                onClick={() => setCurrentTab(userRole === "admin" ? "dashboard" : "student_dashboard")}
                className="px-5 py-2.5 bg-[#146EF5] text-white font-bold text-xs rounded-xl hover:bg-blue-600 cursor-pointer"
              >
                Return to Main Dashboard
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Complaint Details Modal */}
      <ComplaintDetailsModal
        complaint={selectedComplaint}
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        userRole={userRole}
        onUpdateComplaint={handleUpdateComplaint}
      />

      {/* Submit Complaint Wizard Modal */}
      <SubmitComplaintModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        studentProfile={studentProfile}
        onSubmitSuccess={handleNewComplaintSuccess}
        onOpenTrackView={(c) => {
          setSelectedComplaint(c);
          if (userRole === "student") {
            setCurrentTab("student_dashboard");
          }
        }}
      />

      {/* Student Authentication OTP Modal */}
      <StudentAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(student) => {
          setStudentProfile(student);
          setUserRole("student");
          setCurrentTab("student_dashboard");
          fetchComplaints();
          fetchNotifications();
          showToast(`Logged in as ${student.name} (${student.rollNumber})`);
        }}
      />
    </div>
  );
}
