import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Users,
  Briefcase,
  DollarSign,
  Eye,
} from "lucide-react";

interface Job {
  id: number;
  title: string;
  tags: string[];
  salaryMin: number | null;
  salaryMax: number | null;
  applicationCount: number;
}

interface Company {
  id: number;
  name: string;
  logoUrl: string | null;
  standNumber: string;
  jobCount: number;
  jobs: Job[];
}

interface CompanyCardProps {
  company: Company;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onViewJobDetail: (jobId: number) => void;
}

const formatSalary = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function CompanyCard({
  company,
  isExpanded,
  onToggleExpand,
  onViewJobDetail,
}: CompanyCardProps) {
  const totalApplications = company.jobs.reduce(
    (sum, job) => sum + job.applicationCount,
    0
  );

  return (
    <div>
      <div
        className={`cursor-pointer transition-all p-4 rounded-xl hover:bg-purple-50 hover:shadow-md ${
          isExpanded
            ? "bg-purple-50 border-2 border-purple-300 shadow-md"
            : "bg-slate-50"
        }`}
        onClick={onToggleExpand}
      >
        <div className="flex items-start gap-4">
          <div className="relative w-16 h-16 bg-white rounded-xl flex-shrink-0 overflow-hidden shadow-sm border border-slate-200">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={company.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-slate-400" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate mb-1">
              {company.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="border-blue-300 text-blue-700"
              >
                Stand {company.standNumber}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700"
              >
                {company.jobCount} jobs available
              </Badge>
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-700 border border-orange-200"
              >
                <Users className="h-3 w-3 mr-1" />
                {totalApplications} applicants
              </Badge>
            </div>
          </div>
          <div className="flex-shrink-0">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-purple-600" />
            ) : (
              <ChevronDown className="h-5 w-5 text-slate-400" />
            )}
          </div>
        </div>

        {/* Expanded Job Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-purple-200 space-y-3">
            <h4 className="font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-purple-600" />
              Available Positions
            </h4>
            {company.jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-3 rounded-lg border border-slate-200 hover:border-purple-300 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-semibold text-base">{job.title}</h5>
                  <Badge
                    variant="outline"
                    className="text-xs border-orange-300 text-orange-700 bg-orange-50"
                  >
                    <Users className="h-3 w-3 mr-1" />
                    {job.applicationCount} applied
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
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
                {job.salaryMin && job.salaryMax && (
                  <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">
                      {formatSalary(job.salaryMin)} -{" "}
                      {formatSalary(job.salaryMax)}
                    </span>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-purple-300 text-purple-700 hover:bg-purple-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewJobDetail(job.id);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details & Apply
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
