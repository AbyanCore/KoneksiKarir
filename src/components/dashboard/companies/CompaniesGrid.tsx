import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Globe, Edit, Trash2, Eye } from "lucide-react";

interface Company {
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
}

interface CompaniesGridProps {
  companies: Company[];
  onView: (company: Company) => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export default function CompaniesGrid({
  companies,
  onView,
  onEdit,
  onDelete,
}: CompaniesGridProps) {
  if (companies.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <Building2 className="h-16 w-16 mx-auto text-slate-300 mb-4" />
        <p className="text-slate-600">
          No companies found matching your search.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {companies.map((company) => (
        <Card
          key={company.id}
          className="overflow-hidden hover:shadow-xl transition-all duration-300 border-slate-200 bg-white/90 backdrop-blur-sm"
        >
          <div className="relative h-32 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
            <div className="absolute inset-0 flex items-center justify-center">
              <Building2 className="h-10 w-10 text-slate-400" />
            </div>
          </div>

          <CardHeader>
            <CardTitle className="text-base line-clamp-1">
              {company.name}
            </CardTitle>
            <CardDescription className="line-clamp-2 text-xs">
              {company.description || "No description provided"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-2">
            <div className="flex items-center text-xs text-slate-600">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="line-clamp-1">
                {company.location || "Location not specified"}
              </span>
            </div>
            <div className="flex items-center text-xs text-slate-600">
              <Globe className="h-4 w-4 mr-2" />
              <span className="line-clamp-1">
                {company.website || "No website"}
              </span>
            </div>

            <div className="flex gap-1.5 pt-1">
              <Badge variant="secondary" className="text-xs">
                {company._count?.jobs || 0} Jobs
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {company._count?.EventCompanyParticipation || 0} Events
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {company.applicationCount || 0} Apps
              </Badge>
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onView(company)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button variant="outline" onClick={() => onEdit(company)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => onDelete(company)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
