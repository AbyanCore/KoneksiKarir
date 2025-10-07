"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  MapPin,
  Calendar,
  Search,
  Briefcase,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";
import Image from "next/image";

// Mock data - replace with actual API call
const mockEvents = [
  {
    id: 1,
    title: "Tech Career Fair 2024",
    description:
      "Join us for the biggest tech career fair of the year! Meet with top companies and find your dream job.",
    date: new Date("2024-03-15"),
    location: "Jakarta Convention Center",
    minimapUrl: "/placeholder-minimap.jpg",
    companies: [
      {
        id: 1,
        name: "Tech Corp Indonesia",
        standNumber: "A-101",
        logoUrl: "/placeholder-logo.jpg",
        jobCount: 5,
        jobs: [
          {
            id: 1,
            title: "Frontend Developer",
            tags: ["React", "TypeScript", "Tailwind"],
            salaryMin: 8000000,
            salaryMax: 15000000,
            applicationCount: 23,
          },
          {
            id: 2,
            title: "Backend Developer",
            tags: ["Node.js", "PostgreSQL", "Express"],
            salaryMin: 10000000,
            salaryMax: 18000000,
            applicationCount: 31,
          },
          {
            id: 3,
            title: "Full Stack Developer",
            tags: ["React", "Node.js", "MongoDB"],
            salaryMin: 12000000,
            salaryMax: 20000000,
            applicationCount: 45,
          },
        ],
      },
      {
        id: 2,
        name: "Digital Solutions Ltd",
        standNumber: "A-102",
        logoUrl: "/placeholder-logo.jpg",
        jobCount: 3,
        jobs: [
          {
            id: 4,
            title: "UI/UX Designer",
            tags: ["Figma", "Adobe XD", "Design System"],
            salaryMin: 7000000,
            salaryMax: 12000000,
            applicationCount: 18,
          },
          {
            id: 5,
            title: "Product Manager",
            tags: ["Agile", "Scrum", "Product Strategy"],
            salaryMin: 15000000,
            salaryMax: 25000000,
            applicationCount: 27,
          },
        ],
      },
      {
        id: 3,
        name: "Innovation Systems",
        standNumber: "B-201",
        logoUrl: "/placeholder-logo.jpg",
        jobCount: 8,
        jobs: [
          {
            id: 6,
            title: "DevOps Engineer",
            tags: ["Docker", "Kubernetes", "AWS"],
            salaryMin: 12000000,
            salaryMax: 22000000,
            applicationCount: 34,
          },
          {
            id: 7,
            title: "Data Scientist",
            tags: ["Python", "Machine Learning", "TensorFlow"],
            salaryMin: 14000000,
            salaryMax: 25000000,
            applicationCount: 52,
          },
        ],
      },
      {
        id: 4,
        name: "Future Technologies",
        standNumber: "B-202",
        logoUrl: "/placeholder-logo.jpg",
        jobCount: 4,
        jobs: [
          {
            id: 8,
            title: "Mobile Developer",
            tags: ["React Native", "iOS", "Android"],
            salaryMin: 9000000,
            salaryMax: 16000000,
            applicationCount: 29,
          },
        ],
      },
      {
        id: 5,
        name: "Smart Solutions Inc",
        standNumber: "C-301",
        logoUrl: "/placeholder-logo.jpg",
        jobCount: 6,
        jobs: [
          {
            id: 9,
            title: "QA Engineer",
            tags: ["Selenium", "Testing", "Automation"],
            salaryMin: 7000000,
            salaryMax: 13000000,
            applicationCount: 16,
          },
          {
            id: 10,
            title: "Security Engineer",
            tags: ["Cybersecurity", "Penetration Testing", "SIEM"],
            salaryMin: 13000000,
            salaryMax: 23000000,
            applicationCount: 38,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Digital Innovation Summit 2024",
    description:
      "Explore cutting-edge digital solutions and connect with innovative companies.",
    date: new Date("2024-04-20"),
    location: "Surabaya Expo Center",
    minimapUrl: "/placeholder-minimap.jpg",
    companies: [
      {
        id: 6,
        name: "Startup Hub Indonesia",
        standNumber: "D-401",
        logoUrl: "/placeholder-logo.jpg",
        jobCount: 4,
        jobs: [
          {
            id: 11,
            title: "Growth Hacker",
            tags: ["Marketing", "Analytics", "SEO"],
            salaryMin: 8000000,
            salaryMax: 14000000,
            applicationCount: 21,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Finance & Banking Job Fair 2024",
    description:
      "Meet leading financial institutions and explore career opportunities in finance.",
    date: new Date("2024-05-10"),
    location: "Bandung Convention Hall",
    minimapUrl: "/placeholder-minimap.jpg",
    companies: [
      {
        id: 7,
        name: "Global Bank Indonesia",
        standNumber: "E-501",
        logoUrl: "/placeholder-logo.jpg",
        jobCount: 3,
        jobs: [
          {
            id: 12,
            title: "Financial Analyst",
            tags: ["Finance", "Analysis", "Excel"],
            salaryMin: 10000000,
            salaryMax: 18000000,
            applicationCount: 35,
          },
        ],
      },
    ],
  },
];

// Sort events by date (timeline)
const sortedEvents = [...mockEvents].sort(
  (a, b) => a.date.getTime() - b.date.getTime()
);

const formatSalary = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function Page_Hub() {
  const [selectedEventId, setSelectedEventId] = useState<number>(
    sortedEvents[0].id
  );
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get current event
  const currentEvent =
    sortedEvents.find((event) => event.id === selectedEventId) ||
    sortedEvents[0];

  // Filter companies based on search query (including job names and tags)
  const filteredCompanies = currentEvent.companies.filter((company) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = company.name.toLowerCase().includes(query);
    const standMatch = company.standNumber.toLowerCase().includes(query);
    const jobMatch = company.jobs.some(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.tags.some((tag) => tag.toLowerCase().includes(query))
    );
    return nameMatch || standMatch || jobMatch;
  });

  // Auto-expand company if search matches a job
  const shouldAutoExpand = (companyId: number) => {
    if (!searchQuery) return false;
    const company = currentEvent.companies.find((c) => c.id === companyId);
    if (!company) return false;
    const query = searchQuery.toLowerCase();
    return company.jobs.some(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  };

  const handleCompanyClick = (companyId: number) => {
    setSelectedCompany(selectedCompany === companyId ? null : companyId);
  };

  // Calculate total applications for a company
  const getCompanyApplicationCount = (
    company: (typeof currentEvent.companies)[0]
  ) => {
    return company.jobs.reduce((sum, job) => sum + job.applicationCount, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-full">
        {/* Event Information */}
        <div className="bg-white/90 backdrop-blur-sm px-4 py-4 border-b border-slate-200">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700"
              >
                Live Event
              </Badge>
              <Select
                value={selectedEventId.toString()}
                onValueChange={(value) => {
                  setSelectedEventId(parseInt(value));
                  setSelectedCompany(null);
                  setSearchQuery("");
                }}
              >
                <SelectTrigger className="w-[200px] border-purple-300 focus:ring-purple-400">
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  {sortedEvents.map((event) => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{event.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {event.date.toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {currentEvent.title}
            </h1>
            <p className="text-base text-muted-foreground mb-3">
              {currentEvent.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span>
                  {currentEvent.date.toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-600" />
                <span>{currentEvent.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Minimap */}
        <div className="bg-white/90 backdrop-blur-sm px-4 py-4 border-b border-slate-200">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-2">Event Map</h2>
            <p className="text-sm text-muted-foreground mb-3">
              Tap on company booths to view details
            </p>
            <div className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden shadow-lg">
              <Image
                src={currentEvent.minimapUrl}
                alt="Event minimap"
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <MapPin className="h-16 w-16" />
              </div>
            </div>
          </div>
        </div>

        {/* Participating Companies */}
        <div className="bg-white/90 backdrop-blur-sm px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Participating Companies</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {currentEvent.companies.length} companies with{" "}
              {currentEvent.companies.reduce(
                (sum, company) => sum + company.jobCount,
                0
              )}{" "}
              job openings
            </p>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by company name, stand number, job title, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 py-5 bg-white border-slate-300 focus:border-purple-400 focus:ring-purple-400"
              />
            </div>

            {/* Results Count */}
            {searchQuery && (
              <p className="text-sm text-muted-foreground mb-3">
                Found {filteredCompanies.length} result
                {filteredCompanies.length !== 1 ? "s" : ""}
              </p>
            )}

            {/* Companies List */}
            <div className="space-y-3">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map((company) => {
                  const isExpanded =
                    selectedCompany === company.id ||
                    shouldAutoExpand(company.id);
                  const totalApplications = getCompanyApplicationCount(company);

                  return (
                    <div key={company.id}>
                      <div
                        className={`cursor-pointer transition-all p-4 rounded-xl hover:bg-purple-50 hover:shadow-md ${
                          isExpanded
                            ? "bg-purple-50 border-2 border-purple-300 shadow-md"
                            : "bg-slate-50"
                        }`}
                        onClick={() => handleCompanyClick(company.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative w-16 h-16 bg-white rounded-xl flex-shrink-0 overflow-hidden shadow-sm border border-slate-200">
                            <Image
                              src={company.logoUrl}
                              alt={company.name}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = "none";
                              }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Building2 className="h-8 w-8 text-slate-400" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg truncate mb-1">
                              {company.name}
                            </h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant="outline"
                                className="border-blue-300 text-blue-700"
                              >
                                Stand {company.standNumber}
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="bg-purple-100 text-purple-700"
                              >
                                {company.jobCount} jobs available
                              </Badge>
                              <Badge
                                variant="secondary"
                                className="bg-orange-100 text-orange-700 border border-orange-200"
                              >
                                <Users className="h-3 w-3 mr-1" />
                                {totalApplications} applicants
                              </Badge>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-purple-600" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Expanded Job Details */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-purple-200 space-y-3">
                            <h4 className="font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2">
                              <Briefcase className="h-4 w-4 text-purple-600" />
                              Available Positions
                            </h4>
                            {company.jobs.map((job) => (
                              <div
                                key={job.id}
                                className="bg-white p-3 rounded-lg border border-slate-200 hover:border-purple-300 transition-colors"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h5 className="font-semibold text-base">
                                    {job.title}
                                  </h5>
                                  <Badge
                                    variant="outline"
                                    className="text-xs border-orange-300 text-orange-700 bg-orange-50"
                                  >
                                    <Users className="h-3 w-3 mr-1" />
                                    {job.applicationCount} applied
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {job.tags.map((tag, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="text-xs bg-blue-50 text-blue-700 border border-blue-200"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                  <DollarSign className="h-4 w-4 text-green-600" />
                                  <span className="font-medium">
                                    {formatSalary(job.salaryMin)} -{" "}
                                    {formatSalary(job.salaryMax)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    No companies found matching "{searchQuery}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
