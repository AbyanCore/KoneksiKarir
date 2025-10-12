import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

interface DashboardHeaderProps {
  viewMode: "event" | "lifetime";
  selectedEvent: {
    id: number;
    title: string;
    date: Date | string;
  } | null;
}

export default function DashboardHeader({
  viewMode,
  selectedEvent,
}: DashboardHeaderProps) {
  return (
    <div className="relative rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 opacity-90 blur-lg transform -skew-y-1 scale-105"></div>

      <div className="relative px-6 py-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm opacity-90">
              Overview & recent activity — quick insights at a glance
            </p>
          </div>

          <div className="flex items-center gap-3">
            {viewMode === "event" && selectedEvent ? (
              <>
                <Badge className="bg-white/20 text-white border-transparent px-3 py-1">
                  {selectedEvent.title}
                </Badge>
                <span className="text-sm text-white/90 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedEvent.date).toLocaleDateString()}
                </span>
              </>
            ) : (
              <Badge className="bg-white/20 text-white border-transparent px-3 py-1">
                Lifetime
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
