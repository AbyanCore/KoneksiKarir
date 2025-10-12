import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Building2,
  MapPin,
  Globe,
  Calendar,
  ChevronDown,
  ChevronRight,
  Briefcase,
} from "lucide-react";

interface CompanyDetails {
  id: number;
  name: string;
  description: string | null;
  website: string | null;
  location: string | null;
  logoUrl: string | null;
  code: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  applicationCount?: number;
  _count?: {
    jobs: number;
    EventCompanyParticipation: number;
  };
  participatingEvents?: Array<{
    id: number;
    title: string;
    standNumber: string;
    date: Date | string;
    jobs?: Array<{
      id: number;
      title: string;
      applicants: number;
    }>;
  }>;
}

interface CompanyDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: CompanyDetails | null;
  expandedEvents: Set<number>;
  onToggleEvent: (eventId: number) => void;
}

export default function CompanyDetailSheet({
  open,
  onOpenChange,
  company,
  expandedEvents,
  onToggleEvent,
}: CompanyDetailSheetProps) {
  if (!company) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-xl">Company Details</SheetTitle>
          <SheetDescription>
            Complete information about this company
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 p-4">
          <div className="relative h-40 rounded-lg bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center">
            <Building2 className="h-12 w-12 text-slate-400" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="font-semibold text-base">{company.name}</h3>
            </div>
            <p className="text-sm text-slate-600">
              {company.description || "No description provided"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-slate-500" />
              <span className="font-medium mr-2">Location:</span>
              <span className="text-slate-600">
                {company.location || "Not specified"}
              </span>
            </div>

            {company.website && (
              <div className="flex items-center text-sm">
                <Globe className="h-4 w-4 mr-2 text-slate-500" />
                <span className="font-medium mr-2">Website:</span>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline"
                >
                  {company.website}
                </a>
              </div>
            )}
          </div>

          <div className="border-t pt-3">
            <h4 className="font-semibold mb-2 text-sm">Statistics</h4>
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-indigo-50">
                <CardContent className="p-3 text-center">
                  <p className="text-xl font-bold text-indigo-600">
                    {company._count?.jobs || 0}
                  </p>
                  <p className="text-xs text-slate-600">Jobs Posted</p>
                </CardContent>
              </Card>
              <Card className="bg-purple-50">
                <CardContent className="p-3 text-center">
                  <p className="text-xl font-bold text-purple-600">
                    {company._count?.EventCompanyParticipation || 0}
                  </p>
                  <p className="text-xs text-slate-600">Events</p>
                </CardContent>
              </Card>
              <Card className="bg-pink-50">
                <CardContent className="p-3 text-center">
                  <p className="text-xl font-bold text-pink-600">
                    {company.applicationCount || 0}
                  </p>
                  <p className="text-xs text-slate-600">Applications</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Participating Events Section with Accordion */}
          {company.participatingEvents &&
            company.participatingEvents.length > 0 && (
              <div className="border-t pt-3">
                <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Participating in Events ({company.participatingEvents.length})
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {company.participatingEvents.map((event) => (
                    <Collapsible
                      key={event.id}
                      open={expandedEvents.has(event.id)}
                      onOpenChange={() => onToggleEvent(event.id)}
                    >
                      <Card className="bg-slate-50 hover:bg-slate-100 transition-colors">
                        <CollapsibleTrigger asChild>
                          <CardContent className="p-3 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  {expandedEvents.has(event.id) ? (
                                    <ChevronDown className="h-4 w-4 text-slate-500" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4 text-slate-500" />
                                  )}
                                  <p className="font-semibold text-sm text-slate-900">
                                    {event.title}
                                  </p>
                                  <Badge variant="outline" className="text-xs">
                                    Stand {event.standNumber}
                                  </Badge>
                                </div>
                                <p className="text-xs text-slate-600 mt-0.5 ml-6">
                                  {new Date(event.date).toLocaleDateString(
                                    "id-ID",
                                    {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    }
                                  )}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <CardContent className="px-3 pb-3 pt-0">
                            <div className="ml-6 border-l-2 border-indigo-200 pl-3 space-y-2">
                              <p className="text-xs font-semibold text-slate-700 mb-2">
                                Posted Jobs ({event.jobs?.length || 0})
                              </p>
                              {event.jobs && event.jobs.length > 0 ? (
                                event.jobs.map((job) => (
                                  <div
                                    key={job.id}
                                    className="bg-white rounded p-2 flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Briefcase className="h-3 w-3 text-indigo-500" />
                                      <span className="text-xs font-medium text-slate-900">
                                        {job.title}
                                      </span>
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {job.applicants} applicants
                                    </Badge>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-slate-500 italic">
                                  No jobs posted for this event yet
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </CollapsibleContent>
                      </Card>
                    </Collapsible>
                  ))}
                </div>
              </div>
            )}

          <div className="border-t pt-3 text-xs text-slate-500">
            <p>Created: {new Date(company.createdAt).toLocaleString()}</p>
            <p>Updated: {new Date(company.updatedAt).toLocaleString()}</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
