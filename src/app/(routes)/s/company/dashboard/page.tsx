"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/components/trpc/trpc-client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ApplicationStats from "@/components/company/dashboard/ApplicationStats";
import JobsList from "@/components/company/dashboard/JobsList";
import EventsCards from "@/components/company/dashboard/EventsCards";
import JobApplicationsDrawer from "@/components/company/dashboard/JobApplicationsDrawer";
import CreateJobDialog from "@/components/company/dashboard/CreateJobDialog";
import JoinEventDialog from "@/components/company/dashboard/JoinEventDialog";
import { Building2, Briefcase, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function CompanyDashboardPage() {
  const router = useRouter();
  const [selectedJob, setSelectedJob] = useState<{
    id: number;
    title: string;
  } | null>(null);

  // Check company profile completion
  const { data: profileStatus, isLoading: isCheckingProfile } =
    trpc.companies.checkMyCompanyProfileComplete.useQuery();

  // Redirect to profile if incomplete
  useEffect(() => {
    if (profileStatus && !profileStatus.isComplete) {
      toast.info(
        profileStatus.message || "Please complete your company profile first",
        {
          duration: 5000,
        }
      );
      router.push("/s/company/profile");
    }
  }, [profileStatus, router]);

  // Fetch dashboard data
  const { data, isLoading } = trpc.companies.getMyCompanyDashboard.useQuery(
    undefined,
    {
      enabled: profileStatus?.isComplete || false,
    }
  );

  const handleViewApplications = (jobId: number, jobTitle: string) => {
    setSelectedJob({ id: jobId, title: jobTitle });
  };

  const handleCloseDrawer = () => {
    setSelectedJob(null);
  };

  // Show loading while checking profile
  if (isCheckingProfile) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if profile is incomplete (will redirect)
  if (profileStatus && !profileStatus.isComplete) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-8 text-center">
          <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Company dashboard not available</p>
          <p className="text-sm text-gray-400 mt-2">
            Please ensure your company profile is set up correctly
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            {data.company.name}
          </h1>
          <p className="text-gray-500 mt-1">Company Dashboard</p>
        </div>

        {/* Application Statistics */}
        <ApplicationStats
          totalApplications={data.totalApplications}
          stats={data.stats}
        />

        {/* Tabs for Jobs and Events */}
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="jobs" className="flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Jobs ({data.jobs.length})
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events ({data.events.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-4">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Your Job Postings</h2>
                {data.events.length > 0 ? (
                  <CreateJobDialog events={data.events} />
                ) : (
                  <div className="text-sm text-gray-500">
                    Join an event first to post jobs
                  </div>
                )}
              </div>
              <JobsList
                jobs={data.jobs}
                onViewApplications={handleViewApplications}
              />
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Participating Events</h2>
                <JoinEventDialog />
              </div>
              <EventsCards events={data.events} />
            </Card>
          </TabsContent>
        </Tabs>

        {/* Company Info Card */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Company Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {data.company.location && (
              <div>
                <p className="text-gray-500">Location</p>
                <p className="font-medium">{data.company.location}</p>
              </div>
            )}
            {data.company.website && (
              <div>
                <p className="text-gray-500">Website</p>
                <a
                  href={data.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:underline"
                >
                  {data.company.website}
                </a>
              </div>
            )}
            <div>
              <p className="text-gray-500">Company Code</p>
              <p className="font-medium font-mono">{data.company.code}</p>
            </div>
            {data.company.description && (
              <div className="md:col-span-2">
                <p className="text-gray-500 mb-1">Description</p>
                <p className="text-gray-700">{data.company.description}</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Job Applications Drawer */}
      <JobApplicationsDrawer
        jobId={selectedJob?.id || null}
        jobTitle={selectedJob?.title || ""}
        isOpen={!!selectedJob}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
