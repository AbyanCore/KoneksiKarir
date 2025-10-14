"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, DollarSign, Eye } from "lucide-react";

interface Job {
  id: number;
  title: string;
  location: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  tags: string[];
  _count?: {
    Application: number;
  };
}

interface JobsListProps {
  jobs: Job[];
  onViewApplications: (jobId: number, jobTitle: string) => void;
}

export default function JobsList({ jobs, onViewApplications }: JobsListProps) {
  if (jobs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">No jobs posted yet</p>
        <p className="text-sm text-gray-400 mt-2">
          Create your first job to start receiving applications
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <Card key={job.id} className="p-6 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{job.title}</h3>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {job.location}
                </div>

                {(job.salaryMin || job.salaryMax) && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {job.salaryMin && job.salaryMax
                      ? `Rp ${job.salaryMin.toLocaleString()} - Rp ${job.salaryMax.toLocaleString()}`
                      : job.salaryMin
                      ? `Rp ${job.salaryMin.toLocaleString()}+`
                      : `Up to Rp ${job.salaryMax?.toLocaleString()}`}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {job.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-blue-600 border-blue-600"
                >
                  {job._count?.Application || 0} Applications
                </Badge>
              </div>
            </div>

            <div className="ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewApplications(job.id, job.title)}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Applications
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
