import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin } from "lucide-react";

interface Event {
  id: number;
  title: string;
  description: string;
  date: Date | string;
  location: string | null;
}

interface HubHeaderProps {
  currentEvent: Event;
  events: Event[];
  onEventChange: (eventId: number) => void;
}

export default function HubHeader({
  currentEvent,
  events,
  onEventChange,
}: HubHeaderProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm px-4 py-4 border-b border-slate-200">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <Badge
            variant="secondary"
            className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700"
          >
            Live Event
          </Badge>
          <Select
            value={currentEvent.id.toString()}
            onValueChange={(value) => onEventChange(parseInt(value))}
          >
            <SelectTrigger className="w-[200px] border-purple-300 focus:ring-purple-400">
              <SelectValue placeholder="Select event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id.toString()}>
                  <div className="flex flex-col">
                    <span className="font-medium">{event.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {currentEvent.title}
        </h1>
        <p className="text-base text-muted-foreground mb-3">
          {currentEvent.description}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span>
              {new Date(currentEvent.date).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-purple-600" />
            <span>{currentEvent.location}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
