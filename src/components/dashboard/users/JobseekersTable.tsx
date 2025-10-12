import { Button } from "@/components/ui/button";
import { UserCheck, UserX, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface JobSeeker {
  id: string;
  email: string;
  is_blocked: boolean;
  createdAt: string | Date;
  JobSeekerProfile?: {
    fullName?: string | null;
    lastEducationLevel?: string | null;
  } | null;
}

interface JobseekersTableProps {
  jobseekers: JobSeeker[];
  onBlock: (jobseeker: JobSeeker) => void;
  onDelete: (jobseeker: JobSeeker) => void;
}

export default function JobseekersTable({
  jobseekers,
  onBlock,
  onDelete,
}: JobseekersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 text-slate-700 text-xs uppercase">
            <th className="px-4 py-3 text-left">Name</th>
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Education</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Joined</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {jobseekers.map((u) => (
            <tr key={u.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 text-sm">
                {u.JobSeekerProfile?.fullName || "N/A"}
              </td>
              <td className="px-4 py-3 text-sm">{u.email}</td>
              <td className="px-4 py-3 text-sm">
                {u.JobSeekerProfile?.lastEducationLevel || "N/A"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full ${
                    u.is_blocked
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {u.is_blocked ? (
                    <UserX className="h-3 w-3" />
                  ) : (
                    <UserCheck className="h-3 w-3" />
                  )}
                  {u.is_blocked ? "Blocked" : "Active"}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-sm">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" aria-label="Actions">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onBlock(u)}>
                      {u.is_blocked ? "Unblock" : "Block"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => onDelete(u)}
                      className="text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
          {jobseekers.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="text-center py-8 text-sm text-slate-500"
              >
                No jobseekers found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
