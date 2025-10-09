"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Search,
  Eye,
  Building2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

type Event = {
  id: number;
  title: string;
  description: string;
  bannerUrl: string;
  minimapUrl: string;
  date: Date;
  location: string;
  createdAt: Date;
  updatedAt: Date;
  // Stats for display
  jobCount?: number;
  companyCount?: number;
  applicationCount?: number;
  // Participating companies
  participatingCompanies?: Array<{
    id: number;
    name: string;
    standNumber: string;
    jobCount: number;
  }>;
};

export default function Page_AdminEvents() {
  // Mock data based on Prisma schema
  const [events, setEvents] = useState<Event[]>([
    {
      id: 1,
      title: "Tech Career Fair 2024",
      description:
        "Join us for the biggest tech career fair of the year! Connect with leading tech companies and explore exciting career opportunities.",
      bannerUrl: "/events/tech-fair-banner.jpg",
      minimapUrl: "/events/tech-fair-minimap.jpg",
      date: new Date("2024-06-15"),
      location: "Jakarta Convention Center, Jakarta",
      createdAt: new Date("2024-01-10"),
      updatedAt: new Date("2024-01-10"),
      jobCount: 45,
      companyCount: 12,
      applicationCount: 230,
      participatingCompanies: [
        {
          id: 1,
          name: "Tech Corp Indonesia",
          standNumber: "A-101",
          jobCount: 12,
        },
        {
          id: 2,
          name: "Digital Solutions Ltd",
          standNumber: "A-102",
          jobCount: 8,
        },
        {
          id: 3,
          name: "Innovation Systems",
          standNumber: "B-201",
          jobCount: 15,
        },
        { id: 4, name: "Cloud Innovations", standNumber: "A-103", jobCount: 5 },
        {
          id: 5,
          name: "Data Analytics Pro",
          standNumber: "B-202",
          jobCount: 5,
        },
      ],
    },
    {
      id: 2,
      title: "BioTech Career Fair 2025",
      description:
        "Discover opportunities in biotechnology and healthcare. Meet innovative companies shaping the future of medicine.",
      bannerUrl: "/events/biotech-banner.jpg",
      minimapUrl: "/events/biotech-minimap.jpg",
      date: new Date("2025-03-20"),
      location: "Surabaya Expo Center, Surabaya",
      createdAt: new Date("2024-02-05"),
      updatedAt: new Date("2024-02-05"),
      jobCount: 28,
      companyCount: 8,
      applicationCount: 145,
      participatingCompanies: [
        { id: 6, name: "BioMed Research", standNumber: "C-301", jobCount: 10 },
        {
          id: 7,
          name: "HealthTech Solutions",
          standNumber: "C-302",
          jobCount: 9,
        },
        {
          id: 8,
          name: "Pharma Innovations",
          standNumber: "C-303",
          jobCount: 9,
        },
      ],
    },
    {
      id: 3,
      title: "Finance & Banking Expo 2024",
      description:
        "Explore career paths in finance, banking, and fintech sectors with top financial institutions.",
      bannerUrl: "/events/finance-banner.jpg",
      minimapUrl: "/events/finance-minimap.jpg",
      date: new Date("2024-09-10"),
      location: "Bali International Convention Center",
      createdAt: new Date("2024-01-20"),
      updatedAt: new Date("2024-01-20"),
      jobCount: 32,
      companyCount: 10,
      applicationCount: 187,
      participatingCompanies: [
        {
          id: 9,
          name: "Global Bank Indonesia",
          standNumber: "D-401",
          jobCount: 8,
        },
        {
          id: 10,
          name: "Fintech Innovations",
          standNumber: "D-402",
          jobCount: 12,
        },
        {
          id: 11,
          name: "Investment Partners",
          standNumber: "D-403",
          jobCount: 7,
        },
        { id: 12, name: "Insurance Corp", standNumber: "D-404", jobCount: 5 },
      ],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    bannerUrl: "",
    minimapUrl: "",
    date: "",
    location: "",
  });

  // Filter events by search query
  const filteredEvents = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return events;
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query)
    );
  }, [events, searchQuery]);

  // Reset form
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      bannerUrl: "",
      minimapUrl: "",
      date: "",
      location: "",
    });
  };

  // Create event
  const handleCreate = () => {
    const newEvent: Event = {
      id: Math.max(...events.map((e) => e.id), 0) + 1,
      title: formData.title,
      description: formData.description,
      bannerUrl: formData.bannerUrl,
      minimapUrl: formData.minimapUrl,
      date: new Date(formData.date),
      location: formData.location,
      createdAt: new Date(),
      updatedAt: new Date(),
      jobCount: 0,
      companyCount: 0,
      applicationCount: 0,
    };
    setEvents([...events, newEvent]);
    setIsCreateOpen(false);
    resetForm();
  };

  // Edit event
  const handleEdit = () => {
    if (!selectedEvent) return;
    const updatedEvents = events.map((event) =>
      event.id === selectedEvent.id
        ? {
            ...event,
            title: formData.title,
            description: formData.description,
            bannerUrl: formData.bannerUrl,
            minimapUrl: formData.minimapUrl,
            date: new Date(formData.date),
            location: formData.location,
            updatedAt: new Date(),
          }
        : event
    );
    setEvents(updatedEvents);
    setIsEditOpen(false);
    setSelectedEvent(null);
    resetForm();
  };

  // Delete event
  const handleDelete = () => {
    if (!selectedEvent) return;
    setEvents(events.filter((event) => event.id !== selectedEvent.id));
    setIsDeleteOpen(false);
    setSelectedEvent(null);
  };

  // Open edit dialog
  const openEdit = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      bannerUrl: event.bannerUrl,
      minimapUrl: event.minimapUrl,
      date: event.date.toISOString().split("T")[0],
      location: event.location,
    });
    setIsEditOpen(true);
  };

  // Open delete dialog
  const openDelete = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteOpen(true);
  };

  // Open detail sheet
  const openDetail = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 opacity-90 blur-lg transform -skew-y-1 scale-105"></div>
          <div className="relative px-4 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Events Management
                </h1>
                <p className="mt-0.5 text-xs opacity-90">
                  Create, manage, and monitor career fair events
                </p>
              </div>
              <Button
                onClick={() => {
                  resetForm();
                  setIsCreateOpen(true);
                }}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </div>
          </div>
        </div>

        {/* Search & Stats */}
        {/* Stats Cards */}
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
                      {events.length}
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
                      {events.reduce((sum, e) => sum + (e.jobCount || 0), 0)}
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
                      {events.reduce(
                        (sum, e) => sum + (e.applicationCount || 0),
                        0
                      )}
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

        {/* Search Input */}
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-200 bg-white/90 backdrop-blur-sm"
            >
              <div className="relative h-32 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon className="h-10 w-10 text-slate-400" />
                </div>
                <Badge className="absolute top-2 right-2 text-xs bg-white/90 text-slate-900 hover:bg-white">
                  {event.date > new Date() ? "Upcoming" : "Past"}
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
                  {event.date.toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
                <div className="flex items-center text-xs text-slate-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>

                <div className="flex gap-1.5 pt-1">
                  <Badge variant="secondary" className="text-xs">
                    {event.jobCount || 0} Jobs
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {event.companyCount || 0} Companies
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {event.applicationCount || 0} Apps
                  </Badge>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => openDetail(event)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" onClick={() => openEdit(event)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openDelete(event)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredEvents.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Calendar className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600">
                No events found matching your search.
              </p>
            </div>
          )}
        </div>

        {/* Detail Sheet */}
        <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-xl">Event Details</SheetTitle>
              <SheetDescription>
                Complete information about this event
              </SheetDescription>
            </SheetHeader>

            {selectedEvent && (
              <div className="space-y-4 p-4">
                <div className="relative h-40 rounded-lg bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-slate-400" />
                </div>

                <div>
                  <h3 className="font-semibold text-base mb-1.5">
                    {selectedEvent.title}
                  </h3>
                  <p className="text-sm text-slate-600">
                    {selectedEvent.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                    <span className="font-medium mr-2">Date:</span>
                    <span className="text-slate-600">
                      {selectedEvent.date.toLocaleDateString("id-ID", {
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
                      {selectedEvent.location}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <h4 className="font-semibold mb-2 text-sm">Statistics</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-indigo-50">
                      <CardContent className="p-3 text-center">
                        <p className="text-xl font-bold text-indigo-600">
                          {selectedEvent.jobCount || 0}
                        </p>
                        <p className="text-xs text-slate-600">Jobs Posted</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-50">
                      <CardContent className="p-3 text-center">
                        <p className="text-xl font-bold text-purple-600">
                          {selectedEvent.companyCount || 0}
                        </p>
                        <p className="text-xs text-slate-600">Companies</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-pink-50">
                      <CardContent className="p-3 text-center">
                        <p className="text-xl font-bold text-pink-600">
                          {selectedEvent.applicationCount || 0}
                        </p>
                        <p className="text-xs text-slate-600">Applications</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Participating Companies Section */}
                {selectedEvent.participatingCompanies &&
                  selectedEvent.participatingCompanies.length > 0 && (
                    <div className="border-t pt-3">
                      <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Participating Companies (
                        {selectedEvent.participatingCompanies.length})
                      </h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedEvent.participatingCompanies.map((company) => (
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
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
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
                  <p>Created: {selectedEvent.createdAt.toLocaleString()}</p>
                  <p>Updated: {selectedEvent.updatedAt.toLocaleString()}</p>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Create Sheet */}
        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Create New Event</SheetTitle>
              <SheetDescription>
                Add a new career fair event to the system
              </SheetDescription>
            </SheetHeader>

            <div className="grid gap-3 p-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-sm">
                  Event Title
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Tech Career Fair 2024"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="text-sm">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the event..."
                  rows={2}
                  className="text-sm"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date" className="text-sm">
                    Event Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location" className="text-sm">
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Jakarta Convention Center"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="bannerUrl" className="text-sm">
                  Banner URL
                </Label>
                <Input
                  id="bannerUrl"
                  placeholder="/events/banner.jpg"
                  value={formData.bannerUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, bannerUrl: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="minimapUrl" className="text-sm">
                  Minimap URL
                </Label>
                <Input
                  id="minimapUrl"
                  placeholder="/events/minimap.jpg"
                  value={formData.minimapUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, minimapUrl: e.target.value })
                  }
                />
              </div>
            </div>

            <SheetFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  !formData.title ||
                  !formData.description ||
                  !formData.date ||
                  !formData.location
                }
                className="bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                Create Event
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Edit Sheet */}
        <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Event</SheetTitle>
              <SheetDescription>Update event information</SheetDescription>
            </SheetHeader>

            <div className="grid gap-3 p-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title" className="text-sm">
                  Event Title
                </Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description" className="text-sm">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  rows={2}
                  className="text-sm"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-date" className="text-sm">
                    Event Date
                  </Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-location" className="text-sm">
                    Location
                  </Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-bannerUrl" className="text-sm">
                  Banner URL
                </Label>
                <Input
                  id="edit-bannerUrl"
                  value={formData.bannerUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, bannerUrl: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-minimapUrl" className="text-sm">
                  Minimap URL
                </Label>
                <Input
                  id="edit-minimapUrl"
                  value={formData.minimapUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, minimapUrl: e.target.value })
                  }
                />
              </div>
            </div>

            <SheetFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleEdit}
                disabled={
                  !formData.title ||
                  !formData.description ||
                  !formData.date ||
                  !formData.location
                }
                className="bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                Save Changes
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Delete Confirmation Sheet */}
        <Sheet open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Delete Event</SheetTitle>
              <SheetDescription>
                Are you sure you want to delete this event? This action cannot
                be undone.
              </SheetDescription>
            </SheetHeader>

            {selectedEvent && (
              <div className="p-4">
                <p className="font-semibold text-sm">{selectedEvent.title}</p>
                <p className="text-sm text-slate-600 mt-1">
                  {selectedEvent.location} •{" "}
                  {selectedEvent.date.toLocaleDateString()}
                </p>
              </div>
            )}

            <SheetFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Event
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
