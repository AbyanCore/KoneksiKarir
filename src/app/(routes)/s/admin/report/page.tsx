"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { trpc } from "@/components/trpc/trpc-client";
import ReportDisplay from "@/components/report/ReportDisplay";
import { Printer } from "lucide-react";

export default function ReportPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");

  // Fetch report data
  const { data: reportData, isLoading } = trpc.report.generateReport.useQuery({
    eventId: eventId ? parseInt(eventId) : undefined,
  });

  // Handle print functionality - use browser's native print
  const handlePrint = () => {
    window.print();
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
          <div className="mb-6 flex justify-between items-center no-print">
            <h1 className="text-3xl font-bold text-slate-900">
              Laporan Job Fair
            </h1>
            <Button
              onClick={handlePrint}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Printer className="w-4 h-4" />
              Cetak Laporan
            </Button>
          </div>

          {/* Report Content */}
          <div id="print-content" className="bg-white rounded-lg shadow-lg p-8">
            <ReportDisplay data={reportData} />
          </div>
        </div>
      </div>
    </>
  );
}
