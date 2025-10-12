"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { trpc } from "@/components/trpc/trpc-client";
import { toast } from "sonner";
import UsersHeader from "./UsersHeader";
import SearchBar from "./SearchBar";
import JobseekersTable from "./JobseekersTable";
import AdminCompaniesTable from "./AdminCompaniesTable";
import ConfirmDialog from "./ConfirmDialog";

export default function UsersManagement() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("jobseekers");

  // Fetch data using tRPC
  const { data: jobseekers = [], refetch: refetchJobSeekers } =
    trpc.users.findAllJobSeekers.useQuery();
  const { data: adminCompanies = [], refetch: refetchAdminCompanies } =
    trpc.users.findAllAdminCompanies.useQuery();

  // Mutations
  const toggleBlockMutation = trpc.users.toggleBlockAccount.useMutation();
  const deleteMutation = trpc.users.delete.useMutation();

  // confirmation dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | {
    type: "block" | "delete";
    subject: { kind: "jobseeker" | "companyAdmin"; data: any };
  }>(null);

  const displayedJobSeekers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobseekers;
    return jobseekers.filter((u) => {
      return (
        u.email.toLowerCase().includes(q) ||
        (u.JobSeekerProfile?.fullName || "").toLowerCase().includes(q) ||
        (u.JobSeekerProfile?.lastEducationLevel || "")
          .toLowerCase()
          .includes(q) ||
        (u.is_blocked ? "blocked" : "active").includes(q)
      );
    });
  }, [jobseekers, query]);

  const displayedAdminCompanies = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return adminCompanies;
    return adminCompanies.filter((u) => {
      return (
        u.email.toLowerCase().includes(q) ||
        (u.is_blocked ? "blocked" : "active").includes(q)
      );
    });
  }, [adminCompanies, query]);

  // generalized confirm opener
  const openConfirm = (
    type: "block" | "delete",
    kind: "jobseeker" | "companyAdmin",
    data: any
  ) => {
    setConfirmAction({ type, subject: { kind, data } });
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const { type, subject } = confirmAction;

    try {
      if (type === "block") {
        await toggleBlockMutation.mutateAsync({
          id: subject.data.id,
          isBlocked: !subject.data.is_blocked,
        });
        toast.success(
          subject.data.is_blocked
            ? "User unblocked successfully"
            : "User blocked successfully"
        );
      } else if (type === "delete") {
        await deleteMutation.mutateAsync({ id: subject.data.id });
        toast.success("User deleted successfully");
      }

      // Refetch data
      if (subject.kind === "jobseeker") {
        refetchJobSeekers();
      } else {
        refetchAdminCompanies();
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }

    setConfirmOpen(false);
    setConfirmAction(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <UsersHeader />

        <Card className="p-4">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(String(v))}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="jobseekers">Jobseekers</TabsTrigger>
              <TabsTrigger value="admin-companies">Admin Companies</TabsTrigger>
            </TabsList>

            <TabsContent value="jobseekers">
              <SearchBar
                query={query}
                onQueryChange={setQuery}
                totalCount={jobseekers.length}
                blockedCount={jobseekers.filter((u) => u.is_blocked).length}
                placeholder="Search jobseekers..."
              />

              <JobseekersTable
                jobseekers={displayedJobSeekers}
                onBlock={(u) => openConfirm("block", "jobseeker", u)}
                onDelete={(u) => openConfirm("delete", "jobseeker", u)}
              />
            </TabsContent>

            <TabsContent value="admin-companies">
              <SearchBar
                query={query}
                onQueryChange={setQuery}
                totalCount={adminCompanies.length}
                blockedCount={adminCompanies.filter((u) => u.is_blocked).length}
                placeholder="Search admins..."
              />

              <AdminCompaniesTable
                adminCompanies={displayedAdminCompanies}
                onBlock={(a) => openConfirm("block", "companyAdmin", a)}
                onDelete={(a) => openConfirm("delete", "companyAdmin", a)}
              />
            </TabsContent>
          </Tabs>
        </Card>

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={(open) => {
            setConfirmOpen(open);
            if (!open) setConfirmAction(null);
          }}
          onConfirm={handleConfirm}
          type={confirmAction?.type || null}
          isBlocked={confirmAction?.subject.data?.is_blocked}
          isLoading={toggleBlockMutation.isPending || deleteMutation.isPending}
        />
      </div>
    </div>
  );
}
