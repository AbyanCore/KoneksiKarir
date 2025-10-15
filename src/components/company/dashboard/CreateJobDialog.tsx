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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CreateJobDialogProps {
  events: Array<{
    id: number;
    title: string;
  }>;
}

interface CreateJobForm {
  title: string;
  description: string;
  location: string;
  tags: string;
  salaryMin: string;
  salaryMax: string;
  isRemote: boolean;
  eventId: string;
}

export default function CreateJobDialog({ events }: CreateJobDialogProps) {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const form = useForm<CreateJobForm>({
    defaultValues: {
      title: "",
      description: "",
      location: "",
      tags: "",
      salaryMin: "",
      salaryMax: "",
      isRemote: false,
      eventId: "",
    },
  });

  const createMutation = trpc.jobs.create.useMutation({
    onSuccess: () => {
      toast.success("Job created successfully!");
      utils.companies.getMyCompanyDashboard.invalidate();
      form.reset();
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create job");
    },
  });

  const onSubmit = (data: CreateJobForm) => {
    createMutation.mutate({
      title: data.title,
      description: data.description || undefined,
      location: data.location || undefined,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [],
      salaryMin: data.salaryMin ? parseInt(data.salaryMin) : undefined,
      salaryMax: parseInt(data.salaryMax),
      isRemote: data.isRemote,
      eventId: parseInt(data.eventId),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create New Job
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job Posting</DialogTitle>
          <DialogDescription>
            Post a new job for one of your participating events
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="eventId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an event" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    You can only post jobs for events you're participating in
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Frontend Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the role, responsibilities, and requirements..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Jakarta, Indonesia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skills/Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. React, TypeScript, Node.js (comma-separated)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Separate multiple tags with commas
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="salaryMin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Salary</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 5000000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salaryMax"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Salary *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g. 10000000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isRemote"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Remote Work</FormLabel>
                    <FormDescription>
                      This job can be done remotely
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                Create Job
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
