import { Card } from "@/components/ui/card";
import { Building2, Briefcase, FileText, Users } from "lucide-react";

interface MetricsCardsProps {
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  totalUsers: number;
}

export default function MetricsCards({
  totalCompanies,
  totalJobs,
  totalApplications,
  totalUsers,
}: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 -mt-4">
      {/* Companies card */}
      <Card className="bg-transparent rounded-lg overflow-hidden transform hover:scale-[1.01] transition bg-gradient-to-br from-indigo-50 to-indigo-100">
        <div className="p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg text-white shadow">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Companies</div>
                <div className="text-2xl font-bold text-slate-900">
                  {totalCompanies}
                </div>
              </div>
            </div>
            <div className="text-sm text-green-600 font-medium">+3%</div>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Total registered companies
          </p>
        </div>
      </Card>

      {/* Jobs card */}
      <Card className="bg-transparent rounded-lg overflow-hidden transform hover:scale-[1.01] transition bg-gradient-to-br from-rose-50 to-rose-100">
        <div className="p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-rose-600 to-orange-500 p-2 rounded-lg text-white shadow">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Jobs</div>
                <div className="text-2xl font-bold text-slate-900">
                  {totalJobs}
                </div>
              </div>
            </div>
            <div className="text-sm text-red-600 font-medium">-1%</div>
          </div>
          <p className="mt-3 text-sm text-slate-600">Open positions posted</p>
        </div>
      </Card>

      {/* Applications card */}
      <Card className="bg-transparent rounded-lg overflow-hidden transform hover:scale-[1.01] transition bg-gradient-to-br from-amber-50 to-amber-100">
        <div className="p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-600 to-yellow-500 p-2 rounded-lg text-white shadow">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Applications</div>
                <div className="text-2xl font-bold text-slate-900">
                  {totalApplications}
                </div>
              </div>
            </div>
            <div className="text-sm text-yellow-700 font-medium">+8%</div>
          </div>
          <p className="mt-3 text-sm text-slate-600">Applications received</p>
        </div>
      </Card>

      {/* Users card */}
      <Card className="bg-transparent rounded-lg overflow-hidden transform hover:scale-[1.01] transition bg-gradient-to-br from-sky-50 to-sky-100">
        <div className="p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-sky-600 to-indigo-500 p-2 rounded-lg text-white shadow">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Users</div>
                <div className="text-2xl font-bold text-slate-900">
                  {totalUsers}
                </div>
              </div>
            </div>
            <div className="text-sm text-indigo-600 font-medium">+5%</div>
          </div>
          <p className="mt-3 text-sm text-slate-600">Registered users</p>
        </div>
      </Card>
    </div>
  );
}
