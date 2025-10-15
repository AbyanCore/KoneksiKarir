import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Briefcase,
  Globe,
  CheckCircle2,
} from "lucide-react";

interface JobDetail {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  tags: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  isRemote: boolean;
  applicationCount: number;
  company: {
    id: number;
    name: string;
    description: string | null;
    website: string | null;
    location: string | null;
    logoUrl: string | null;
  };
  event: {
    id: number;
    title: string;
    date: Date | string;
    location: string | null;
  };
}

interface JobDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  job: JobDetail | null;
  hasApplied: boolean;
  isApplying: boolean;
  onApply: () => void;
  remainingApplications?: number;
}

const formatSalary = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function JobDetailSheet({
  open,
  onOpenChange,
  job,
  hasApplied,
  isApplying,
  onApply,
  remainingApplications = 5,
}: JobDetailSheetProps) {
  if (!job) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">{job.title}</SheetTitle>
          <SheetDescription>
            Complete job details and application
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 p-4">
          {/* Company Info */}
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              {job.company.logoUrl ? (
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                  <img
                    src={job.company.logoUrl}
                    alt={job.company.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              ) : (
                <Building2 className="h-5 w-5 text-blue-600" />
              )}
              <h3 className="font-semibold text-lg">{job.company.name}</h3>
            </div>
            {job.company.description && (
              <p className="text-sm text-slate-600 mb-2">
                {job.company.description}
              </p>
            )}
            <div className="space-y-1 text-sm">
              {job.company.location && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span>{job.company.location}</span>
                </div>
              )}
              {job.company.website && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Globe className="h-4 w-4" />
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {job.company.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Job Details */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-purple-600" />
              Job Information
            </h4>

            {job.description && (
              <div className="mb-3">
                <p className="text-sm text-slate-600 whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>
            )}

            <div className="space-y-2 text-sm">
              {(job.salaryMin || job.salaryMax) && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="font-medium">
                    {job.salaryMin && job.salaryMax
                      ? `${formatSalary(job.salaryMin)} - ${formatSalary(
                          job.salaryMax
                        )}`
                      : job.salaryMax
                      ? `Up to ${formatSalary(job.salaryMax)}`
                      : "Salary negotiable"}
                  </span>
                </div>
              )}

              {job.location && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span>{job.location}</span>
                  {job.isRemote && (
                    <Badge variant="secondary" className="text-xs">
                      Remote
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 text-slate-600">
                <Users className="h-4 w-4" />
                <span>{job.applicationCount} applicants</span>
              </div>
            </div>
          </div>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-sm">Required Skills</h4>
              <div className="flex flex-wrap gap-1.5">
                {job.tags.map((tag, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-xs bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Event Info */}
          <div className="bg-purple-50 rounded-lg p-3">
            <h4 className="font-semibold mb-2 text-sm">Event Information</h4>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="font-medium">{job.event.title}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(job.event.date).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {job.event.location && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4" />
                  <span>{job.event.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Application Status */}
          {hasApplied && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-semibold">Already Applied</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                You have already submitted an application for this position.
              </p>
            </div>
          )}

          {!hasApplied && remainingApplications === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-700">
                You have reached the maximum of 5 applications for this event.
              </p>
            </div>
          )}
        </div>

        <SheetFooter className="gap-2 px-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {!hasApplied && remainingApplications > 0 && (
            <Button
              onClick={onApply}
              disabled={isApplying}
              className="bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              {isApplying ? "Applying..." : "Apply Now"}
            </Button>
          )}
        </SheetFooter>

        {!hasApplied && remainingApplications > 0 && (
          <div className="px-4 pb-4">
            <p className="text-xs text-slate-500 text-center">
              You have {remainingApplications} application
              {remainingApplications !== 1 ? "s" : ""} remaining for this event
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
