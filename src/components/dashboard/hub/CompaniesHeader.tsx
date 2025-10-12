import { Input } from "@/components/ui/input";
import { Search, Building2 } from "lucide-react";

interface CompaniesHeaderProps {
  totalCompanies: number;
  totalJobs: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultsCount?: number;
}

export default function CompaniesHeader({
  totalCompanies,
  totalJobs,
  searchQuery,
  onSearchChange,
  resultsCount,
}: CompaniesHeaderProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm px-4 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Participating Companies</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {totalCompanies} companies with {totalJobs} job openings
        </p>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by company name, stand number, job title, or tags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 py-5 bg-white border-slate-300 focus:border-purple-400 focus:ring-purple-400"
          />
        </div>

        {/* Results Count */}
        {searchQuery && resultsCount !== undefined && (
          <p className="text-sm text-muted-foreground mb-3">
            Found {resultsCount} result{resultsCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}
