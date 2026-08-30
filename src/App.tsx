import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
import { ResolveConfirmationModal } from "./components/ResolveConfirmationModal";
import { StudentsManagementView } from "./pages/StudentsManagementView";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { getStoredAuth, saveStoredAuth, clearStoredAuth, isAuthenticated, getAuthHeaders } from "./utils/auth";
import { CheckCircle2, AlertCircle, Info, Sparkles } from "lucide-react";

// Default Initial Analytics Data (Matches Reference Dashboard Metrics)
const initialAnalytics: AnalyticsData = {
  totalComplaints: 245,
  pendingComplaints: 28,
  resolvedComplaints: 197,
  criticalComplaints: 20,
  priorityDistribution: [
    { name: "Critical", value: 37, percentage: 15, color: "#EF4444" },
    { name: "High", value: 73, percentage: 30, color: "#F59E0B" },
    { name: "Medium", value: 86, percentage: 35, color: "#EAB308" },
    { name: "Low", value: 49, percentage: 20, color: "#10B981" },
  ],
  categoryDistribution: [
    { name: "Hostel", value: 86, percentage: 35, color: "#146EF5" },
    { name: "Faculty", value: 49, percentage: 20, color: "#10B981" },
    { name: "Library", value: 37, percentage: 15, color: "#8B5CF6" },
    { name: "Examination", value: 29, percentage: 12, color: "#EC4899" },
    { name: "IT", value: 24, percentage: 10, color: "#06B6D4" },
    { name: "Other", value: 20, percentage: 8, color: "#F43F5E" },
  ],
  resolutionTrends: [
    { date: "1 May", resolved: 16, target: 20 },
    { date: "6 May", resolved: 30, target: 35 },
    { date: "11 May", resolved: 48, target: 50 },
    { date: "16 May", resolved: 67, target: 70 },
    { date: "21 May", resolved: 85, target: 85 },
    { date: "26 May", resolved: 98, target: 100 },
    { date: "31 May", resolved: 112, target: 115 },
  ],
  aiInsights: [
    {
      id: "ai-1",
      type: "critical",
      iconType: "alert",
      text: "6 critical complaints require immediate attention.",
    },
    {
      id: "ai-2",
      type: "increase",
      iconType: "trend_up",
      text: "Hostel complaints increased by 18% this week.",
    },
    {
      id: "ai-3",
      type: "resolution",
      iconType: "clock",
      text: "Average resolution time is 2.4 days.",
    },
    {
      id: "ai-4",
      type: "decrease",
      iconType: "trend_down",
      text: "Library complaints decreased by 10% compared to last month.",
    },
  ],
};

interface DashboardAppProps {
  studentProfile: StudentProfile | null;
  onLogout: () => void;
  onUpdateStudentProfile: (student: StudentProfile) => void;
}

function DashboardApp({ studentProfile, onLogout, onUpdateStudentProfile }: DashboardAppProps) {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<"admin" | "student">("student");
  const [currentTab, setCurrentTab] = useState("student_dashboard");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>(initialAnalytics);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolvingComplaint, setResolvingComplaint] = useState<Complaint | null>(null);
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
    try {
      const res = await fetch("/api/complaints", {
        headers: getAuthHeaders(userRole),
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setComplaints(data);
      } else if (data && Array.isArray(data.complaints)) {
        setComplaints(data.complaints);
      }
    } catch (err) {
      console.warn("Using local complaints cache");
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics", {
        headers: getAuthHeaders(userRole),
      });
      const data = await res.json();
      if (data && data.totalComplaints) {
        setAnalytics(data);
      }
    } catch (err) {
      console.warn("Using local analytics cache");
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications", {
        headers: getAuthHeaders(userRole),
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setNotifications(data);
      } else if (data && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.warn("Using local notifications cache");
    }
  };

  useEffect(() => {
    fetchComplaints();
    fetchAnalytics();
    fetchNotifications();
  }, [userRole]);

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

  const handlePerformLogout = () => {
    onLogout();
    navigate("/login", { replace: true });
    showToast("Logged out successfully.", "info");
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
      const res = await fetch(`/api/complaints/${selectedComplaint.id}`, {
        method: "PATCH",
        headers: getAuthHeaders(userRole),
        body: JSON.stringify(updates),
      });
      const data = await res.json();

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

  const handleResolveComplaint = async (complaintId: string, resolutionNote?: string) => {
    try {
      const res = await fetch(`/api/complaints/${complaintId}/resolve`, {
        method: "PATCH",
        headers: getAuthHeaders("admin"),
        body: JSON.stringify({
          role: "admin",
          author: "Super Administrator",
          resolutionNote,
        }),
      });

      const data = await res.json();
      if (data.success && data.complaint) {
        setComplaints((prev) =>
          prev.map((c) => (c.id === data.complaint.id ? data.complaint : c))
        );
        if (selectedComplaint && selectedComplaint.id === data.complaint.id) {
          setSelectedComplaint(data.complaint);
        }
        fetchAnalytics();
        fetchNotifications();
        showToast(`Complaint #${data.complaint.id} marked as resolved.`, "success");
      } else {
        throw new Error(data.error || "Failed to mark complaint as resolved.");
      }
    } catch (err: any) {
      console.error("Resolve error:", err);
      showToast(err.message || "Failed to resolve complaint.", "error");
      throw err;
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
  const criticalCount = complaints.filter(
    (c) => c.priority === "Critical" && c.status !== "Resolved" && c.status !== "Rejected"
  ).length;
  const pendingCount = complaints.filter(
    (c) => c.status === "Pending" || c.status === "Under Review"
  ).length;

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
        onLogout={handlePerformLogout}
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
              onResolveComplaint={(c) => setResolvingComplaint(c)}
              onNavigateToTab={setCurrentTab}
              onOpenSubmitModal={() => setIsSubmitModalOpen(true)}
            />
          )}

          {/* ADMIN VIEW 2: ALL COMPLAINTS DIRECTORY */}
          {userRole === "admin" && currentTab === "all_complaints" && (
            <ComplaintsListView
              complaints={complaints}
              onViewComplaint={(c) => setSelectedComplaint(c)}
              onResolveComplaint={(c) => setResolvingComplaint(c)}
              userRole={userRole}
              title="All Campus Complaints Directory"
            />
          )}

          {/* ADMIN VIEW 3: CRITICAL COMPLAINTS */}
          {userRole === "admin" && currentTab === "critical" && (
            <ComplaintsListView
              complaints={complaints}
              onViewComplaint={(c) => setSelectedComplaint(c)}
              onResolveComplaint={(c) => setResolvingComplaint(c)}
              userRole={userRole}
              title="Critical Priority Complaints (Immediate Attention)"
              initialFilter={{ priority: "Critical" }}
            />
          )}

          {/* ADMIN VIEW 4: PENDING COMPLAINTS */}
          {userRole === "admin" && currentTab === "pending" && (
            <ComplaintsListView
              complaints={complaints}
              onViewComplaint={(c) => setSelectedComplaint(c)}
              onResolveComplaint={(c) => setResolvingComplaint(c)}
              userRole={userRole}
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
                onResolveComplaint={(c) => setResolvingComplaint(c)}
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
              onLogout={handlePerformLogout}
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
                This administrative section is fully synchronized with the Campus-Ai live engine. All complaint and AI analytics data are active in the primary dashboard.
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
        onResolveClick={(c) => setResolvingComplaint(c)}
      />

      {/* Admin Complaint Resolve Confirmation Modal */}
      <ResolveConfirmationModal
        isOpen={!!resolvingComplaint}
        complaint={resolvingComplaint}
        onClose={() => setResolvingComplaint(null)}
        onConfirmResolve={handleResolveComplaint}
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
          onUpdateStudentProfile(student);
          showToast(`Logged in as ${student.name} (${student.rollNumber})`);
        }}
      />
    </div>
  );
}

export default function App() {
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(() => {
    const session = getStoredAuth();
    return session ? session.student : null;
  });

  // Keep state in sync with localStorage across tabs or updates
  useEffect(() => {
    const handleStorageChange = () => {
      const session = getStoredAuth();
      setStudentProfile(session ? session.student : null);
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLoginSuccess = (student: StudentProfile) => {
    setStudentProfile(student);
  };

  const handleLogout = () => {
    clearStoredAuth();
    setStudentProfile(null);
  };

  const isUserAuth = Boolean(studentProfile && isAuthenticated());

  return (
    <BrowserRouter>
      <Routes>
        {/* 1 & 2 & 3. Login Route: Show LoginPage when unauthenticated, redirect to /dashboard when authenticated */}
        <Route
          path="/login"
          element={
            isUserAuth ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* 4 & 5. Dashboard Route: Protected by ProtectedRoute */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardApp
                studentProfile={studentProfile}
                onLogout={handleLogout}
                onUpdateStudentProfile={handleLoginSuccess}
              />
            </ProtectedRoute>
          }
        />

        {/* 1. Root route: Unconditionally redirect "/" to "/login" */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Wildcard catch-all: redirect any unknown URL to "/login" */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
