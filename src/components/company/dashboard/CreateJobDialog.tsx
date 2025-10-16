"use client";

import { useState, useMemo } from "react";
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
import { Plus, Loader2, X } from "lucide-react";
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
      salaryMin: "",
      salaryMax: "",
      isRemote: false,
      eventId: "",
    },
  });

  // Tag editor state (better UX than comma-separated)
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (!tags.includes(t)) setTags((s) => [...s, t]);
    setTagInput("");
  };
  const removeTag = (t: string) => setTags((s) => s.filter((x) => x !== t));
  const onTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Escape") {
      setTagInput("");
    }
  };

  // Salary states keep numeric values for submission, display formatted string
  const [salaryMinRaw, setSalaryMinRaw] = useState<number | undefined>(
    undefined
  );
  const [salaryMaxRaw, setSalaryMaxRaw] = useState<number | undefined>(
    undefined
  );
  const formatRupiah = (value?: number) =>
    value == null
      ? ""
      : new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(value);

  const onSalaryInputChange = (
    setter: (v: number | undefined) => void,
    val: string
  ) => {
    // keep only digits
    const digits = val.replace(/[^\d]/g, "");
    const num = digits ? parseInt(digits, 10) : undefined;
    setter(num);
  };

  // Derived: whether form is valid enough to submit
  const isCreateDisabled = useMemo(() => {
    const title = form.getValues("title").trim();
    const eventId = form.getValues("eventId");
    const max = salaryMaxRaw;
    return !title || !eventId || !max;
  }, [form, salaryMaxRaw]);

  const createMutation = trpc.jobs.create.useMutation({
    onSuccess: () => {
      toast.success("Job created successfully!");
      utils.companies.getMyCompanyDashboard.invalidate();
      form.reset();
      setTags([]);
      setOpen(false);
      setSalaryMinRaw(undefined);
      setSalaryMaxRaw(undefined);
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
      tags: tags,
      salaryMin: salaryMinRaw ?? undefined,
      salaryMax: salaryMaxRaw ?? 0,
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

            {/* Tag editor */}
            <FormItem>
              <FormLabel>Skills / Tags</FormLabel>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Type a skill and press Enter or click Add"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={onTagKeyDown}
                />
                <Button
                  type="button"
                  onClick={addTag}
                  disabled={!tagInput.trim()}
                >
                  Add
                </Button>
              </div>
              <FormDescription>
                Press Enter to add tag. Click a tag to remove it.
              </FormDescription>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((t) => (
                  <div
                    key={t}
                    className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-sm"
                  >
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(t)}
                      className="inline-flex items-center justify-center p-1 rounded-full hover:bg-slate-200"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </FormItem>

            <div className="grid grid-cols-2 gap-4">
              <FormItem>
                <FormLabel>Minimum Salary (Rp)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. 5000000"
                    value={
                      salaryMinRaw != null ? formatRupiah(salaryMinRaw) : ""
                    }
                    onFocus={(e) => {
                      // show raw digits on focus
                      e.currentTarget.value =
                        salaryMinRaw != null ? String(salaryMinRaw) : "";
                    }}
                    onChange={(e) =>
                      onSalaryInputChange(setSalaryMinRaw, e.target.value)
                    }
                    onBlur={(e) => {
                      // format after blur
                      const digits = e.currentTarget.value.replace(
                        /[^\d]/g,
                        ""
                      );
                      setSalaryMinRaw(
                        digits ? parseInt(digits, 10) : undefined
                      );
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Optional. Leave empty if not applicable.
                </FormDescription>
              </FormItem>

              <FormItem>
                <FormLabel>Maximum Salary (Rp) *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. 10000000"
                    value={
                      salaryMaxRaw != null ? formatRupiah(salaryMaxRaw) : ""
                    }
                    onFocus={(e) => {
                      e.currentTarget.value =
                        salaryMaxRaw != null ? String(salaryMaxRaw) : "";
                    }}
                    onChange={(e) =>
                      onSalaryInputChange(setSalaryMaxRaw, e.target.value)
                    }
                    onBlur={(e) => {
                      const digits = e.currentTarget.value.replace(
                        /[^\d]/g,
                        ""
                      );
                      setSalaryMaxRaw(
                        digits ? parseInt(digits, 10) : undefined
                      );
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
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
                onClick={() => {
                  setOpen(false);
                }}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || isCreateDisabled}
              >
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
