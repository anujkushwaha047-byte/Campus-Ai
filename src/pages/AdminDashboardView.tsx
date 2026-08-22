import React from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  Download,
  Filter,
  Plus
} from "lucide-react";
import { Complaint, AnalyticsData } from "../types";
import { MetricCard } from "../components/MetricCard";
import { ResolutionProgressChart } from "../components/ResolutionProgressChart";
import { PriorityDonutChart } from "../components/PriorityDonutChart";
import { CategoryPieChart } from "../components/CategoryPieChart";
import { AIInsightsCard } from "../components/AIInsightsCard";
import { RecentComplaintsTable } from "../components/RecentComplaintsTable";

interface AdminDashboardViewProps {
  analytics: AnalyticsData;
  complaints: Complaint[];
  onViewComplaint: (complaint: Complaint) => void;
  onNavigateToTab: (tab: string) => void;
  onOpenSubmitModal: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  analytics,
  complaints,
  onViewComplaint,
  onNavigateToTab,
  onOpenSubmitModal,
}) => {
  const recentFiveComplaints = complaints.slice(0, 6);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. TOP METRIC CARDS (Matching Reference Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Complaints (Blue) */}
        <MetricCard
          id="metric-total-complaints"
          title="Total Complaints"
          value={analytics.totalComplaints}
          changePct={analytics.totalChangePct}
          comparisonText="from last month"
          icon={FileText}
          variant="blue"
          onClick={() => onNavigateToTab("all_complaints")}
        />

        {/* Card 2: Pending Complaints (Orange) */}
        <MetricCard
          id="metric-pending-complaints"
          title="Pending Complaints"
          value={analytics.pendingComplaints}
          changePct={analytics.pendingChangePct}
          comparisonText="from last month"
          icon={Clock}
          variant="orange"
          onClick={() => onNavigateToTab("pending")}
        />

        {/* Card 3: Resolved Complaints (Green) */}
        <MetricCard
          id="metric-resolved-complaints"
          title="Resolved Complaints"
          value={analytics.resolvedComplaints}
          changePct={analytics.resolvedChangePct}
          comparisonText="from last month"
          icon={CheckCircle2}
          variant="green"
          onClick={() => onNavigateToTab("all_complaints")}
        />

        {/* Card 4: Critical Complaints (Red) */}
        <MetricCard
          id="metric-critical-complaints"
          title="Critical Complaints"
          value={analytics.criticalComplaints}
          changePct={analytics.criticalChangePct}
          comparisonText="from last month"
          icon={AlertOctagon}
          variant="red"
          onClick={() => onNavigateToTab("critical")}
        />
      </div>

      {/* 2. MIDDLE ANALYTICS & INSIGHTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Resolution Progress Chart */}
        <div className="lg:col-span-12 xl:col-span-5">
          <ResolutionProgressChart
            data={analytics.resolutionTrends || (analytics as any).resolutionProgress}
          />
        </div>

        {/* AI Priority Donut Chart */}
        <div className="lg:col-span-6 xl:col-span-3">
          <PriorityDonutChart
            data={analytics.priorityDistribution}
            totalComplaints={analytics.totalComplaints}
          />
        </div>

        {/* AI Insights Card */}
        <div className="lg:col-span-6 xl:col-span-4">
          <AIInsightsCard
            insights={analytics.aiInsights}
            onViewDetailedReport={() => onNavigateToTab("ai_reports")}
          />
        </div>
      </div>

      {/* 3. RECENT COMPLAINTS TABLE & CATEGORY BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Complaints Table */}
        <div className="lg:col-span-12 xl:col-span-8">
          <RecentComplaintsTable
            complaints={recentFiveComplaints}
            onViewComplaint={onViewComplaint}
            onViewAll={() => onNavigateToTab("all_complaints")}
          />
        </div>

        {/* Category Breakdown */}
        <div className="lg:col-span-12 xl:col-span-4">
          <CategoryPieChart data={analytics.categoryDistribution} />
        </div>
      </div>
    </div>
  );
};
