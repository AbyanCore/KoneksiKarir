"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { trpc } from "@/components/trpc/trpc-client";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import BasicInfoCard from "@/components/company/profile/BasicInfoCard";
import ContactInfoCard from "@/components/company/profile/ContactInfoCard";
import ProfileActions from "@/components/company/profile/ProfileActions";

interface CompanyProfileForm {
  name: string;
  description: string | null;
  location: string | null;
  website: string | null;
  logoUrl: string | null;
}

export default function CompanyProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const utils = trpc.useUtils();

  // Fetch company profile
  const { data: profile, isLoading } =
    trpc.companies.getMyCompanyProfile.useQuery();

  // Update mutation
  const updateMutation = trpc.companies.update.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      utils.companies.getMyCompanyProfile.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const form = useForm<CompanyProfileForm>({
    defaultValues: {
      name: "",
      description: "",
      location: "",
      website: "",
      logoUrl: "",
    },
  });

  // Update form when profile loads - use useEffect to prevent infinite re-renders
  useEffect(() => {
    if (profile && !isLoading && !isEditing) {
      form.reset({
        name: profile.name,
        description: profile.description || "",
        location: profile.location || "",
        website: profile.website || "",
        logoUrl: profile.logoUrl || "",
      });
    }
  }, [profile, isLoading, isEditing, form]);

  const onSubmit = (data: CompanyProfileForm) => {
    if (!profile) return;

    updateMutation.mutate({
      id: profile.id,
      name: data.name,
      description: data.description || undefined,
      location: data.location || undefined,
      website: data.website || undefined,
      logoUrl: data.logoUrl || undefined,
    });
  };

  const handleEdit = () => {
    if (profile) {
      form.reset({
        name: profile.name,
        description: profile.description || "",
        location: profile.location || "",
        website: profile.website || "",
        logoUrl: profile.logoUrl || "",
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      form.reset({
        name: profile.name,
        description: profile.description || "",
        location: profile.location || "",
        website: profile.website || "",
        logoUrl: profile.logoUrl || "",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-6 text-center">
          <p className="text-gray-500">Company profile not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Company Profile</h1>
            <p className="text-gray-500 mt-1">
              Manage your company information and settings
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicInfoCard form={form} isEditing={isEditing} />
            <ContactInfoCard form={form} isEditing={isEditing} />

            <ProfileActions
              isEditing={isEditing}
              isSubmitting={updateMutation.isPending}
              onEdit={handleEdit}
              onCancel={handleCancel}
            />
          </form>
        </Form>

        {/* Company Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Company Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">
                {profile._count?.jobs || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Active Jobs</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {profile._count?.EventCompanyParticipation || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Events Participating</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">
                {profile.code}
              </p>
              <p className="text-sm text-gray-600 mt-1">Company Code</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
