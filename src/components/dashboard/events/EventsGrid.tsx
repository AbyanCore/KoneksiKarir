import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Edit,
  Trash2,
  Image as ImageIcon,
  Eye,
} from "lucide-react";

interface Event {
  id: number;
  title: string;
  description: string;
  bannerUrl: string;
  minimapUrl: string;
  date: Date | string;
  location: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  applicationCount?: number;
  _count?: {
    Job: number;
    EventCompanyParticipation: number;
  };
}

interface EventsGridProps {
  events: Event[];
  onView: (eventId: number) => void;
  onEdit: (eventId: number) => void;
  onDelete: (eventId: number) => void;
}

export default function EventsGrid({
  events,
  onView,
  onEdit,
  onDelete,
}: EventsGridProps) {
  if (events.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <Calendar className="h-16 w-16 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-600">No events found matching your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event) => {
        const eventDate = new Date(event.date);
        const isUpcoming = eventDate > new Date();

        return (
          <Card
            key={event.id}
            className="overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-200 bg-white/90 backdrop-blur-sm"
          >
            <div className="relative h-32 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="h-10 w-10 text-slate-400" />
              </div>
              <Badge className="absolute top-2 right-2 text-xs bg-white/90 text-slate-900 hover:bg-white">
                {isUpcoming ? "Upcoming" : "Past"}
              </Badge>
            </div>

            <CardHeader>
              <CardTitle className="text-base line-clamp-1">
                {event.title}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-xs">
                {event.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-2">
              <div className="flex items-center text-xs text-slate-600">
                <Calendar className="h-4 w-4 mr-2" />
                {eventDate.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center text-xs text-slate-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="line-clamp-1">
                  {event.location || "Location not specified"}
                </span>
              </div>

              <div className="flex gap-1.5 pt-1">
                <Badge variant="secondary" className="text-xs">
                  {event._count?.Job || 0} Jobs
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {event._count?.EventCompanyParticipation || 0} Companies
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {event.applicationCount || 0} Apps
                </Badge>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => onView(event.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button variant="outline" onClick={() => onEdit(event.id)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onDelete(event.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
