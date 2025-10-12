import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

interface Application {
  id: number;
  applicantEmail: string;
  jobTitle: string;
  companyName: string;
  status: string;
  createdAt: Date | string;
}

interface RecentApplicationsTableProps {
  applications: Application[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function RecentApplicationsTable({
  applications,
  searchQuery,
  onSearchChange,
}: RecentApplicationsTableProps) {
  const filteredApplications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter((a) => {
      return (
        (a.applicantEmail || "").toLowerCase().includes(q) ||
        (a.jobTitle || "").toLowerCase().includes(q) ||
        (a.companyName || "").toLowerCase().includes(q) ||
        (a.status || "").toLowerCase().includes(q)
      );
    });
  }, [applications, searchQuery]);

  return (
    <div className="bg-white/95 rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Recent Applications</h2>

        <div className="ml-4 w-full max-w-xs">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="h-4 w-4" />
            </span>

            <Tooltip>
              <TooltipTrigger asChild>
                <Input
                  placeholder="Search anything..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10"
                />
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="max-w-xs">
                <p className="text-sm leading-tight">
                  You can search by applicant email, job title, company name, or
                  application status (e.g. PENDING, ACCEPTED, REJECTED).
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 text-slate-700 text-xs uppercase">
              <th className="px-4 py-3 text-left">Applicant</th>
              <th className="px-4 py-3 text-left">Job</th>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredApplications.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-sm font-medium">
                  {a.applicantEmail}
                </td>
                <td className="px-4 py-3 text-sm">{a.jobTitle}</td>
                <td className="px-4 py-3 text-sm">{a.companyName}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full ${
                      a.status === "ACCEPTED"
                        ? "bg-green-100 text-green-800"
                        : a.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor:
                          a.status === "ACCEPTED"
                            ? "#16a34a"
                            : a.status === "REJECTED"
                            ? "#dc2626"
                            : "#b45309",
                      }}
                    />
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-500">
                  {new Date(a.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {filteredApplications.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-6 text-sm text-slate-500"
                >
                  {searchQuery
                    ? `No applications found for "${searchQuery}"`
                    : "No applications yet"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
