"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { trpc } from "@/components/trpc/trpc-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Building2, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface JoinEventForm {
  standNumber: string;
}

export default function JoinEventDialog() {
  const [open, setOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const utils = trpc.useUtils();

  const { data: availableEvents, isLoading: isLoadingEvents } =
    trpc.events.getAvailableEvents.useQuery(undefined, {
      enabled: open,
    });

  const form = useForm<JoinEventForm>({
    defaultValues: {
      standNumber: "",
    },
  });

  const joinMutation = trpc.events.joinEvent.useMutation({
    onSuccess: () => {
      toast.success("Successfully joined event!");
      utils.companies.getMyCompanyDashboard.invalidate();
      utils.events.getAvailableEvents.invalidate();
      form.reset();
      setSelectedEventId(null);
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to join event");
    },
  });

  const onSubmit = (data: JoinEventForm) => {
    if (!selectedEventId) {
      toast.error("Please select an event");
      return;
    }

    joinMutation.mutate({
      eventId: selectedEventId,
      standNumber: data.standNumber,
    });
  };

  const handleSelectEvent = (eventId: number) => {
    setSelectedEventId(eventId);
  };

  const handleBack = () => {
    setSelectedEventId(null);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserPlus className="h-4 w-4 mr-2" />
          Join Event
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedEventId ? "Enter Stand Number" : "Join an Event"}
          </DialogTitle>
          <DialogDescription>
            {selectedEventId
              ? "Choose your booth/stand number for this event"
              : "Select an event to participate in"}
          </DialogDescription>
        </DialogHeader>

        {!selectedEventId ? (
          // Event selection view
          <div className="space-y-4">
            {isLoadingEvents ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : availableEvents && availableEvents.length > 0 ? (
              <div className="grid gap-4">
                {availableEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleSelectEvent(event.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />
                            {format(new Date(event.date), "PPP")}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {event._count.EventCompanyParticipation} companies
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">Available</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarDays className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  No available events at the moment
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  You're already participating in all upcoming events
                </p>
              </div>
            )}
          </div>
        ) : (
          // Stand number form view
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="standNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stand/Booth Number *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. A-101, B-23, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter your assigned booth or stand number for this event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={joinMutation.isPending}
                >
                  Back
                </Button>
                <Button type="submit" disabled={joinMutation.isPending}>
                  {joinMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Join Event
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
