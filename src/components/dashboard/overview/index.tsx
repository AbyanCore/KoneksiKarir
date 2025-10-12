"use client";

import { useState, useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/components/trpc/trpc-client";
import DashboardHeader from "./DashboardHeader";
import ControlsToolbar from "./ControlsToolbar";
import MetricsCards from "./MetricsCards";
import RecentApplicationsTable from "./RecentApplicationsTable";
import StatusChart from "./StatusChart";
import EducationChart from "./EducationChart";
import JobTrendChart from "./JobTrendChart";

export default function DashboardOverview() {
  const [viewMode, setViewMode] = useState<"event" | "lifetime">("event");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch overview stats
  const { data: overviewData, isLoading: overviewLoading } =
    trpc.dashboard.getOverviewStats.useQuery({
      eventId:
        viewMode === "event" && selectedEventId ? selectedEventId : undefined,
    });

  // Fetch recent applications
  const { data: recentApplications = [] } =
    trpc.dashboard.getRecentApplications.useQuery({
      eventId:
        viewMode === "event" && selectedEventId ? selectedEventId : undefined,
      limit: 100,
    });

  // Fetch status breakdown
  const { data: statusData = [] } = trpc.dashboard.getStatusBreakdown.useQuery({
    eventId:
      viewMode === "event" && selectedEventId ? selectedEventId : undefined,
  });

  // Fetch top jobs
  const { data: topJobs = [] } = trpc.dashboard.getTopJobs.useQuery({
    eventId:
      viewMode === "event" && selectedEventId ? selectedEventId : undefined,
    limit: 10,
  });

  // Fetch education demographics
  const { data: educationData = [] } =
    trpc.dashboard.getEducationDemographics.useQuery({
      eventId:
        viewMode === "event" && selectedEventId ? selectedEventId : undefined,
    });

  // Set default event ID when events are loaded
  useMemo(() => {
    if (
      overviewData?.events &&
      overviewData.events.length > 0 &&
      viewMode === "event" &&
      !selectedEventId
    ) {
      setSelectedEventId(overviewData.events[0].id);
    }
  }, [overviewData, viewMode, selectedEventId]);

  // Compute totals
  const totals = useMemo(() => {
    if (!overviewData) {
      return {
        companies: 0,
        jobs: 0,
        applications: 0,
        users: 0,
      };
    }

    return {
      companies: overviewData.companies.length,
      jobs: overviewData.jobs.length,
      applications: overviewData.applications.length,
      users: overviewData.users.length,
    };
  }, [overviewData]);

  // Get selected event details
  const selectedEvent = useMemo(() => {
    if (!overviewData || !selectedEventId) return null;
    return overviewData.events.find((e) => e.id === selectedEventId) || null;
  }, [overviewData, selectedEventId]);

  // Handle view mode change
  const handleViewModeChange = (
    mode: "event" | "lifetime",
    eventId?: number
  ) => {
    setViewMode(mode);
    if (mode === "lifetime") {
      setSelectedEventId(null);
    } else if (eventId) {
      setSelectedEventId(eventId);
    }
  };

  // Handle download report
  const handleDownloadReport = () => {
    console.log("Download report clicked - not implemented yet");
  };

  if (overviewLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <DashboardHeader viewMode={viewMode} selectedEvent={selectedEvent} />

        <ControlsToolbar
          viewMode={viewMode}
          selectedEventId={selectedEventId}
          events={overviewData?.events || []}
          onViewModeChange={handleViewModeChange}
          onDownloadReport={handleDownloadReport}
        />

        <MetricsCards
          totalCompanies={totals.companies}
          totalJobs={totals.jobs}
          totalApplications={totals.applications}
          totalUsers={totals.users}
        />

        <Separator />

        <RecentApplicationsTable
          applications={recentApplications}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Charts: two rows for better spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatusChart data={statusData} />
          <EducationChart data={educationData} />
        </div>

        {/* Job Trend Chart - Full Width */}
        <div className="mt-4">
          <JobTrendChart data={topJobs} />
        </div>
      </div>
    </div>
  );
}
