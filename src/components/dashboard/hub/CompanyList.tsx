import { Building2 } from "lucide-react";
import CompanyCard from "./CompanyCard";

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

interface CompanyListProps {
  companies: Company[];
  expandedCompanyId: number | null;
  onToggleExpand: (companyId: number) => void;
  onViewJobDetail: (jobId: number) => void;
}

export default function CompanyList({
  companies,
  expandedCompanyId,
  onToggleExpand,
  onViewJobDetail,
}: CompanyListProps) {
  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-500">
        <Building2 className="h-16 w-16 mb-4 text-slate-300" />
        <h3 className="text-lg font-semibold mb-2">No Companies Found</h3>
        <p className="text-sm text-center max-w-md">
          No companies match your search criteria. Try adjusting your search or
          select a different event.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {companies.map((company) => (
        <CompanyCard
          key={company.id}
          company={company}
          isExpanded={expandedCompanyId === company.id}
          onToggleExpand={() => onToggleExpand(company.id)}
          onViewJobDetail={onViewJobDetail}
        />
      ))}
    </div>
  );
}
