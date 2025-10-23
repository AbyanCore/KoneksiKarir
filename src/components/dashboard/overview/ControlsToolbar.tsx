import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { DownloadCloud } from "lucide-react";

interface Event {
  id: number;
  title: string;
  date: Date | string;
  location: string | null;
}

interface ControlsToolbarProps {
  viewMode: "event" | "lifetime";
  selectedEventId: number | null;
  events: Event[];
  onViewModeChange: (mode: "event" | "lifetime", eventId?: number) => void;
  onDownloadReport: () => void;
}

export default function ControlsToolbar({
  viewMode,
  selectedEventId,
  events,
  onViewModeChange,
  onDownloadReport,
}: ControlsToolbarProps) {
  return (
    <div className="flex items-center justify-end gap-4 mt-2">
      <div className="min-w-[220px]">
        <Select
          onValueChange={(val) => {
            if (val === "lifetime") {
              onViewModeChange("lifetime");
            } else {
              onViewModeChange("event", Number(val));
            }
          }}
          value={
            viewMode === "lifetime"
              ? "lifetime"
              : selectedEventId
              ? String(selectedEventId)
              : undefined
          }
        >
          <SelectTrigger className="w-56 flex items-center justify-between">
            <SelectValue placeholder="Select view..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lifetime">
              <span className="font-semibold">📊 Lifetime (All Events)</span>
            </SelectItem>
            <div className="border-t my-1"></div>
            {events.map((ev) => (
              <SelectItem key={ev.id} value={String(ev.id)}>
                📅 {ev.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="default"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95"
            onClick={onDownloadReport}
          >
            <DownloadCloud className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          <span className="text-sm">Download a full CSV/PDF report</span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
