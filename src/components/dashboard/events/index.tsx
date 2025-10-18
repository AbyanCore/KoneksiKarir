"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { trpc } from "@/components/trpc/trpc-client";
import EventsHeader from "./EventsHeader";
import StatsCards from "./StatsCards";
import SearchBar from "./SearchBar";
import EventsGrid from "./EventsGrid";
import EventFormSheet from "./EventFormSheet";
import DeleteConfirmSheet from "./DeleteConfirmSheet";
import EventDetailSheet from "./EventDetailSheet";

interface EventFormData {
  title: string;
  description: string;
  bannerUrl: string;
  minimapUrl: string;
  date: string;
  location: string;
}

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

export default function EventsManagement() {
  // State Management
  const [searchQuery, setSearchQuery] = useState("");
  const [formSheetOpen, setFormSheetOpen] = useState(false);
  const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    bannerUrl: "",
    minimapUrl: "",
    date: "",
    location: "",
  });

  // Queries
  const {
    data: events = [],
    isLoading,
    refetch,
  } = trpc.events.findAllWithStats.useQuery();

  const { data: selectedEventDetails } =
    trpc.events.findOneWithDetails.useQuery(
      { id: selectedEventId! },
      {
        enabled: detailSheetOpen && selectedEventId !== null,
      }
    );

  // Mutations
  const createEventMutation = trpc.events.create.useMutation({
    onSuccess: () => {
      toast.success("Event created successfully");
      refetch();
      closeFormSheet();
    },
    onError: (error) => {
      toast.error(`Failed to create event: ${error.message}`);
    },
  });

  const updateEventMutation = trpc.events.update.useMutation({
    onSuccess: () => {
      toast.success("Event updated successfully");
      refetch();
      closeFormSheet();
    },
    onError: (error) => {
      toast.error(`Failed to update event: ${error.message}`);
    },
  });

  const deleteEventMutation = trpc.events.delete.useMutation({
    onSuccess: () => {
      toast.success("Event deleted successfully");
      refetch();
      closeDeleteSheet();
    },
    onError: (error) => {
      toast.error(`Failed to delete event: ${error.message}`);
    },
  });

  // Computed Values
  const filteredEvents = useMemo(() => {
    if (!searchQuery) return events;

    const query = searchQuery.toLowerCase();
    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        (event.location && event.location.toLowerCase().includes(query))
    );
  }, [events, searchQuery]);

  const stats = useMemo(() => {
    const totalEvents = events.length;
    const totalJobs = events.reduce(
      (sum, event) => sum + (event._count?.Job || 0),
      0
    );
    const totalApplications = events.reduce(
      (sum, event) => sum + (event.applicationCount || 0),
      0
    );

    return { totalEvents, totalJobs, totalApplications };
  }, [events]);

  // Sheet Handlers
  const openCreateSheet = () => {
    setFormMode("create");
    setFormData({
      title: "",
      description: "",
      bannerUrl: "",
      minimapUrl: "",
      date: "",
      location: "",
    });
    setFormSheetOpen(true);
  };

  const openEditSheet = (eventId: number) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    setFormMode("edit");
    setSelectedEventId(eventId);
    setFormData({
      title: event.title,
      description: event.description,
      bannerUrl: event.bannerUrl,
      minimapUrl: event.minimapUrl,
      date: new Date(event.date).toISOString().split("T")[0],
      location: event.location || "",
    });
    setFormSheetOpen(true);
  };

  const openDeleteSheet = (eventId: number) => {
    setSelectedEventId(eventId);
    setDeleteSheetOpen(true);
  };

  const openDetailSheet = (eventId: number) => {
    setSelectedEventId(eventId);
    setDetailSheetOpen(true);
  };

  const closeFormSheet = () => {
    setFormSheetOpen(false);
    setSelectedEventId(null);
    setFormData({
      title: "",
      description: "",
      bannerUrl: "",
      minimapUrl: "",
      date: "",
      location: "",
    });
  };

  const closeDeleteSheet = () => {
    setDeleteSheetOpen(false);
    setSelectedEventId(null);
  };

  const closeDetailSheet = () => {
    setDetailSheetOpen(false);
    setSelectedEventId(null);
  };

  // Form Handlers
  const handleFormSubmit = () => {
    if (formMode === "create") {
      createEventMutation.mutate({
        title: formData.title,
        description: formData.description,
        bannerUrl: formData.bannerUrl,
        minimapUrl: formData.minimapUrl,
        date: new Date(formData.date),
        location: formData.location,
      });
    } else {
      if (!selectedEventId) return;
      updateEventMutation.mutate({
        id: selectedEventId,
        title: formData.title,
        description: formData.description,
        bannerUrl: formData.bannerUrl,
        minimapUrl: formData.minimapUrl,
        date: new Date(formData.date),
        location: formData.location,
      });
    }
  };

  const handleDelete = () => {
    if (!selectedEventId) return;
    deleteEventMutation.mutate({ id: selectedEventId });
  };

  // Prepare detail sheet data - already has participatingCompanies from router
  const detailEvent: EventDetails | null = selectedEventDetails || null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-600">Loading events...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <EventsHeader onCreateClick={openCreateSheet} />

        <StatsCards
          totalEvents={stats.totalEvents}
          totalJobs={stats.totalJobs}
          totalApplications={stats.totalApplications}
        />

        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        <EventsGrid
          events={filteredEvents}
          onView={openDetailSheet}
          onEdit={openEditSheet}
          onDelete={openDeleteSheet}
        />

        {/* Form Sheet */}
        <EventFormSheet
          open={formSheetOpen}
          onOpenChange={setFormSheetOpen}
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleFormSubmit}
          isLoading={
            createEventMutation.isPending || updateEventMutation.isPending
          }
          mode={formMode}
        />

        {/* Delete Confirmation Sheet */}
        <DeleteConfirmSheet
          open={deleteSheetOpen}
          onOpenChange={setDeleteSheetOpen}
          event={
            selectedEventId
              ? events.find((e) => e.id === selectedEventId) || null
              : null
          }
          onConfirm={handleDelete}
          isLoading={deleteEventMutation.isPending}
        />

        {/* Detail Sheet */}
        <EventDetailSheet
          open={detailSheetOpen}
          onOpenChange={setDetailSheetOpen}
          event={detailEvent}
        />
      </div>
    </div>
  );
}
