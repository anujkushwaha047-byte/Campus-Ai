import React from "react";
import { Priority, ComplaintStatus } from "../types";
import { AlertCircle, AlertTriangle, CheckCircle2, Clock, HelpCircle, XCircle } from "lucide-react";

interface PriorityBadgeProps {
  priority: Priority;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  size = "sm",
  showIcon = false,
}) => {
  const styles: Record<Priority, { bg: string; text: string; border: string; icon: any }> = {
    Critical: {
      bg: "bg-red-50 text-red-700",
      text: "text-red-700",
      border: "border-red-200",
      icon: AlertCircle,
    },
    High: {
      bg: "bg-orange-50 text-orange-700",
      text: "text-orange-700",
      border: "border-orange-200",
      icon: AlertTriangle,
    },
    Medium: {
      bg: "bg-amber-50 text-amber-700",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: Clock,
    },
    Low: {
      bg: "bg-emerald-50 text-emerald-700",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: CheckCircle2,
    },
  };

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs font-semibold rounded-md",
    md: "px-3 py-1 text-xs font-semibold rounded-lg",
    lg: "px-3.5 py-1.5 text-sm font-semibold rounded-lg",
  };

  const config = styles[priority] || styles.Medium;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 border ${config.bg} ${config.border} ${sizeClasses[size]} tracking-tight whitespace-nowrap`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      {priority}
    </span>
  );
};

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: "sm" | "md" | "lg";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = "sm",
}) => {
  const styles: Record<ComplaintStatus, { bg: string; text: string; border: string; dot: string }> = {
    Pending: {
      bg: "bg-amber-50 text-amber-800",
      text: "text-amber-800",
      border: "border-amber-200",
      dot: "bg-amber-500",
    },
    "Under Review": {
      bg: "bg-blue-50 text-blue-800",
      text: "text-blue-800",
      border: "border-blue-200",
      dot: "bg-blue-500",
    },
    "In Progress": {
      bg: "bg-purple-50 text-purple-800",
      text: "text-purple-800",
      border: "border-purple-200",
      dot: "bg-purple-500",
    },
    Resolved: {
      bg: "bg-emerald-50 text-emerald-800",
      text: "text-emerald-800",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
    Rejected: {
      bg: "bg-rose-50 text-rose-800",
      text: "text-rose-800",
      border: "border-rose-200",
      dot: "bg-rose-500",
    },
  };

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs font-semibold rounded-md",
    md: "px-3 py-1 text-xs font-semibold rounded-lg",
    lg: "px-3.5 py-1.5 text-sm font-semibold rounded-lg",
  };

  const config = styles[status] || styles.Pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 border ${config.bg} ${config.border} ${sizeClasses[size]} tracking-tight whitespace-nowrap`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
      {status}
    </span>
  );
};
