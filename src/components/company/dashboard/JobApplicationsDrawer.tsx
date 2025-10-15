"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/components/trpc/trpc-client";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  FileText,
  ExternalLink,
  GraduationCap,
} from "lucide-react";

interface JobApplicationsDrawerProps {
  jobId: number | null;
  jobTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function JobApplicationsDrawer({
  jobId,
  jobTitle,
  isOpen,
  onClose,
}: JobApplicationsDrawerProps) {
  const utils = trpc.useUtils();

  // Fetch job applications
  const { data, isLoading } = trpc.companies.getJobApplications.useQuery(
    { jobId: jobId! },
    { enabled: !!jobId && isOpen }
  );

  // Update application status mutation
  const updateStatusMutation =
    trpc.companies.updateApplicationStatus.useMutation({
      onSuccess: () => {
        toast.success("Application status updated");
        utils.companies.getJobApplications.invalidate();
        utils.companies.getMyCompanyDashboard.invalidate();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update application status");
      },
    });

  const handleStatusUpdate = (
    applicationId: number,
    status: "PENDING" | "ACCEPTED" | "REJECTED"
  ) => {
    updateStatusMutation.mutate({ applicationId, status });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-600"
          >
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "ACCEPTED":
        return (
          <Badge variant="outline" className="border-green-500 text-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="outline" className="border-red-500 text-red-600">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            {jobTitle}
          </SheetTitle>
          <SheetDescription>
            {data?.Application.length || 0} applications received
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-4">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : !data || data.Application.length === 0 ? (
            <Card className="p-8 text-center">
              <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No applications yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {data.Application.map((application: any) => {
                const profile = application.jobSeeker.JobSeekerProfile;
                const resumeUrl = profile?.resumeUrl;
                const portfolioUrl = profile?.portfolioUrl;
                const profileUrl =
                  profile?.publicProfileUrl ||
                  `/s/company/talent/${application.jobSeeker.id}`;
                const phoneEntries = Array.isArray(profile?.phoneNumber)
                  ? profile.phoneNumber.filter((phone: string) => phone?.trim())
                  : profile?.phoneNumber
                  ? [profile.phoneNumber]
                  : [];

                return (
                  <Card key={application.id} className="p-4">
                    <div className="space-y-4">
                      {/* Header with status */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold">
                              {application.jobSeeker.JobSeekerProfile
                                ?.fullName || "Anonymous"}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Applied{" "}
                              {new Date(
                                application.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>

                      <Separator />

                      {/* Contact Information */}
                      <div className="space-y-2 text-sm">
                        {application.jobSeeker.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="h-4 w-4" />
                            <span>{application.jobSeeker.email}</span>
                          </div>
                        )}
                        {phoneEntries.map((phone: string, idx: number) => (
                          <div
                            key={`${application.id}-phone-${idx}`}
                            className="flex items-center gap-2 text-gray-600"
                          >
                            <Phone className="h-4 w-4" />
                            <span>{phone}</span>
                          </div>
                        ))}
                        {profile?.location && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4" />
                            <span>{profile.location}</span>
                          </div>
                        )}
                        {profile?.dateOfBirth && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Born{" "}
                              {new Date(
                                profile.dateOfBirth
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {(profile?.lastEducationLevel ||
                        profile?.institutionName ||
                        profile?.graduationYear) && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-blue-500" />
                              Education
                            </p>
                            <div className="space-y-1 text-sm text-gray-600">
                              {profile?.lastEducationLevel && (
                                <div>
                                  Latest Degree:{" "}
                                  <span className="font-medium">
                                    {profile.lastEducationLevel}
                                  </span>
                                </div>
                              )}
                              {profile?.institutionName && (
                                <div>
                                  Institution: {profile.institutionName}
                                </div>
                              )}
                              {profile?.graduationYear && (
                                <div>Graduation: {profile.graduationYear}</div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {(resumeUrl || portfolioUrl || profileUrl) && (
                        <>
                          <Separator />
                          <div className="flex flex-wrap gap-2">
                            {resumeUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a
                                  href={resumeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Resume / CV
                                </a>
                              </Button>
                            )}
                            {portfolioUrl && (
                              <Button size="sm" variant="outline" asChild>
                                <a
                                  href={portfolioUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Portfolio
                                </a>
                              </Button>
                            )}
                            {profileUrl && (
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() =>
                                  window.open(
                                    profileUrl,
                                    "_blank",
                                    "noreferrer"
                                  )
                                }
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Full Profile
                              </Button>
                            )}
                          </div>
                        </>
                      )}

                      {/* Bio/Summary */}
                      {application.jobSeeker.JobSeekerProfile?.summary && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-sm font-medium mb-1">About</p>
                            <p className="text-sm text-gray-600">
                              {application.jobSeeker.JobSeekerProfile.summary}
                            </p>
                          </div>
                        </>
                      )}

                      {/* Skills */}
                      {application.jobSeeker.JobSeekerProfile?.skills &&
                        application.jobSeeker.JobSeekerProfile.skills.length >
                          0 && (
                          <>
                            <Separator />
                            <div>
                              <p className="text-sm font-medium mb-2">Skills</p>
                              <div className="flex flex-wrap gap-2">
                                {application.jobSeeker.JobSeekerProfile.skills.map(
                                  (skill: any, index: any) => (
                                    <Badge key={index} variant="secondary">
                                      {skill}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </div>
                          </>
                        )}

                      {/* Application History */}
                      {application.ApplicationHistory &&
                        application.ApplicationHistory.length > 0 && (
                          <>
                            <Separator />
                            <div>
                              <p className="text-sm font-medium mb-2">
                                History
                              </p>
                              <div className="space-y-2">
                                {application.ApplicationHistory.map(
                                  (record: any) => (
                                    <div
                                      key={record.id}
                                      className="flex items-center gap-2 text-xs text-gray-500"
                                    >
                                      <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                                      <span>
                                        Status changed to{" "}
                                        <span className="font-medium">
                                          {record.status}
                                        </span>
                                      </span>
                                      <span>•</span>
                                      <span>
                                        {new Date(
                                          record.changedAt
                                        ).toLocaleString()}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          </>
                        )}

                      {/* Actions */}
                      {application.status === "PENDING" && (
                        <>
                          <Separator />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                              onClick={() =>
                                handleStatusUpdate(application.id, "ACCEPTED")
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                              onClick={() =>
                                handleStatusUpdate(application.id, "REJECTED")
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
