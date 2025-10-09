"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  Globe,
  MapPin,
  Briefcase,
  Calendar,
  Users,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type Company = {
  id: number;
  name: string;
  description: string;
  website: string;
  location: string;
  logoUrl: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
  // Stats for display
  jobCount?: number;
  eventCount?: number;
  applicationCount?: number;
  // Events participation
  participatingEvents?: Array<{
    id: number;
    title: string;
    standNumber: string;
    date: Date;
    jobs?: Array<{
      id: number;
      title: string;
      applicants: number;
    }>;
  }>;
};

export default function Page_AdminCompanies() {
  // Mock data based on Prisma schema
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: 1,
      name: "Tech Corp Indonesia",
      description:
        "Leading technology company specializing in software development and digital transformation solutions.",
      website: "https://techcorp.id",
      location: "Jakarta, Indonesia",
      logoUrl: "/logos/techcorp.png",
      code: "ABC123",
      createdAt: new Date("2024-01-05"),
      updatedAt: new Date("2024-01-05"),
      jobCount: 12,
      eventCount: 2,
      applicationCount: 87,
      participatingEvents: [
        {
          id: 1,
          title: "Tech Career Fair 2024",
          standNumber: "A-101",
          date: new Date("2024-06-15"),
          jobs: [
            { id: 1, title: "Frontend Developer", applicants: 24 },
            { id: 2, title: "Backend Developer", applicants: 18 },
            { id: 3, title: "UI/UX Designer", applicants: 15 },
          ],
        },
        {
          id: 2,
          title: "BioTech Career Fair 2025",
          standNumber: "B-205",
          date: new Date("2025-03-20"),
          jobs: [
            { id: 4, title: "Full Stack Developer", applicants: 12 },
            { id: 5, title: "DevOps Engineer", applicants: 8 },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Digital Solutions Ltd",
      description:
        "Innovative digital agency providing cutting-edge web and mobile solutions for businesses.",
      website: "https://digitalsolutions.com",
      location: "Bandung, Indonesia",
      logoUrl: "/logos/digitalsolutions.png",
      code: "XYZ789",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
      jobCount: 8,
      eventCount: 1,
      applicationCount: 54,
      participatingEvents: [
        {
          id: 1,
          title: "Tech Career Fair 2024",
          standNumber: "A-102",
          date: new Date("2024-06-15"),
          jobs: [
            { id: 6, title: "Mobile Developer", applicants: 16 },
            { id: 7, title: "Product Designer", applicants: 11 },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Innovation Systems",
      description:
        "Enterprise software solutions provider with focus on cloud computing and AI technologies.",
      website: "https://innovationsystems.io",
      location: "Surabaya, Indonesia",
      logoUrl: "/logos/innovation.png",
      code: "B201",
      createdAt: new Date("2024-02-10"),
      updatedAt: new Date("2024-02-10"),
      jobCount: 15,
      eventCount: 2,
      applicationCount: 112,
      participatingEvents: [
        {
          id: 1,
          title: "Tech Career Fair 2024",
          standNumber: "B-201",
          date: new Date("2024-06-15"),
        },
        {
          id: 3,
          title: "Finance & Banking Expo 2024",
          standNumber: "D-401",
          date: new Date("2024-09-10"),
        },
      ],
    },
    {
      id: 4,
      name: "Cloud Innovations",
      description:
        "Cloud infrastructure and DevOps solutions provider helping businesses scale efficiently.",
      website: "https://cloudinnovations.co",
      location: "Yogyakarta, Indonesia",
      logoUrl: "/logos/cloud.png",
      code: "A103",
      createdAt: new Date("2024-02-15"),
      updatedAt: new Date("2024-02-15"),
      jobCount: 5,
      eventCount: 1,
      applicationCount: 32,
      participatingEvents: [
        {
          id: 1,
          title: "Tech Career Fair 2024",
          standNumber: "A-103",
          date: new Date("2024-06-15"),
        },
      ],
    },
    {
      id: 5,
      name: "Data Analytics Pro",
      description:
        "Data science and analytics consultancy delivering insights through advanced analytics and machine learning.",
      website: "https://dataanalytics.pro",
      location: "Bali, Indonesia",
      logoUrl: "/logos/dataanalytics.png",
      code: "B202",
      createdAt: new Date("2024-03-01"),
      updatedAt: new Date("2024-03-01"),
      jobCount: 7,
      eventCount: 1,
      applicationCount: 45,
      participatingEvents: [
        {
          id: 1,
          title: "Tech Career Fair 2024",
          standNumber: "B-202",
          date: new Date("2024-06-15"),
        },
      ],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    location: "",
    logoUrl: "",
    code: "",
  });

  // Filter companies by search query
  const filteredCompanies = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return companies;
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(query) ||
        company.code.toLowerCase().includes(query) ||
        company.location.toLowerCase().includes(query) ||
        company.description.toLowerCase().includes(query)
    );
  }, [companies, searchQuery]);

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      website: "",
      location: "",
      logoUrl: "",
      code: "",
    });
  };

  // Generate random 6-character code
  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, code });
  };

  const toggleEventExpand = (eventId: number) => {
    setExpandedEvents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };

  // Create company
  const handleCreate = () => {
    const newCompany: Company = {
      id: Math.max(...companies.map((c) => c.id), 0) + 1,
      name: formData.name,
      description: formData.description,
      website: formData.website,
      location: formData.location,
      logoUrl: formData.logoUrl,
      code: formData.code.toUpperCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
      jobCount: 0,
      eventCount: 0,
      applicationCount: 0,
      participatingEvents: [],
    };
    setCompanies([...companies, newCompany]);
    setIsCreateOpen(false);
    resetForm();
  };

  // Edit company
  const handleEdit = () => {
    if (!selectedCompany) return;
    const updatedCompanies = companies.map((company) =>
      company.id === selectedCompany.id
        ? {
            ...company,
            name: formData.name,
            description: formData.description,
            website: formData.website,
            location: formData.location,
            logoUrl: formData.logoUrl,
            code: formData.code.toUpperCase(),
            updatedAt: new Date(),
          }
        : company
    );
    setCompanies(updatedCompanies);
    setIsEditOpen(false);
    setSelectedCompany(null);
    resetForm();
  };

  // Delete company
  const handleDelete = () => {
    if (!selectedCompany) return;
    setCompanies(
      companies.filter((company) => company.id !== selectedCompany.id)
    );
    setIsDeleteOpen(false);
    setSelectedCompany(null);
  };

  // Open edit sheet
  const openEdit = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      description: company.description,
      website: company.website,
      location: company.location,
      logoUrl: company.logoUrl,
      code: company.code,
    });
    setIsEditOpen(true);
  };

  // Open delete sheet
  const openDelete = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteOpen(true);
  };

  // Open detail sheet
  const openDetail = (company: Company) => {
    setSelectedCompany(company);
    setExpandedEvents(new Set()); // Reset expanded events
    setIsDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="relative rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 opacity-90 blur-lg transform -skew-y-1 scale-105"></div>
          <div className="relative px-4 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Companies Management
                </h1>
                <p className="mt-0.5 text-xs opacity-90">
                  Manage company registrations and profiles
                </p>
              </div>
              <Button
                onClick={() => {
                  resetForm();
                  setIsCreateOpen(true);
                }}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {/* Total Companies card */}
          <Card className="bg-transparent rounded-lg overflow-hidden transform hover:scale-[1.01] transition bg-gradient-to-br from-indigo-50 to-indigo-100">
            <div className="px-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg text-white shadow">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">
                      Total Companies
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {companies.length}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-green-600 font-medium">+5%</div>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Registered companies
              </p>
            </div>
          </Card>

          {/* Total Jobs card */}
          <Card className="bg-transparent rounded-lg overflow-hidden transform hover:scale-[1.01] transition bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="px-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-2 rounded-lg text-white shadow">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Total Jobs</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {companies.reduce((sum, c) => sum + (c.jobCount || 0), 0)}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-purple-600 font-medium">+12%</div>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Posted by all companies
              </p>
            </div>
          </Card>

          {/* Applications card */}
          <Card className="bg-transparent rounded-lg overflow-hidden transform hover:scale-[1.01] transition bg-gradient-to-br from-pink-50 to-pink-100">
            <div className="px-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-pink-600 to-rose-600 p-2 rounded-lg text-white shadow">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Applications</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {companies.reduce(
                        (sum, c) => sum + (c.applicationCount || 0),
                        0
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-pink-600 font-medium">+18%</div>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Total applications received
              </p>
            </div>
          </Card>
        </div>

        {/* Search Input */}
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
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
                  {company.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2">
                <div className="flex items-center text-xs text-slate-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="line-clamp-1">{company.location}</span>
                </div>
                <div className="flex items-center text-xs text-slate-600">
                  <Globe className="h-4 w-4 mr-2" />
                  <span className="line-clamp-1">{company.website}</span>
                </div>

                <div className="flex gap-1.5 pt-1">
                  <Badge variant="secondary" className="text-xs">
                    {company.jobCount || 0} Jobs
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {company.eventCount || 0} Events
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {company.applicationCount || 0} Apps
                  </Badge>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => openDetail(company)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" onClick={() => openEdit(company)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => openDelete(company)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredCompanies.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Building2 className="h-16 w-16 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-600">
                No companies found matching your search.
              </p>
            </div>
          )}
        </div>

        {/* Detail Sheet */}
        <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-xl">Company Details</SheetTitle>
              <SheetDescription>
                Complete information about this company
              </SheetDescription>
            </SheetHeader>

            {selectedCompany && (
              <div className="space-y-4 p-4">
                <div className="relative h-40 rounded-lg bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-slate-400" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h3 className="font-semibold text-base">
                      {selectedCompany.name}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600">
                    {selectedCompany.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                    <span className="font-medium mr-2">Location:</span>
                    <span className="text-slate-600">
                      {selectedCompany.location}
                    </span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Globe className="h-4 w-4 mr-2 text-slate-500" />
                    <span className="font-medium mr-2">Website:</span>
                    <a
                      href={selectedCompany.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {selectedCompany.website}
                    </a>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <h4 className="font-semibold mb-2 text-sm">Statistics</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="bg-indigo-50">
                      <CardContent className="p-3 text-center">
                        <p className="text-xl font-bold text-indigo-600">
                          {selectedCompany.jobCount || 0}
                        </p>
                        <p className="text-xs text-slate-600">Jobs Posted</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-purple-50">
                      <CardContent className="p-3 text-center">
                        <p className="text-xl font-bold text-purple-600">
                          {selectedCompany.eventCount || 0}
                        </p>
                        <p className="text-xs text-slate-600">Events</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-pink-50">
                      <CardContent className="p-3 text-center">
                        <p className="text-xl font-bold text-pink-600">
                          {selectedCompany.applicationCount || 0}
                        </p>
                        <p className="text-xs text-slate-600">Applications</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Participating Events Section with Accordion */}
                {selectedCompany.participatingEvents &&
                  selectedCompany.participatingEvents.length > 0 && (
                    <div className="border-t pt-3">
                      <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Participating in Events (
                        {selectedCompany.participatingEvents.length})
                      </h4>
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {selectedCompany.participatingEvents.map((event) => (
                          <Collapsible
                            key={event.id}
                            open={expandedEvents.has(event.id)}
                            onOpenChange={() => toggleEventExpand(event.id)}
                          >
                            <Card className="bg-slate-50 hover:bg-slate-100 transition-colors">
                              <CollapsibleTrigger asChild>
                                <CardContent className="p-3 cursor-pointer">
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        {expandedEvents.has(event.id) ? (
                                          <ChevronDown className="h-4 w-4 text-slate-500" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4 text-slate-500" />
                                        )}
                                        <p className="font-semibold text-sm text-slate-900">
                                          {event.title}
                                        </p>
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          Stand {event.standNumber}
                                        </Badge>
                                      </div>
                                      <p className="text-xs text-slate-600 mt-0.5 ml-6">
                                        {event.date.toLocaleDateString(
                                          "id-ID",
                                          {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                          }
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </CollapsibleTrigger>

                              <CollapsibleContent>
                                <CardContent className="px-3 pb-3 pt-0">
                                  <div className="ml-6 border-l-2 border-indigo-200 pl-3 space-y-2">
                                    <p className="text-xs font-semibold text-slate-700 mb-2">
                                      Posted Jobs ({event.jobs?.length || 0})
                                    </p>
                                    {event.jobs && event.jobs.length > 0 ? (
                                      event.jobs.map((job) => (
                                        <div
                                          key={job.id}
                                          className="bg-white rounded p-2 flex items-center justify-between"
                                        >
                                          <div className="flex items-center gap-2">
                                            <Briefcase className="h-3 w-3 text-indigo-500" />
                                            <span className="text-xs font-medium text-slate-900">
                                              {job.title}
                                            </span>
                                          </div>
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {job.applicants} applicants
                                          </Badge>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-xs text-slate-500 italic">
                                        No jobs posted for this event yet
                                      </p>
                                    )}
                                  </div>
                                </CardContent>
                              </CollapsibleContent>
                            </Card>
                          </Collapsible>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="border-t pt-3 text-xs text-slate-500">
                  <p>Created: {selectedCompany.createdAt.toLocaleString()}</p>
                  <p>Updated: {selectedCompany.updatedAt.toLocaleString()}</p>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>

        {/* Create Sheet */}
        <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Add New Company</SheetTitle>
              <SheetDescription>
                Register a new company to the system
              </SheetDescription>
            </SheetHeader>

            <div className="grid gap-3 p-4">
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm">
                  Company Name
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Tech Corp Indonesia"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="code" className="text-sm">
                  Secret Company Code (6 characters)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    type="password"
                    placeholder="••••••"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    maxLength={6}
                    className="flex-1 font-mono tracking-widest"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateRandomCode}
                    className="shrink-0"
                  >
                    Generate
                  </Button>
                </div>
                {formData.code && (
                  <p className="text-xs text-slate-500 mt-1">
                    Code:{" "}
                    <span className="font-mono font-semibold">
                      {formData.code}
                    </span>
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description" className="text-sm">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the company..."
                  rows={2}
                  className="text-sm"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="website" className="text-sm">
                    Website
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="location" className="text-sm">
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g., Jakarta, Indonesia"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="logoUrl" className="text-sm">
                  Logo URL
                </Label>
                <Input
                  id="logoUrl"
                  placeholder="/logos/company.png"
                  value={formData.logoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, logoUrl: e.target.value })
                  }
                />
              </div>
            </div>

            <SheetFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  !formData.name ||
                  !formData.code ||
                  formData.code.length !== 6 ||
                  !formData.description ||
                  !formData.location
                }
                className="bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                Add Company
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Edit Sheet */}
        <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
          <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Edit Company</SheetTitle>
              <SheetDescription>Update company information</SheetDescription>
            </SheetHeader>

            <div className="grid gap-3 p-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name" className="text-sm">
                  Company Name
                </Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-code" className="text-sm">
                  Secret Company Code (6 characters)
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-code"
                    type="password"
                    placeholder="••••••"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    maxLength={6}
                    className="flex-1 font-mono tracking-widest"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateRandomCode}
                    className="shrink-0"
                  >
                    Generate
                  </Button>
                </div>
                {formData.code && (
                  <p className="text-xs text-slate-500 mt-1">
                    Code:{" "}
                    <span className="font-mono font-semibold">
                      {formData.code}
                    </span>
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description" className="text-sm">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  rows={2}
                  className="text-sm"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-website" className="text-sm">
                    Website
                  </Label>
                  <Input
                    id="edit-website"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-location" className="text-sm">
                    Location
                  </Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-logoUrl" className="text-sm">
                  Logo URL
                </Label>
                <Input
                  id="edit-logoUrl"
                  value={formData.logoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, logoUrl: e.target.value })
                  }
                />
              </div>
            </div>

            <SheetFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleEdit}
                disabled={
                  !formData.name ||
                  !formData.code ||
                  formData.code.length !== 6 ||
                  !formData.description ||
                  !formData.location
                }
                className="bg-gradient-to-r from-indigo-600 to-purple-600"
              >
                Save Changes
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>

        {/* Delete Confirmation Sheet */}
        <Sheet open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Delete Company</SheetTitle>
              <SheetDescription>
                Are you sure you want to delete this company? This action cannot
                be undone.
              </SheetDescription>
            </SheetHeader>

            {selectedCompany && (
              <div className="p-4">
                <p className="font-semibold text-sm">{selectedCompany.name}</p>
                <p className="text-sm text-slate-600 mt-1">
                  {selectedCompany.location}
                </p>
              </div>
            )}

            <SheetFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete Company
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
