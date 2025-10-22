"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from "recharts";
import {
  Users,
  Building2,
  Briefcase,
  Award,
  GraduationCap,
  TrendingUp,
} from "lucide-react";

interface ReportData {
  metrics: {
    totalApplications: number;
    uniqueApplicants: number;
    totalCompanies: number;
    totalJobs: number;
    averageApplicationsPerJob: string | number;
    averageApplicationsPerCompany: string | number;
  };
  statusStats: Record<string, number>;
  educationStats: Array<{
    level: string;
    count: number;
  }>;
  jobTypeDistribution: Record<string, number>;
  topCompanies: Array<{
    name: string;
    count: number;
  }>;
  topJobs: Array<{
    title: string;
    company: string;
    applicationCount: number;
  }>;
  metadata: {
    generatedAt: string;
    eventId: number | null;
    eventTitle: string;
    viewMode: "event" | "lifetime";
  };
}

interface ReportDisplayProps {
  data: ReportData;
}

const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    APPLIED: "Melamar",
    VIEWED: "Dilihat",
    INTERVIEW: "Wawancara",
    REJECTED: "Ditolak",
    ACCEPTED: "Diterima",
    PROCESSING: "Diproses",
    PENDING: "Menunggu",
  };
  return statusMap[status] || status;
};

// Colors for charts
const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#6366f1",
];

const MetricCard = ({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle: string;
}) => (
  <Card className="flex flex-col justify-between">
    <CardHeader className="pb-2 pt-4 px-4">
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        {icon}
      </div>
    </CardHeader>
    <CardContent className="px-4 pb-4">
      <p className="text-3xl font-bold">{value}</p>
    </CardContent>
  </Card>
);

export default function ReportDisplay({ data }: ReportDisplayProps) {
  // Calculate totals for percentage
  const totalStatus = Object.values(data.statusStats).reduce(
    (a, b) => a + b,
    0
  );
  const totalEducation = data.educationStats.reduce(
    (sum, edu) => sum + edu.count,
    0
  );
  const totalJobType = Object.values(data.jobTypeDistribution).reduce(
    (a, b) => a + b,
    0
  );

  // Prepare data for charts with percentages
  const statusChartData = Object.entries(data.statusStats).map(
    ([status, count]) => ({
      name: getStatusLabel(status),
      value: count,
      percentage:
        totalStatus > 0 ? ((count / totalStatus) * 100).toFixed(1) : 0,
    })
  );

  const educationChartData = data.educationStats.map((edu) => ({
    name: edu.level,
    value: edu.count,
    percentage:
      totalEducation > 0 ? ((edu.count / totalEducation) * 100).toFixed(1) : 0,
  }));

  return (
    <div className="space-y-5 bg-white p-4 font-sans">
      {/* Header Section */}
      <div className="border-b pb-3 text-center">
        <h1 className="text-xl font-bold text-slate-800">
          Laporan Analitik Job Fair
        </h1>
        <p className="text-base font-semibold text-slate-700 mt-1">
          {data.metadata.eventTitle}
        </p>
        <p className="text-xs text-slate-500">
          Dibuat pada:{" "}
          {format(new Date(data.metadata.generatedAt), "d MMMM yyyy, HH:mm", {
            locale: id,
          })}
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-2 gap-x-6">
        {/* Left Column */}
        <div className="col-span-1 space-y-5">
          {/* Section: Key Metrics */}
          <div>
            <h2 className="text-lg font-semibold mb-2 text-slate-700">
              Ringkasan Kinerja
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                icon={<Briefcase className="w-5 h-5 text-blue-500" />}
                title="Total Lamaran"
                value={data.metrics.totalApplications}
                subtitle="Total lamaran yang diterima"
              />
              <MetricCard
                icon={<Users className="w-5 h-5 text-purple-500" />}
                title="Pelamar Unik"
                value={data.metrics.uniqueApplicants}
                subtitle="Jumlah individu pelamar"
              />
              <MetricCard
                icon={<Building2 className="w-5 h-5 text-pink-500" />}
                title="Perusahaan"
                value={data.metrics.totalCompanies}
                subtitle="Perusahaan berpartisipasi"
              />
              <MetricCard
                icon={<Award className="w-5 h-5 text-orange-500" />}
                title="Lowongan"
                value={data.metrics.totalJobs}
                subtitle="Total posisi yang dibuka"
              />
            </div>
          </div>

          {/* Section: Applicant Analysis */}
          <div>
            <h2 className="text-lg font-semibold mb-2 text-slate-700">
              Analisis Pelamar
            </h2>
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Demografi Pendidikan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={educationChartData} margin={{ top: 20 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {educationChartData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                        <LabelList
                          dataKey="percentage"
                          position="top"
                          formatter={(value: any) => `${value}%`}
                          style={{ fontSize: 10, fontWeight: "bold" }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Distribusi Status Lamaran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    {/* Chart */}
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                          <Pie
                            data={statusChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                            label={false}
                          >
                            {statusChartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: any, name: any, props: any) =>
                              `${value} (${props.payload.percentage}%)`
                            }
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-col justify-center space-y-2">
                      {statusChartData.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs whitespace-nowrap"
                        >
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: COLORS[idx % COLORS.length],
                            }}
                          />
                          <span className="text-slate-600">{item.name}</span>
                          <span className="font-semibold text-slate-700">
                            {item.value}
                          </span>
                          <span className="text-slate-500">
                            ({item.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-span-1 space-y-5">
          {/* Section: Job & Company Analysis */}
          <div>
            <h2 className="text-lg font-semibold mb-2 text-slate-700">
              Analisis Lowongan & Perusahaan
            </h2>
            <div className="space-y-4">
              {data.topCompanies.length > 0 && (
                <Card>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-base">
                      Perusahaan Terpopuler
                    </CardTitle>
                    <p className="text-xs text-slate-500">
                      Berdasarkan jumlah lamaran
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2 text-sm">
                      {data.topCompanies.slice(0, 5).map((company, idx) => (
                        <li
                          key={idx}
                          className="flex items-center justify-between"
                        >
                          <span className="truncate pr-2">
                            {idx + 1}. {company.name}
                          </span>
                          <Badge variant="secondary">{company.count}</Badge>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-base">
                    Distribusi Tipe Pekerjaan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm">
                    {Object.entries(data.jobTypeDistribution).map(
                      ([type, count]) => {
                        const percentage =
                          totalJobType > 0
                            ? ((count / totalJobType) * 100).toFixed(1)
                            : 0;
                        return (
                          <li key={type} className="flex justify-between">
                            <span>{type}</span>
                            <span className="font-medium text-slate-600">
                              {count} ({percentage}%)
                            </span>
                          </li>
                        );
                      }
                    )}
                  </ul>
                  {Object.keys(data.jobTypeDistribution).length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">
                      Tidak ada data
                    </p>
                  )}
                </CardContent>
              </Card>

              {data.topJobs.length > 0 && (
                <Card className="h-full">
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-base">
                      Top 10 Lowongan Paling Diminati
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b bg-slate-50">
                            <th className="text-left py-2 px-2 font-semibold">
                              Posisi
                            </th>
                            <th className="text-left py-2 px-2 font-semibold">
                              Perusahaan
                            </th>
                            <th className="text-right py-2 px-2 font-semibold">
                              Lamaran
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.topJobs.map((job, idx) => (
                            <tr
                              key={idx}
                              className="border-b hover:bg-slate-50"
                            >
                              <td className="py-2 px-2 font-medium">
                                {job.title}
                              </td>
                              <td className="py-2 px-2 text-slate-600">
                                {job.company}
                              </td>
                              <td className="py-2 px-2 text-right">
                                <Badge variant="secondary">
                                  {job.applicationCount}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-xs text-slate-500 pt-4 border-t mt-5">
        <p>
          Laporan ini dihasilkan oleh sistem KoneksiKarir.com untuk evaluasi
          pelaksanaan job fair.
        </p>
        <strong>
          @AbyanCore | https://id.linkedin.com/in/danish-abyan-pratista
        </strong>
      </div>
    </div>
  );
}
