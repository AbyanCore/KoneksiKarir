import { Button } from "@/components/ui/button";
import { User, UserCheck, UserX, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface AdminCompany {
  id: string;
  email: string;
  is_blocked: boolean;
  createdAt: string | Date;
}

interface AdminCompaniesTableProps {
  adminCompanies: AdminCompany[];
  onBlock: (admin: AdminCompany) => void;
  onDelete: (admin: AdminCompany) => void;
}

export default function AdminCompaniesTable({
  adminCompanies,
  onBlock,
  onDelete,
}: AdminCompaniesTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 text-slate-700 text-xs uppercase">
            <th className="px-4 py-3 text-left">Email</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Joined</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {adminCompanies.map((a) => (
            <tr key={a.id} className="hover:bg-slate-50 transition-colors">
              <td className="px-4 py-3 text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                {a.email}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full ${
                    a.is_blocked
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {a.is_blocked ? (
                    <UserX className="h-3 w-3" />
                  ) : (
                    <UserCheck className="h-3 w-3" />
                  )}
                  {a.is_blocked ? "Blocked" : "Active"}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">
                {new Date(a.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-sm">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" aria-label="Actions">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onBlock(a)}>
                      {a.is_blocked ? "Unblock" : "Block"}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => onDelete(a)}
                      className="text-red-600"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
          {adminCompanies.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="text-center py-8 text-sm text-slate-500"
              >
                No admin companies found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
