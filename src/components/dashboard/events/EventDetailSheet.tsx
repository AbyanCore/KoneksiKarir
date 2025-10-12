import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Building2, Image as ImageIcon } from "lucide-react";

interface EventDetails {
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
  participatingCompanies?: Array<{
    id: number;
    name: string;
    standNumber: string;
    jobCount: number;
  }>;
}

interface EventDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: EventDetails | null;
}

export default function EventDetailSheet({
  open,
  onOpenChange,
  event,
}: EventDetailSheetProps) {
  if (!event) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">Event Details</SheetTitle>
          <SheetDescription>
            Complete information about this event
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 p-4">
          <div className="relative h-40 rounded-lg bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-slate-400" />
          </div>

          <div>
            <h3 className="font-semibold text-base mb-1.5">{event.title}</h3>
            <p className="text-sm text-slate-600">{event.description}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-slate-500" />
              <span className="font-medium mr-2">Date:</span>
              <span className="text-slate-600">
                {new Date(event.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-slate-500" />
              <span className="font-medium mr-2">Location:</span>
              <span className="text-slate-600">
                {event.location || "Not specified"}
              </span>
            </div>
          </div>

          <div className="border-t pt-3">
            <h4 className="font-semibold mb-2 text-sm">Statistics</h4>
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-indigo-50">
                <CardContent className="p-3 text-center">
                  <p className="text-xl font-bold text-indigo-600">
                    {event._count?.Job || 0}
                  </p>
                  <p className="text-xs text-slate-600">Jobs Posted</p>
                </CardContent>
              </Card>
              <Card className="bg-purple-50">
                <CardContent className="p-3 text-center">
                  <p className="text-xl font-bold text-purple-600">
                    {event._count?.EventCompanyParticipation || 0}
                  </p>
                  <p className="text-xs text-slate-600">Companies</p>
                </CardContent>
              </Card>
              <Card className="bg-pink-50">
                <CardContent className="p-3 text-center">
                  <p className="text-xl font-bold text-pink-600">
                    {event.applicationCount || 0}
                  </p>
                  <p className="text-xs text-slate-600">Applications</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Participating Companies Section */}
          {event.participatingCompanies &&
            event.participatingCompanies.length > 0 && (
              <div className="border-t pt-3">
                <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Participating Companies ({event.participatingCompanies.length}
                  )
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {event.participatingCompanies.map((company) => (
                    <Card
                      key={company.id}
                      className="bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-sm text-slate-900">
                                {company.name}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                Stand {company.standNumber}
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">
                              {company.jobCount}{" "}
                              {company.jobCount === 1
                                ? "position"
                                : "positions"}{" "}
                              available
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-semibold">
                              {company.jobCount}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          <div className="border-t pt-3 text-xs text-slate-500">
            <p>Created: {new Date(event.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(event.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
