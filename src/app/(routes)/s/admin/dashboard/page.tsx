"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Briefcase,
  Users,
  FileText,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Tooltip as RechartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { DownloadCloud } from "lucide-react";

export default function Page_AdminDashboard() {
  // Mock data based on prisma/schema.prisma
  const mockUsers = [
    {
      id: "u1",
      email: "alice@example.com",
      role: "JOB_SEEKER",
      createdAt: new Date("2024-01-10"),
    },
    {
      id: "u2",
      email: "bob@example.com",
      role: "JOB_SEEKER",
      createdAt: new Date("2024-02-02"),
    },
    {
      id: "u3",
      email: "carol@company.com",
      role: "ADMIN_COMPANY",
      createdAt: new Date("2024-01-20"),
    },
    {
      id: "u4",
      email: "dave@company.com",
      role: "ADMIN_COMPANY",
      createdAt: new Date("2024-03-01"),
    },
  ];

  const mockCompanies = [
    {
      id: 1,
      name: "Tech Corp Indonesia",
      code: "A101",
      createdAt: new Date("2024-01-05"),
    },
    {
      id: 2,
      name: "Digital Solutions Ltd",
      code: "A102",
      createdAt: new Date("2024-01-15"),
    },
    {
      id: 3,
      name: "Innovation Systems",
      code: "B201",
      createdAt: new Date("2024-02-10"),
    },
  ];

  const mockEvents = [
    { id: 1, title: "Tech Career Fair 2024", date: new Date("2024-03-15") },
    { id: 2, title: "BioTech Career Fair 2025", date: new Date("2025-03-15") },
  ];

  const mockJobs = [
    {
      id: 1,
      title: "Frontend Developer",
      companyId: 1,
      eventId: 1,
      salaryMin: 8000000,
      salaryMax: 15000000,
      createdAt: new Date("2024-01-08"),
    },
    {
      id: 2,
      title: "Backend Developer",
      companyId: 1,
      eventId: 1,
      salaryMin: 10000000,
      salaryMax: 18000000,
      createdAt: new Date("2024-01-10"),
    },
    {
      id: 3,
      title: "UI/UX Designer",
      companyId: 2,
      eventId: 1,
      salaryMin: 7000000,
      salaryMax: 12000000,
      createdAt: new Date("2024-02-01"),
    },
    {
      id: 4,
      title: "DevOps Engineer",
      companyId: 3,
      eventId: 1,
      salaryMin: 12000000,
      salaryMax: 22000000,
      createdAt: new Date("2024-02-12"),
    },
  ];

  const mockApplications = [
    {
      id: 1,
      jobId: 1,
      jobSeekerId: "u1",
      eventId: 1,
      status: "PENDING",
      createdAt: new Date("2024-03-01T10:12:00"),
    },
    {
      id: 2,
      jobId: 2,
      jobSeekerId: "u2",
      eventId: 1,
      status: "ACCEPTED",
      createdAt: new Date("2024-03-02T09:05:00"),
    },
    {
      id: 3,
      jobId: 3,
      jobSeekerId: "u1",
      eventId: 1,
      status: "REJECTED",
      createdAt: new Date("2024-03-03T14:22:00"),
    },
    {
      id: 4,
      jobId: 4,
      jobSeekerId: "u2",
      eventId: 1,
      status: "PENDING",
      createdAt: new Date("2024-03-04T08:30:00"),
    },
    {
      id: 5,
      jobId: 1,
      jobSeekerId: "u2",
      eventId: 1,
      status: "PENDING",
      createdAt: new Date("2024-03-05T11:00:00"),
    },
  ];

  // --- added: mock JobSeekerProfile data ---
  const mockJobSeekerProfiles = [
    { id: 1, userId: "u1", fullName: "Alice", lastEducationLevel: "S1" },
    { id: 2, userId: "u2", fullName: "Bob", lastEducationLevel: "D3" },
    { id: 3, userId: "u5", fullName: "Clara", lastEducationLevel: "S2" },
    { id: 4, userId: "u6", fullName: "Edo", lastEducationLevel: "S1" },
    { id: 5, userId: "u7", fullName: "Fajar", lastEducationLevel: "SMA" },
    { id: 6, userId: "u8", fullName: "Gita", lastEducationLevel: "S1" },
    { id: 7, userId: "u9", fullName: "Hari", lastEducationLevel: "S2" },
    { id: 8, userId: "u10", fullName: "Ira", lastEducationLevel: "D3" },
  ];

  // view mode state: "event" shows per-event data; "lifetime" shows aggregated data
  const [viewMode, setViewMode] = useState<"event" | "lifetime">("event");
  // selected event id used when viewMode === "event"
  const [selectedEventId, setSelectedEventId] = useState<number | null>(
    mockEvents[0]?.id ?? null
  );

  // --- New: filtered datasets depend on viewMode + selectedEventId ---
  const filteredApplications = useMemo(() => {
    if (viewMode === "event" && selectedEventId != null) {
      return mockApplications.filter((a) => a.eventId === selectedEventId);
    }
    return mockApplications;
  }, [mockApplications, viewMode, selectedEventId]);

  const filteredJobs = useMemo(() => {
    if (viewMode === "event" && selectedEventId != null) {
      return mockJobs.filter((j) => j.eventId === selectedEventId);
    }
    return mockJobs;
  }, [mockJobs, viewMode, selectedEventId]);

  const filteredCompanies = useMemo(() => {
    if (viewMode === "event" && selectedEventId != null) {
      // include companies that have jobs in the selected event
      const ids = new Set(filteredJobs.map((j) => j.companyId));
      return mockCompanies.filter((c) => ids.has(c.id));
    }
    return mockCompanies;
  }, [mockCompanies, filteredJobs, viewMode, selectedEventId]);

  const filteredUsers = useMemo(() => {
    if (viewMode === "event" && selectedEventId != null) {
      const jobSeekerIds = new Set(
        filteredApplications.map((a) => a.jobSeekerId)
      );
      return mockUsers.filter((u) => jobSeekerIds.has(u.id));
    }
    return mockUsers;
  }, [mockUsers, filteredApplications, viewMode, selectedEventId]);

  const filteredJobSeekerProfiles = useMemo(() => {
    if (viewMode === "event" && selectedEventId != null) {
      const userIds = new Set(filteredUsers.map((u) => u.id));
      return mockJobSeekerProfiles.filter((p) => userIds.has(p.userId));
    }
    return mockJobSeekerProfiles;
  }, [mockJobSeekerProfiles, filteredUsers, viewMode, selectedEventId]);

  // totals should reflect filtered view
  const totals = useMemo(() => {
    return {
      companies: filteredCompanies.length,
      jobs: filteredJobs.length,
      applications: filteredApplications.length,
      users: filteredUsers.length,
    };
  }, [filteredCompanies, filteredJobs, filteredApplications, filteredUsers]);

  // recent applications built from filteredApplications
  const recentApplications = useMemo(() => {
    return filteredApplications
      .map((app) => {
        const job = mockJobs.find((j) => j.id === app.jobId);
        const company = mockCompanies.find((c) => c.id === job?.companyId);
        const user = mockUsers.find((u) => u.id === app.jobSeekerId);
        return {
          ...app,
          jobTitle: job?.title || "Unknown",
          companyName: company?.name || "Unknown",
          applicantEmail: user?.email || "unknown",
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);
  }, [filteredApplications, mockJobs, mockCompanies, mockUsers]);

  const [searchQuery, setSearchQuery] = useState("");

  // filter recent applications by query (email, job title, company, status)
  const displayedApplications = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return recentApplications;
    return recentApplications.filter((a) => {
      return (
        (a.applicantEmail || "").toLowerCase().includes(q) ||
        (a.jobTitle || "").toLowerCase().includes(q) ||
        (a.companyName || "").toLowerCase().includes(q) ||
        (a.status || "").toLowerCase().includes(q)
      );
    });
  }, [recentApplications, searchQuery]);

  // --- New: chart data calculations ---
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredApplications.forEach((a) => {
      const key = a.status ?? "UNKNOWN";
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredApplications]);

  // Top 10 jobs by application count (with per-job color based on value gap)
  const appsPerJob = useMemo(() => {
    const map = new Map<number, number>();
    filteredApplications.forEach((a) => {
      map.set(a.jobId, (map.get(a.jobId) || 0) + 1);
    });
    const arr = Array.from(map.entries()).map(([jobId, count]) => {
      const job = mockJobs.find((j) => j.id === jobId);
      const name = job ? `${job.title}` : `Job ${jobId}`;
      return { jobId, name, count };
    });
    arr.sort((a, b) => b.count - a.count);
    const top = arr.slice(0, 10);

    // color interpolation helpers
    const hexToRgb = (hex: string) => {
      const h = hex.replace("#", "");
      return {
        r: parseInt(h.substring(0, 2), 16),
        g: parseInt(h.substring(2, 4), 16),
        b: parseInt(h.substring(4, 6), 16),
      };
    };
    const rgbToHex = (r: number, g: number, b: number) =>
      `#${[r, g, b]
        .map((x) => {
          const h = x.toString(16);
          return h.length === 1 ? "0" + h : h;
        })
        .join("")}`;

    const interpolate = (aHex: string, bHex: string, t: number) => {
      const a = hexToRgb(aHex);
      const b = hexToRgb(bHex);
      const r = Math.round(a.r + (b.r - a.r) * t);
      const g = Math.round(a.g + (b.g - a.g) * t);
      const bl = Math.round(a.b + (b.b - a.b) * t);
      return rgbToHex(r, g, bl);
    };

    const min = top.length ? Math.min(...top.map((i) => i.count)) : 0;
    const max = top.length ? Math.max(...top.map((i) => i.count)) : 0;
    const light = "#e0e7ff"; // light indigo
    const dark = "#312e81"; // dark indigo

    return top.map((item) => {
      const t = max === min ? 0.5 : (item.count - min) / (max - min);
      const color = interpolate(light, dark, t);
      return { ...item, color };
    });
  }, [filteredApplications, mockJobs]);

  const educationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredJobSeekerProfiles.forEach((p) => {
      const key = p.lastEducationLevel ?? "Unknown";
      counts[key] = (counts[key] || 0) + 1;
    });
    const order = ["SMA", "D3", "S1", "S2", "S3", "Unknown"];
    return order
      .filter((k) => counts[k])
      .map((k) => ({ level: k, count: counts[k] }));
  }, [filteredJobSeekerProfiles]);

  const STATUS_COLORS: Record<string, string> = {
    ACCEPTED: "#16a34a",
    REJECTED: "#dc2626",
    PENDING: "#f59e0b",
    UNKNOWN: "#6b7280",
  };

  const BAR_COLOR = "#6366f1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Vibrant Banner */}
        <div className="relative rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 opacity-90 blur-lg transform -skew-y-1 scale-105"></div>

          {/* Modified banner content: kept visual style, added switch + conditional event selector */}
          <div className="relative px-6 py-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Admin Dashboard
                </h1>
                <p className="mt-1 text-sm opacity-90">
                  Overview & recent activity — quick insights at a glance
                </p>
              </div>

              {/* keep event title/date or lifetime badge visible in banner (top-right) */}
              <div className="flex items-center gap-3">
                {viewMode === "event" && selectedEventId ? (
                  <>
                    <Badge className="bg-white/20 text-white border-transparent px-3 py-1">
                      {mockEvents.find((e) => e.id === selectedEventId)?.title}
                    </Badge>
                    <span className="text-sm text-white/90 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {mockEvents
                        .find((e) => e.id === selectedEventId)
                        ?.date.toLocaleDateString()}
                    </span>
                  </>
                ) : (
                  <Badge className="bg-white/20 text-white border-transparent px-3 py-1">
                    Lifetime
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls toolbar (separate from banner for cleaner UX) */}
        <div className="flex items-center justify-end gap-4 mt-2">
          <div className="min-w-[220px]">
            <Select
              onValueChange={(val) => {
                if (val === "lifetime") {
                  setViewMode("lifetime");
                  setSelectedEventId(null);
                } else {
                  setViewMode("event");
                  setSelectedEventId(Number(val));
                }
              }}
              value={
                viewMode === "lifetime"
                  ? "lifetime"
                  : selectedEventId
                  ? String(selectedEventId)
                  : undefined
              }
            >
              <SelectTrigger className="w-56 flex items-center justify-between">
                <SelectValue placeholder="Select view..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lifetime">
                  <span className="font-semibold">
                    📊 Lifetime (All Events)
                  </span>
                </SelectItem>
                <div className="border-t my-1"></div>
                {mockEvents.map((ev) => (
                  <SelectItem key={ev.id} value={String(ev.id)}>
                    📅 {ev.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-95"
                onClick={() => {
                  /* placeholder - download not implemented yet */
                }}
              >
                <DownloadCloud className="mr-2 h-4 w-4" />
                Download Full Report
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <span className="text-sm">
                Download a full CSV/PDF report (coming soon)
              </span>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Metrics row (vibrant cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 -mt-4">
          {/* Companies card */}
          <Card className="bg-transparent rounded-lg overflow-hidden transform hover:scale-[1.01] transition bg-gradient-to-br from-indigo-50 to-indigo-100">
            <div className="p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-lg text-white shadow">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Companies</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {totals.companies}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-green-600 font-medium">+3%</div>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Total registered companies
              </p>
            </div>
          </Card>

          {/* Jobs card */}
          <Card className="bg-transparent rounded-lg overflow-hidden transform hover:scale-[1.01] transition bg-gradient-to-br from-rose-50 to-rose-100">
            <div className="p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-rose-600 to-orange-500 p-2 rounded-lg text-white shadow">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Jobs</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {totals.jobs}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-red-600 font-medium">-1%</div>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Open positions posted
              </p>
            </div>
          </Card>

          {/* Applications card */}
          <Card className="bg-transparent rounded-lg overflow-hidden transform hover:scale-[1.01] transition bg-gradient-to-br from-amber-50 to-amber-100">
            <div className="p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-amber-600 to-yellow-500 p-2 rounded-lg text-white shadow">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Applications</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {totals.applications}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-yellow-700 font-medium">+8%</div>
              </div>
              <p className="mt-3 text-sm text-slate-600">
                Applications received
              </p>
            </div>
          </Card>

          {/* Users card */}
          <Card className="bg-transparent rounded-lg overflow-hidden transform hover:scale-[1.01] transition bg-gradient-to-br from-sky-50 to-sky-100">
            <div className="p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-sky-600 to-indigo-500 p-2 rounded-lg text-white shadow">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Users</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {totals.users}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-indigo-600 font-medium">+5%</div>
              </div>
              <p className="mt-3 text-sm text-slate-600">Registered users</p>
            </div>
          </Card>
        </div>

        <Separator />

        {/* Recent applications (vivid table) */}
        <div className="bg-white/95 rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Applications</h2>

            {/* Search input (replaces small description) */}
            <div className="ml-4 w-full max-w-xs">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="h-4 w-4" />
                </span>

                {/* Tooltip helper for the unified search input */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Input
                      placeholder="Search anything..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="start"
                    className="max-w-xs"
                  >
                    <p className="text-sm leading-tight">
                      You can search by applicant email, job title, company
                      name, or application status (e.g. PENDING, ACCEPTED,
                      REJECTED).
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 text-slate-700 text-xs uppercase">
                  <th className="px-4 py-3 text-left">Applicant</th>
                  <th className="px-4 py-3 text-left">Job</th>
                  <th className="px-4 py-3 text-left">Company</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {displayedApplications.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm font-medium">
                      {a.applicantEmail}
                    </td>
                    <td className="px-4 py-3 text-sm">{a.jobTitle}</td>
                    <td className="px-4 py-3 text-sm">{a.companyName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded-full ${
                          a.status === "ACCEPTED"
                            ? "bg-green-100 text-green-800"
                            : a.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor:
                              a.status === "ACCEPTED"
                                ? "#16a34a"
                                : a.status === "REJECTED"
                                ? "#dc2626"
                                : "#b45309",
                          }}
                        />
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {a.createdAt.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {displayedApplications.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-6 text-sm text-slate-500"
                    >
                      No applications found for "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts: two rows for better spacing */}
        {/* Row 1: Applications by Status | Education Demographics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pie chart: application status distribution */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Applications by Status
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time status breakdown
                </p>
              </div>
            </div>
            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusCounts}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={5}
                    label
                    labelLine={false}
                    animationBegin={0}
                    animationDuration={800}
                  >
                    {statusCounts.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          STATUS_COLORS[entry.name] ?? STATUS_COLORS.UNKNOWN
                        }
                        stroke="white"
                        strokeWidth={3}
                      />
                    ))}
                  </Pie>

                  {/* Legend showing status and count */}
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    wrapperStyle={{
                      paddingTop: "20px",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                    formatter={(value: any, entry: any) =>
                      `${value} (${entry?.payload?.value ?? 0})`
                    }
                    payload={statusCounts.map((entry) => ({
                      id: entry.name,
                      value: entry.name,
                      type: "circle",
                      color: STATUS_COLORS[entry.name] ?? STATUS_COLORS.UNKNOWN,
                    }))}
                  />

                  <RechartTooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      padding: "12px",
                    }}
                    labelStyle={{ fontWeight: 600, color: "#1e293b" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Education demographics chart */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Education Demographics
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Applicants by education level
                </p>
              </div>
            </div>
            <div className="h-72 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={educationCounts}
                  margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="level"
                    tick={{ fontSize: 13, fill: "#64748b", fontWeight: 500 }}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartTooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      padding: "12px",
                    }}
                    cursor={{ fill: "rgba(16, 185, 129, 0.1)" }}
                  />
                  <Bar
                    dataKey="count"
                    fill="url(#educationGradient)"
                    radius={[8, 8, 0, 0]}
                    animationDuration={800}
                  />
                  <defs>
                    <linearGradient
                      id="educationGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                      <stop
                        offset="100%"
                        stopColor="#10b981"
                        stopOpacity={0.6}
                      />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 2: Job Trend (full width) */}
        <div className="mt-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Job Trend</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Top 10 jobs by application volume
                </p>
              </div>
            </div>
            <div className="h-80 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={appsPerJob}
                  margin={{ top: 20, right: 20, left: 0, bottom: 40 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#64748b", fontWeight: 500 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    axisLine={{ stroke: "#e2e8f0" }}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                    label={{
                      value: "Applications",
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "#64748b", fontSize: 12 },
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartTooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      padding: "12px",
                    }}
                    cursor={{ fill: "rgba(99, 102, 241, 0.1)" }}
                  />
                  <Bar
                    dataKey="count"
                    radius={[8, 8, 0, 0]}
                    animationDuration={800}
                  >
                    {appsPerJob.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={entry.color}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
