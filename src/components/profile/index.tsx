"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { trpc } from "@/components/trpc/trpc-client";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import BasicInformationCard from "./BasicInformationCard";
import EducationCard from "./EducationCard";
import SkillsCard from "./SkillsCard";
import SocialLinksCard from "./SocialLinksCard";
import DocumentsCard from "./DocumentsCard";
import PrivateInformationCard from "./PrivateInformationCard";
import ProfileActions from "./ProfileActions";

interface ProfileForm {
  email: string;
  fullName: string;
  bio: string | null;
  lastEducationLevel: string | null;
  graduationYear: string | null;
  institutionName: string | null;
  resumeUrl: string | null;
  portfolioUrl: string | null;
  NIK: string | null;
}

interface SocialLink {
  type: string;
  url: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { isLoading: isAuthLoading, isAuthenticated } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const isEditingRef = useRef(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);

  const utils = trpc.useUtils();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast.error("Please sign in to access your profile");
      router.push("/auth/signin");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Fetch profile
  const { data: userData, isLoading } = trpc.profile.getMyProfile.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
      retry: false,
      refetchOnWindowFocus: false,
    }
  );

  // Update mutation
  const updateMutation = trpc.profile.updateMyProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      isEditingRef.current = false;
      setIsEditing(false);
      utils.profile.getMyProfile.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const form = useForm<ProfileForm>({
    defaultValues: {
      email: "",
      fullName: "",
      bio: "",
      lastEducationLevel: "",
      graduationYear: "",
      institutionName: "",
      resumeUrl: "",
      portfolioUrl: "",
      NIK: "",
    },
  });

  // Update form when profile loads
  useEffect(() => {
    if (userData?.profile && !isEditingRef.current) {
      const profile = userData.profile;
      form.reset({
        email: userData.email,
        fullName: profile.fullName || "",
        bio: profile.bio || "",
        lastEducationLevel: profile.lastEducationLevel || "",
        graduationYear: profile.graduationYear?.toString() || "",
        institutionName: profile.institutionName || "",
        resumeUrl: profile.resumeUrl || "",
        portfolioUrl: profile.portfolioUrl || "",
        NIK: profile.NIK || "",
      });
      setSkills(profile.skills || []);
      setSocialLinks(profile.socialLinks || []);
      setPhoneNumbers(profile.phoneNumber || []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const onSubmit = (data: ProfileForm) => {
    updateMutation.mutate({
      fullName: data.fullName,
      bio: data.bio || undefined,
      lastEducationLevel: data.lastEducationLevel || undefined,
      graduationYear: data.graduationYear
        ? parseInt(data.graduationYear)
        : null,
      institutionName: data.institutionName || undefined,
      skills,
      socialLinks,
      resumeUrl: data.resumeUrl || undefined,
      portfolioUrl: data.portfolioUrl || undefined,
      NIK: data.NIK || undefined,
      phoneNumber: phoneNumbers.filter((phone) => phone.trim() !== ""),
    });
  };

  const handleEdit = () => {
    if (userData?.profile) {
      const profile = userData.profile;
      form.reset({
        email: userData.email,
        fullName: profile.fullName || "",
        bio: profile.bio || "",
        lastEducationLevel: profile.lastEducationLevel || "",
        graduationYear: profile.graduationYear?.toString() || "",
        institutionName: profile.institutionName || "",
        resumeUrl: profile.resumeUrl || "",
        portfolioUrl: profile.portfolioUrl || "",
        NIK: profile.NIK || "",
      });
      setSkills(profile.skills || []);
      setSocialLinks(profile.socialLinks || []);
      setPhoneNumbers(profile.phoneNumber || []);
      isEditingRef.current = true;
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    isEditingRef.current = false;
    setIsEditing(false);
    if (userData?.profile) {
      const profile = userData.profile;
      form.reset({
        email: userData.email,
        fullName: profile.fullName || "",
        bio: profile.bio || "",
        lastEducationLevel: profile.lastEducationLevel || "",
        graduationYear: profile.graduationYear?.toString() || "",
        institutionName: profile.institutionName || "",
        resumeUrl: profile.resumeUrl || "",
        portfolioUrl: profile.portfolioUrl || "",
        NIK: profile.NIK || "",
      });
      setSkills(profile.skills || []);
      setSocialLinks(profile.socialLinks || []);
      setPhoneNumbers(profile.phoneNumber || []);
    }
  };

  // Skills management
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  // Social links management
  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { type: "LinkedIn", url: "" }]);
  };

  const updateSocialLink = (
    index: number,
    field: "type" | "url",
    value: string
  ) => {
    const newLinks = [...socialLinks];
    newLinks[index][field] = value;
    setSocialLinks(newLinks);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  // Phone numbers management
  const addPhoneNumber = () => {
    setPhoneNumbers([...phoneNumbers, ""]);
  };

  const updatePhoneNumber = (index: number, value: string) => {
    const newNumbers = [...phoneNumbers];
    newNumbers[index] = value;
    setPhoneNumbers(newNumbers);
  };

  const removePhoneNumber = (index: number) => {
    setPhoneNumbers(phoneNumbers.filter((_, i) => i !== index));
  };

  if (isAuthLoading || isLoading) {
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-gray-500 mt-1">
              Manage your personal information and preferences
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicInformationCard form={form} isEditing={isEditing} />
            <EducationCard form={form} isEditing={isEditing} />
            <SkillsCard
              skills={skills}
              newSkill={newSkill}
              isEditing={isEditing}
              onNewSkillChange={setNewSkill}
              onAddSkill={addSkill}
              onRemoveSkill={removeSkill}
            />
            <SocialLinksCard
              socialLinks={socialLinks}
              isEditing={isEditing}
              onUpdateLink={updateSocialLink}
              onAddLink={addSocialLink}
              onRemoveLink={removeSocialLink}
            />
            <DocumentsCard form={form} isEditing={isEditing} />
            <PrivateInformationCard
              form={form}
              phoneNumbers={phoneNumbers}
              isEditing={isEditing}
              onUpdatePhoneNumber={updatePhoneNumber}
              onAddPhoneNumber={addPhoneNumber}
              onRemovePhoneNumber={removePhoneNumber}
            />

            <ProfileActions
              isEditing={isEditing}
              isSubmitting={updateMutation.isPending}
              onEdit={handleEdit}
              onCancel={handleCancel}
            />
          </form>
        </Form>
      </div>
    </div>
  );
}
