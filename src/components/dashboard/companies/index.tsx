"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/components/trpc/trpc-client";
import { toast } from "sonner";
import CompaniesHeader from "./CompaniesHeader";
import StatsCards from "./StatsCards";
import SearchBar from "./SearchBar";
import CompaniesGrid from "./CompaniesGrid";
import CompanyFormSheet from "./CompanyFormSheet";
import DeleteConfirmSheet from "./DeleteConfirmSheet";
import CompanyDetailSheet from "./CompanyDetailSheet";

interface CompanyFormData {
  name: string;
  description: string;
  website: string;
  location: string;
  logoUrl: string;
  code: string;
}

const initialFormData: CompanyFormData = {
  name: "",
  description: "",
  website: "",
  location: "",
  logoUrl: "",
  code: "",
};

export default function CompaniesManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState<CompanyFormData>(initialFormData);

  // Fetch companies with stats (optimized query)
  const { data: companies = [], refetch } =
    trpc.companies.findAllWithStats.useQuery();

  // Fetch detailed company data when viewing details
  const { data: detailedCompany } = trpc.companies.findOneWithDetails.useQuery(
    { id: selectedCompanyId! },
    { enabled: isDetailOpen && selectedCompanyId !== null }
  );

  // Mutations
  const createMutation = trpc.companies.create.useMutation();
  const updateMutation = trpc.companies.update.useMutation();
  const deleteMutation = trpc.companies.delete.useMutation();

  // Filter companies by search query
  const filteredCompanies = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return companies;
    return companies.filter(
      (company) =>
        company.name.toLowerCase().includes(query) ||
        company.code.toLowerCase().includes(query) ||
        (company.location?.toLowerCase() || "").includes(query) ||
        (company.description?.toLowerCase() || "").includes(query)
    );
  }, [companies, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalCompanies: companies.length,
      totalJobs: companies.reduce((sum, c) => sum + (c._count?.jobs || 0), 0),
      totalApplications: companies.reduce(
        (sum, c) => sum + (c.applicationCount || 0),
        0
      ),
    };
  }, [companies]);

  // Reset form
  const resetForm = () => {
    setFormData(initialFormData);
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

  // Toggle event expand
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

  // Open create sheet
  const openCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  // Open edit sheet
  const openEdit = (company: any) => {
    setSelectedCompanyId(company.id);
    setFormData({
      name: company.name,
      description: company.description || "",
      website: company.website || "",
      location: company.location || "",
      logoUrl: company.logoUrl || "",
      code: company.code,
    });
    setIsEditOpen(true);
  };

  // Open delete sheet
  const openDelete = (company: any) => {
    setSelectedCompanyId(company.id);
    setIsDeleteOpen(true);
  };

  // Open detail sheet
  const openDetail = (company: any) => {
    setSelectedCompanyId(company.id);
    setExpandedEvents(new Set());
    setIsDetailOpen(true);
  };

  // Handle create
  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        name: formData.name,
        code: formData.code,
        description: formData.description,
        website: formData.website || undefined,
        location: formData.location,
        logoUrl: formData.logoUrl || undefined,
      });
      toast.success("Company created successfully");
      setIsCreateOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to create company");
    }
  };

  // Handle edit
  const handleEdit = async () => {
    if (!selectedCompanyId) return;
    try {
      await updateMutation.mutateAsync({
        id: selectedCompanyId,
        name: formData.name,
        code: formData.code,
        description: formData.description,
        website: formData.website || undefined,
        location: formData.location,
        logoUrl: formData.logoUrl || undefined,
      });
      toast.success("Company updated successfully");
      setIsEditOpen(false);
      setSelectedCompanyId(null);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to update company");
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedCompanyId) return;
    try {
      await deleteMutation.mutateAsync({ id: selectedCompanyId });
      toast.success("Company deleted successfully");
      setIsDeleteOpen(false);
      setSelectedCompanyId(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete company");
    }
  };

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <CompaniesHeader onAddCompany={openCreate} />

        <StatsCards
          totalCompanies={stats.totalCompanies}
          totalJobs={stats.totalJobs}
          totalApplications={stats.totalApplications}
        />

        <SearchBar value={searchQuery} onChange={setSearchQuery} />

        <CompaniesGrid
          companies={filteredCompanies}
          onView={openDetail}
          onEdit={openEdit}
          onDelete={openDelete}
        />

        <CompanyFormSheet
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleCreate}
          onGenerateCode={generateRandomCode}
          isLoading={createMutation.isPending}
          mode="create"
        />

        <CompanyFormSheet
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          formData={formData}
          onFormDataChange={setFormData}
          onSubmit={handleEdit}
          onGenerateCode={generateRandomCode}
          isLoading={updateMutation.isPending}
          mode="edit"
        />

        <DeleteConfirmSheet
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          company={selectedCompany || null}
          onConfirm={handleDelete}
          isLoading={deleteMutation.isPending}
        />

        <CompanyDetailSheet
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          company={detailedCompany || null}
          expandedEvents={expandedEvents}
          onToggleEvent={toggleEventExpand}
        />
      </div>
    </div>
  );
}
