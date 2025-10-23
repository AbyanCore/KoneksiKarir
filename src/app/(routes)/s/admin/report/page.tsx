"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/components/trpc/trpc-client";
import ReportDisplay from "@/components/report/ReportDisplay";
import { Printer, Download } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ReportPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [isCompanyPickerOpen, setIsCompanyPickerOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );

  // Fetch report data
  const { data: reportData, isLoading } = trpc.report.generateReport.useQuery({
    eventId: eventId ? parseInt(eventId) : undefined,
  });

  // Fetch jobseeker data for export
  const { data: jobseekerData } = trpc.report.exportJobseekerData.useQuery({
    eventId: eventId ? parseInt(eventId) : undefined,
  });

  // Fetch all users for export
  const { data: allUsersData } = trpc.report.exportAllUsers.useQuery({
    eventId: eventId ? parseInt(eventId) : undefined,
  });

  // Fetch companies for export
  const { data: companiesData } = trpc.report.exportCompanies.useQuery();

  // Fetch companies list for picker
  const { data: companiesListData } =
    trpc.report.getCompaniesForPicker.useQuery();

  // Fetch jobseekers by company when company is selected
  const { data: jobseekersByCompanyData } =
    trpc.report.exportJobseekersByCompany.useQuery(
      {
        companyId: selectedCompanyId || 0,
        eventId: eventId ? parseInt(eventId) : undefined,
      },
      {
        enabled: selectedCompanyId !== null,
      }
    );

  // Handle print functionality - use browser's native print
  const handlePrint = () => {
    window.print();
  };

  // Handle CSV export for jobseekers
  const handleExportCSV = () => {
    if (!jobseekerData || jobseekerData.length === 0) {
      alert("Tidak ada data untuk diunduh");
      return;
    }

    // Prepare CSV headers
    const headers = [
      "User ID",
      "Email",
      "Nama Lengkap",
      "Nomor Telepon",
      "Tingkat Pendidikan",
      "Bio",
      "URL Resume",
      "Keahlian",
    ];

    // Prepare CSV rows
    const rows = jobseekerData.map((item: any) => [
      item.userId,
      item.email,
      item.fullName || "",
      item.phoneNumber || "",
      item.lastEducationLevel || "",
      item.bio || "",
      item.resumeUrl || "",
      item.skills || "",
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escape quotes and wrap in quotes if contains comma or quote
            const cellStr = String(cell || "");
            if (cellStr.includes(",") || cellStr.includes('"')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(",")
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const fileName = eventId
      ? `jobseeker-data-event-${eventId}.csv`
      : "jobseeker-data-all.csv";

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV export for all users
  const handleExportAllUsers = () => {
    if (!allUsersData || allUsersData.length === 0) {
      alert("Tidak ada data pengguna untuk diunduh");
      return;
    }

    // Prepare CSV headers
    const headers = [
      "User ID",
      "Email",
      "Role",
      "Diblokir",
      "Tanggal Dibuat",
      "Tanggal Diperbarui",
    ];

    // Prepare CSV rows
    const rows = allUsersData.map((item: any) => [
      item.userId,
      item.email,
      item.role,
      item.isBlocked,
      item.createdAt,
      item.updatedAt,
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escape quotes and wrap in quotes if contains comma or quote
            const cellStr = String(cell || "");
            if (cellStr.includes(",") || cellStr.includes('"')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(",")
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const fileName = "registered-users.csv";

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV export for companies with events
  const handleExportCompanies = () => {
    if (!companiesData || companiesData.length === 0) {
      alert("Tidak ada data perusahaan untuk diunduh");
      return;
    }

    // Prepare CSV headers
    const headers = [
      "Company ID",
      "Nama Perusahaan",
      "Kode Perusahaan",
      "Website",
      "Lokasi",
      "Deskripsi",
      "Logo URL",
      "Total Event Diikuti",
      "Event yang Diikuti",
      "Tanggal Dibuat",
      "Tanggal Diperbarui",
    ];

    // Prepare CSV rows
    const rows = companiesData.map((item: any) => [
      item.companyId,
      item.companyName,
      item.companyCode,
      item.website || "",
      item.location || "",
      item.description || "",
      item.logoUrl || "",
      item.totalEventsJoined,
      // Format events as: Event Title (Date) - Stand Number; Event Title 2 (Date) - Stand Number 2
      item.eventsJoined
        .map(
          (event: any) =>
            `${event.eventTitle} (${event.eventDate.split("T")[0]}) - Stand ${
              event.standNumber
            }`
        )
        .join("; ") || "",
      item.createdAt,
      item.updatedAt,
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escape quotes and wrap in quotes if contains comma or quote
            const cellStr = String(cell || "");
            if (cellStr.includes(",") || cellStr.includes('"')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(",")
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const fileName = "registered-companies.csv";

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle CSV export for jobseekers by company
  const handleExportJobseekersByCompany = (
    companyId: number,
    companyName: string
  ) => {
    if (!jobseekersByCompanyData || jobseekersByCompanyData.length === 0) {
      alert("Tidak ada data untuk diunduh untuk perusahaan ini");
      return;
    }

    // Prepare CSV headers
    const headers = [
      "User ID",
      "Email",
      "Nama Lengkap",
      "Nomor Telepon",
      "Tingkat Pendidikan",
      "Bio",
      "URL Resume",
      "Keahlian",
    ];

    // Prepare CSV rows
    const rows = jobseekersByCompanyData.map((item: any) => [
      item.userId,
      item.email,
      item.fullName || "",
      item.phoneNumber || "",
      item.lastEducationLevel || "",
      item.bio || "",
      item.resumeUrl || "",
      item.skills || "",
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            // Escape quotes and wrap in quotes if contains comma or quote
            const cellStr = String(cell || "");
            if (cellStr.includes(",") || cellStr.includes('"')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          })
          .join(",")
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    const fileName = eventId
      ? `jobseeker-data-${companyName}-event-${eventId}.csv`
      : `jobseeker-data-${companyName}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Close the sheet and reset
    setIsCompanyPickerOpen(false);
    setSelectedCompanyId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-600">Memuat laporan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-600">
              Gagal memuat laporan. Silakan coba lagi.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #print-content, #print-content * {
              visibility: visible;
            }
            #print-content {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            .no-print {
              display: none !important;
            }
            @page {
              size: A4 landscape;
              margin: 1cm;
            }
          }
        `,
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Top Bar with Print Button - Hidden on Print */}
          <div className="mb-6 flex flex-col gap-3 no-print">
            <h1 className="text-3xl font-bold text-slate-900">
              Laporan Job Fair
            </h1>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={handleExportCSV}
                className="gap-2 bg-green-600 hover:bg-green-700"
              >
                <Download className="w-4 h-4" />
                Export Jobseeker Data
              </Button>
              <Button
                onClick={() => setIsCompanyPickerOpen(true)}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Download className="w-4 h-4" />
                Export Jobseeker by Company
              </Button>
              <Button
                onClick={handleExportAllUsers}
                className="gap-2 bg-purple-600 hover:bg-purple-700"
              >
                <Download className="w-4 h-4" />
                Export All Users
              </Button>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={handleExportCompanies}
                className="gap-2 bg-orange-600 hover:bg-orange-700"
              >
                <Download className="w-4 h-4" />
                Export Companies
              </Button>
              <Button
                onClick={handlePrint}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Printer className="w-4 h-4" />
                Cetak Laporan
              </Button>
            </div>
          </div>

          {/* Report Content */}
          <div id="print-content" className="bg-white rounded-lg shadow-lg p-8">
            <ReportDisplay data={reportData} />
          </div>
        </div>
      </div>

      {/* Company Picker Drawer */}
      <Sheet open={isCompanyPickerOpen} onOpenChange={setIsCompanyPickerOpen}>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>Pilih Perusahaan</SheetTitle>
            <SheetDescription>
              Pilih perusahaan untuk mengekspor data pelamar yang melamar ke
              perusahaan tersebut
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="h-[calc(100vh-150px)] mt-4">
            <div className="space-y-2 pr-4">
              {companiesListData && companiesListData.length > 0 ? (
                companiesListData.map((company: any) => (
                  <Button
                    key={company.id}
                    onClick={() => {
                      setSelectedCompanyId(company.id);
                      // Wait a moment for data to fetch, then export
                      setTimeout(() => {
                        handleExportJobseekersByCompany(
                          company.id,
                          company.name
                        );
                      }, 100);
                    }}
                    variant="outline"
                    className="w-full justify-start h-auto py-3 px-4 text-left"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{company.name}</span>
                      <span className="text-xs text-slate-500">
                        {company.code}
                      </span>
                    </div>
                  </Button>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  Tidak ada perusahaan tersedia
                </div>
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
