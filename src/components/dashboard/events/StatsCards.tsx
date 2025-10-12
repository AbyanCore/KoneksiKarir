import { Card } from "@/components/ui/card";
import { Calendar, Building2, Image as ImageIcon } from "lucide-react";

interface StatsCardsProps {
  totalEvents: number;
  totalJobs: number;
  totalApplications: number;
}

export default function StatsCards({
  totalEvents,
  totalJobs,
  totalApplications,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {/* Total Events card */}
      <Card className="bg-transparent rounded-lg overflow-hidden transform hover:scale-[1.01] transition bg-gradient-to-br from-indigo-50 to-indigo-100">
        <div className="px-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg text-white shadow">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Total Events</div>
                <div className="text-2xl font-bold text-slate-900">
                  {totalEvents}
                </div>
              </div>
            </div>
            <div className="text-sm text-green-600 font-medium">+12%</div>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Active career fair events
          </p>
        </div>
      </Card>

      {/* Total Jobs card */}
      <Card className="bg-transparent rounded-lg overflow-hidden transform hover:scale-[1.01] transition bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="px-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-lg text-white shadow">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Total Jobs</div>
                <div className="text-2xl font-bold text-slate-900">
                  {totalJobs}
                </div>
              </div>
            </div>
            <div className="text-sm text-purple-600 font-medium">+8%</div>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Job postings across events
          </p>
        </div>
      </Card>

      {/* Applications card */}
      <Card className="bg-transparent rounded-lg overflow-hidden transform hover:scale-[1.01] transition bg-gradient-to-br from-pink-50 to-pink-100">
        <div className="px-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-pink-600 to-rose-600 p-2 rounded-lg text-white shadow">
                <ImageIcon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-slate-500">Applications</div>
                <div className="text-2xl font-bold text-slate-900">
                  {totalApplications}
                </div>
              </div>
            </div>
            <div className="text-sm text-pink-600 font-medium">+15%</div>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Total applications received
          </p>
        </div>
      </Card>
    </div>
  );
}
