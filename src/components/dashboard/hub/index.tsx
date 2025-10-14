"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/components/trpc/trpc-client";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "sonner";
import HubHeader from "./HubHeader";
import EventMinimap from "./EventMinimap";
import CompaniesHeader from "./CompaniesHeader";
import CompanyList from "./CompanyList";
import JobDetailSheet from "./JobDetailSheet";

export default function HubPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [expandedCompanyId, setExpandedCompanyId] = useState<number | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [isJobDetailOpen, setIsJobDetailOpen] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast.error("Please sign in to access the hub");
      router.push("/auth/signin");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Check profile completion for job seekers
  const { data: profileStatus, isLoading: isCheckingProfile } =
    trpc.profile.checkMyProfileComplete.useQuery(undefined, {
      enabled: isAuthenticated && user?.role === "JOB_SEEKER",
      retry: false,
    });

  // Check company profile completion for company admins
  const { data: companyProfileStatus, isLoading: isCheckingCompanyProfile } =
    trpc.companies.checkMyCompanyProfileComplete.useQuery(undefined, {
      enabled: isAuthenticated && user?.role === "ADMIN_COMPANY",
      retry: false,
    });

  // Redirect to profile if incomplete (job seekers)
  useEffect(() => {
    if (
      user?.role === "JOB_SEEKER" &&
      profileStatus &&
      !profileStatus.isComplete
    ) {
      toast.info("Please complete your profile before browsing jobs", {
        duration: 5000,
      });
      router.push("/s/profile");
    }
  }, [profileStatus, user, router]);

  // Redirect to company profile if incomplete (company admins)
  useEffect(() => {
    if (
      user?.role === "ADMIN_COMPANY" &&
      companyProfileStatus &&
      !companyProfileStatus.isComplete
    ) {
      toast.info("Please complete your company profile first", {
        duration: 5000,
      });
      router.push("/s/company/profile");
    }
  }, [companyProfileStatus, user, router]);

  // Fetch all events
  const { data: events = [], isLoading: isLoadingEvents } =
    trpc.events.findAll.useQuery();

  // Select first event by default
  const currentEvent = useMemo(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
      return events[0];
    }
    return events.find((e) => e.id === selectedEventId) || null;
  }, [events, selectedEventId]);

  // Fetch companies with jobs for selected event
  const { data: companiesData = [], isLoading: isLoadingCompanies } =
    trpc.jobs.findByEventGroupedByCompany.useQuery(
      { eventId: selectedEventId! },
      { enabled: !!selectedEventId }
    );

  // Fetch application count for current event (only for job seekers)
  const { data: applicationCount } =
    trpc.applications.countMyApplicationsByEvent.useQuery(
      { eventId: selectedEventId! },
      {
        enabled:
          !!selectedEventId && isAuthenticated && user?.role === "JOB_SEEKER",
      }
    );

  // Fetch selected job details
  const { data: selectedJob, isLoading: isLoadingJob } =
    trpc.jobs.findById.useQuery(
      { id: selectedJobId! },
      { enabled: !!selectedJobId }
    );

  // Check if user has applied to selected job (only for job seekers)
  const { data: applicationStatus } =
    trpc.applications.checkMyApplication.useQuery(
      { jobId: selectedJobId! },
      {
        enabled:
          !!selectedJobId && isAuthenticated && user?.role === "JOB_SEEKER",
      }
    );

  // Create application mutation
  const createApplication = trpc.applications.create.useMutation({
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      setIsJobDetailOpen(false);
      // Invalidate queries to refresh data
      trpc.useContext().applications.countMyApplicationsByEvent.invalidate();
      trpc.useContext().applications.checkMyApplication.invalidate();
      trpc.useContext().jobs.findByEventGroupedByCompany.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit application");
    },
  });

  // Filter companies by search query
  const filteredCompanies = useMemo(() => {
    if (!searchQuery.trim()) {
      return companiesData;
    }

    const query = searchQuery.toLowerCase();
    return companiesData
      .map((company) => {
        // Filter jobs that match the search
        const matchingJobs = company.jobs.filter(
          (job) =>
            job.title.toLowerCase().includes(query) ||
            job.tags.some((tag) => tag.toLowerCase().includes(query))
        );

        // Check if company name or stand matches
        const companyMatches =
          company.name.toLowerCase().includes(query) ||
          company.standNumber?.toLowerCase().includes(query);

        // If company matches, return all jobs; otherwise return matching jobs
        if (companyMatches) {
          return company;
        } else if (matchingJobs.length > 0) {
          return {
            ...company,
            jobs: matchingJobs,
            jobCount: matchingJobs.length,
          };
        }
        return null;
      })
      .filter((company) => company !== null);
  }, [companiesData, searchQuery]);

  // Auto-expand companies that have matching search results
  useMemo(() => {
    if (searchQuery.trim() && filteredCompanies.length > 0) {
      // Expand first matching company
      setExpandedCompanyId(filteredCompanies[0].id);
    }
  }, [searchQuery, filteredCompanies]);

  // Calculate totals
  const totalCompanies = companiesData.length;
  const totalJobs = companiesData.reduce(
    (sum, company) => sum + company.jobCount,
    0
  );
  const resultsCount = filteredCompanies.length;

  // Handlers
  const handleEventChange = (eventId: number) => {
    setSelectedEventId(eventId);
    setSearchQuery("");
    setExpandedCompanyId(null);
  };

  const handleToggleExpand = (companyId: number) => {
    setExpandedCompanyId(expandedCompanyId === companyId ? null : companyId);
  };

  const handleViewJobDetail = (jobId: number) => {
    setSelectedJobId(jobId);
    setIsJobDetailOpen(true);
  };

  const handleApply = () => {
    if (!selectedJobId) return;

    createApplication.mutate({
      jobId: selectedJobId,
    });
  };

  // Loading state (including auth and profile check)
  if (
    isAuthLoading ||
    isLoadingEvents ||
    (user?.role === "JOB_SEEKER" && isCheckingProfile) ||
    (user?.role === "ADMIN_COMPANY" && isCheckingCompanyProfile)
  ) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-slate-200 rounded-lg" />
          <div className="h-64 bg-slate-200 rounded-lg" />
          <div className="h-96 bg-slate-200 rounded-lg" />
        </div>
      </div>
    );
  }

  // Prevent rendering if not authenticated
  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  // Prevent rendering if profile is incomplete (job seekers)
  if (
    user?.role === "JOB_SEEKER" &&
    profileStatus &&
    !profileStatus.isComplete
  ) {
    return null; // Will redirect to profile page via useEffect
  }

  // Prevent rendering if company profile is incomplete (company admins)
  if (
    user?.role === "ADMIN_COMPANY" &&
    companyProfileStatus &&
    !companyProfileStatus.isComplete
  ) {
    return null; // Will redirect to company profile page via useEffect
  }

  // No events state
  if (!currentEvent) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-700 mb-2">
            No Events Available
          </h2>
          <p className="text-slate-500">
            There are currently no events scheduled. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <HubHeader
        currentEvent={currentEvent}
        events={events}
        onEventChange={handleEventChange}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Companies Header */}
          <CompaniesHeader
            totalCompanies={totalCompanies}
            totalJobs={totalJobs}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            resultsCount={resultsCount}
          />

          {/* Companies List */}
          {isLoadingCompanies ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 bg-slate-200 animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : (
            <CompanyList
              companies={filteredCompanies}
              expandedCompanyId={expandedCompanyId}
              onToggleExpand={handleToggleExpand}
              onViewJobDetail={handleViewJobDetail}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Minimap */}
          {currentEvent.minimapUrl && (
            <EventMinimap
              minimapUrl={currentEvent.minimapUrl}
              title={currentEvent.title}
            />
          )}

          {/* Application Stats */}
          {applicationCount && (
            <div className="bg-white rounded-lg shadow-sm p-4 border border-slate-200">
              <h3 className="font-semibold mb-3">Application Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">
                    Applications submitted:
                  </span>
                  <span className="font-semibold">
                    {applicationCount.count}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Remaining slots:</span>
                  <span
                    className={`font-semibold ${
                      applicationCount.remaining === 0
                        ? "text-red-600"
                        : "text-green-600"
                    }`}
                  >
                    {applicationCount.remaining}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${(applicationCount.count / 5) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 text-center pt-1">
                  Maximum 5 applications per event
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Job Detail Sheet */}
      <JobDetailSheet
        open={isJobDetailOpen}
        onOpenChange={setIsJobDetailOpen}
        job={selectedJob || null}
        hasApplied={applicationStatus?.hasApplied || false}
        isApplying={createApplication.isPending}
        onApply={handleApply}
        remainingApplications={applicationCount?.remaining || 0}
      />
    </div>
  );
}
