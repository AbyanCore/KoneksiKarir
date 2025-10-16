"use client";

import { useMemo } from "react";
import { trpc } from "@/components/trpc/trpc-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Briefcase, Clock, CheckCircle, XCircle } from "lucide-react";

export default function Page_ProfileActivity() {
  const { data: applications, isLoading } =
    trpc.users.getMyApplications.useQuery(undefined, {
      retry: false,
      refetchOnWindowFocus: false,
    });

  // active = pending (you can adjust logic to include other statuses)
  const activeApplications = useMemo(
    () => (applications || []).filter((app: any) => app.status === "PENDING"),
    [applications]
  );

  // flatten history entries with application context
  const timeline = useMemo(() => {
    if (!applications) return [];
    const items: Array<any> = [];
    applications.forEach((app: any) => {
      (app.ApplicationHistory || []).forEach((h: any) =>
        items.push({
          applicationId: app.id,
          jobTitle: app.job?.title || "Unknown role",
          companyName: app.job?.company?.name || "Unknown company",
          status: h.status,
          changedAt: h.changedAt,
        })
      );
      // also include initial application creation as an entry
      items.push({
        applicationId: app.id,
        jobTitle: app.job?.title || "Unknown role",
        companyName: app.job?.company?.name || "Unknown company",
        status: app.status,
        changedAt: app.createdAt,
      });
    });
    // sort descending by changedAt
    return items.sort(
      (a, b) =>
        new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
    );
  }, [applications]);

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">My Applications</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your active applications and view the status timeline.
          </p>
        </div>

        {/* Active Applications */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Briefcase className="h-5 w-5" /> Active Applications
          </h3>

          {isLoading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : activeApplications.length === 0 ? (
            <div className="text-sm text-gray-500">No active applications.</div>
          ) : (
            <div className="space-y-3">
              {activeApplications.map((app: any) => (
                <div key={app.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {app.job?.title || "Unknown role"}
                    </div>
                    <div className="text-sm text-gray-500">
                      {app.job?.company?.name || "Unknown company"}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Applied {new Date(app.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1 border-yellow-500 text-yellow-600"
                    >
                      <Clock className="h-3 w-3" />
                      Pending
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Timeline */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <User className="h-5 w-5" /> Application Timeline
          </h3>

          {isLoading ? (
            <div className="text-sm text-gray-500">Loading...</div>
          ) : timeline.length === 0 ? (
            <div className="text-sm text-gray-500">
              No application history available.
            </div>
          ) : (
            <div className="space-y-3">
              {timeline.map((entry, idx) => {
                const icon =
                  entry.status === "ACCEPTED" ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : entry.status === "REJECTED" ? (
                    <XCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-yellow-600" />
                  );
                return (
                  <div
                    key={`${entry.applicationId}-${idx}`}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-1">{icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="font-medium">{entry.jobTitle}</span>
                          <span className="text-muted-foreground ml-2 text-xs">
                            {entry.companyName}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(entry.changedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Status:{" "}
                        <span className="font-medium">{entry.status}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
