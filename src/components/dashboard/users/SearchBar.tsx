import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  totalCount: number;
  blockedCount: number;
  placeholder: string;
}

export default function SearchBar({
  query,
  onQueryChange,
  totalCount,
  blockedCount,
  placeholder,
}: SearchBarProps) {
  return (
    <div className="flex items-center justify-between mb-4 gap-4">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          className="pl-10"
          placeholder={placeholder}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <Badge className="bg-indigo-50 text-indigo-700">
          Total {totalCount}
        </Badge>
        <Badge className="bg-amber-50 text-amber-700">
          Blocked {blockedCount}
        </Badge>
      </div>
    </div>
  );
}
