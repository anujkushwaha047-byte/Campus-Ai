import React, { useState } from "react";
import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  User,
  Shield,
  GraduationCap,
  Sparkles,
  Check,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X
} from "lucide-react";
import { NotificationItem, StudentProfile } from "../types";

interface HeaderProps {
  title: string;
  userRole: "admin" | "student";
  studentProfile: StudentProfile | null;
  notifications: NotificationItem[];
  onToggleMobileMenu: () => void;
  onSwitchRole: (role: "admin" | "student") => void;
  onNotificationClick: (notif: NotificationItem) => void;
  onMarkAllNotificationsRead: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  userRole,
  studentProfile,
  notifications,
  onToggleMobileMenu,
  onSwitchRole,
  onNotificationClick,
  onMarkAllNotificationsRead,
  searchQuery,
  onSearchChange,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 h-16 sm:h-20 bg-white border-b border-[#E5EAF1] px-3 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
      {/* Left section: Hamburger + Page Title */}
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        <button
          id="btn-sidebar-toggle"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-slate-900 tracking-tight truncate">
            {title}
          </h1>

          {/* Quick Role Badge */}
          <span
            className={`hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-xs font-semibold shrink-0 ${
              userRole === "admin"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {userRole === "admin" ? (
              <Shield className="w-3.5 h-3.5" />
            ) : (
              <GraduationCap className="w-3.5 h-3.5" />
            )}
            <span>{userRole === "admin" ? "Admin Portal" : "Student Portal"}</span>
          </span>
        </div>
      </div>

      {/* Right section: Search + Portal Switcher + Notifications + Profile */}
      <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4 shrink-0">
        {/* Mobile Search Toggle Button */}
        <button
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Desktop / Tablet Search Bar */}
        <div className="relative hidden md:block w-40 lg:w-60 xl:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search complaints, IDs..."
            className="w-full pl-9 pr-7 py-2 text-xs sm:text-sm bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#146EF5] focus:ring-1 focus:ring-[#146EF5] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Portal Switcher Button */}
        <button
          id="btn-switch-portal"
          onClick={() => onSwitchRole(userRole === "admin" ? "student" : "admin")}
          className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
          title="Switch view between Student and Admin"
        >
          {userRole === "admin" ? (
            <>
              <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="hidden sm:inline">Student View</span>
              <span className="sm:hidden text-[11px]">Student</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="hidden sm:inline">Admin View</span>
              <span className="sm:hidden text-[11px]">Admin</span>
            </>
          )}
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            id="btn-notifications-bell"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 sm:p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-4 h-4 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="fixed sm:absolute right-3 sm:right-0 top-18 sm:top-full mt-2 w-[calc(100vw-24px)] sm:w-88 md:w-96 max-w-sm bg-white rounded-2xl border border-[#E5EAF1] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-3.5 sm:p-4 border-b border-[#E5EAF1] flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={onMarkAllNotificationsRead}
                      className="text-xs text-[#146EF5] font-semibold hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="sm:hidden p-1 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const iconMap = {
                      critical: <AlertTriangle className="w-4 h-4 text-rose-500" />,
                      ai: <Sparkles className="w-4 h-4 text-blue-500" />,
                      resolved: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
                      status: <Clock className="w-4 h-4 text-amber-500" />,
                      comment: <User className="w-4 h-4 text-indigo-500" />,
                      assignment: <Shield className="w-4 h-4 text-purple-500" />,
                    };

                    return (
                      <div
                        key={notif.id}
                        onClick={() => {
                          onNotificationClick(notif);
                          setShowNotifications(false);
                        }}
                        className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 cursor-pointer transition-colors ${
                          !notif.read ? "bg-blue-50/40" : ""
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-white border border-slate-200/60 shadow-2xs shrink-0 mt-0.5">
                          {iconMap[notif.type] || <Bell className="w-4 h-4 text-slate-500" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${!notif.read ? "text-slate-900" : "text-slate-700"}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-[#146EF5] shrink-0 mt-1.5" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            id="btn-header-profile-menu"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1.5 sm:gap-2.5 p-1 sm:px-2 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-slate-800 to-blue-900 text-white font-bold text-xs flex items-center justify-center shadow-xs border border-slate-200 shrink-0">
              {userRole === "admin" ? "AD" : studentProfile?.name?.charAt(0) || "ST"}
            </div>

            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {userRole === "admin" ? "Admin" : studentProfile?.name || "Student"}
              </span>
              <span className="text-[11px] text-slate-500 leading-none">
                {userRole === "admin" ? "Super Administrator" : studentProfile?.rollNumber || "Student User"}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#E5EAF1] shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2">
              <div className="p-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {userRole === "admin" ? "Super Administrator" : studentProfile?.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {userRole === "admin" ? "admin@campus.edu" : studentProfile?.email}
                </p>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    onSwitchRole(userRole === "admin" ? "student" : "admin");
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                >
                  <Shield className="w-3.5 h-3.5 text-[#146EF5]" />
                  Switch to {userRole === "admin" ? "Student Portal" : "Admin Portal"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Overlay Bar */}
      {showMobileSearch && (
        <div className="md:hidden absolute inset-x-0 top-0 h-16 bg-white border-b border-[#E5EAF1] px-4 flex items-center gap-3 z-40 animate-in slide-in-from-top-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search complaints, roll numbers, categories..."
            className="flex-1 text-xs sm:text-sm bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
          />
          <button
            onClick={() => {
              onSearchChange("");
              setShowMobileSearch(false);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </header>
  );
};
