"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/components/trpc/trpc-client";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import BasicInformationCard from "./BasicInformationCard";
import EducationCard from "./EducationCard";
import SkillsCard from "./SkillsCard";
import SocialLinksCard from "./SocialLinksCard";
import DocumentsCard from "./DocumentsCard";
import PrivateInformationCard from "./PrivateInformationCard";
import ProfileActions from "./ProfileActions";

// TODO: Replace with actual user ID from auth context
const MOCK_USER_ID = "mock-user-id";

// Profile form schema
const profileFormSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  bio: z.string().optional(),
  lastEducationLevel: z.string().optional(),
  graduationYear: z.string().optional(),
  institutionName: z.string().optional(),
  resumeUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  portfolioUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  NIK: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface SocialLink {
  type: string;
  url: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);

  // Fetch user profile
  const { data: userData, isLoading } =
    trpc.profile.getJobSeekerProfile.useQuery(
      { userId: MOCK_USER_ID },
      {
        retry: false,
        refetchOnWindowFocus: false,
      }
    );

  // Update profile mutation
  const updateProfile = trpc.profile.updateJobSeekerProfile.useMutation({
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      // Invalidate and refetch
      trpc.useContext().profile.getJobSeekerProfile.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
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

  // Populate form when data is loaded
  useEffect(() => {
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
    } else if (userData && !userData.profile) {
      // New user - set email only
      form.reset({
        email: userData.email,
        fullName: "",
        bio: "",
        lastEducationLevel: "",
        graduationYear: "",
        institutionName: "",
        resumeUrl: "",
        portfolioUrl: "",
        NIK: "",
      });
      setSkills([]);
      setSocialLinks([]);
      setPhoneNumbers([]);
    }
  }, [userData, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const profileData = {
        userId: MOCK_USER_ID,
        fullName: data.fullName,
        bio: data.bio,
        lastEducationLevel: data.lastEducationLevel,
        graduationYear: data.graduationYear
          ? parseInt(data.graduationYear)
          : null,
        institutionName: data.institutionName,
        skills,
        socialLinks,
        resumeUrl: data.resumeUrl,
        portfolioUrl: data.portfolioUrl,
        NIK: data.NIK,
        phoneNumber: phoneNumbers.filter((phone) => phone.trim() !== ""),
      };

      await updateProfile.mutateAsync(profileData);
    } catch (error) {
      console.error("Profile update error:", error);
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

  // Handle cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
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

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-20 bg-slate-200 rounded-lg" />
            <div className="h-96 bg-slate-200 rounded-lg" />
            <div className="h-64 bg-slate-200 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your personal information and preferences
            </p>
          </div>
          <ProfileActions
            isEditing={isEditing}
            isSubmitting={
              form.formState.isSubmitting || updateProfile.isPending
            }
            onEdit={() => setIsEditing(true)}
            onCancel={handleCancel}
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <BasicInformationCard form={form} isEditing={isEditing} />

            {/* Education */}
            <EducationCard form={form} isEditing={isEditing} />

            {/* Skills */}
            <SkillsCard
              skills={skills}
              newSkill={newSkill}
              isEditing={isEditing}
              onNewSkillChange={setNewSkill}
              onAddSkill={addSkill}
              onRemoveSkill={removeSkill}
            />

            {/* Social Links */}
            <SocialLinksCard
              socialLinks={socialLinks}
              isEditing={isEditing}
              onUpdateLink={updateSocialLink}
              onAddLink={addSocialLink}
              onRemoveLink={removeSocialLink}
            />

            {/* Documents */}
            <DocumentsCard form={form} isEditing={isEditing} />

            {/* Private Information */}
            <PrivateInformationCard
              form={form}
              phoneNumbers={phoneNumbers}
              isEditing={isEditing}
              onUpdatePhoneNumber={updatePhoneNumber}
              onAddPhoneNumber={addPhoneNumber}
              onRemovePhoneNumber={removePhoneNumber}
            />

            {isEditing && (
              <ProfileActions
                isEditing={isEditing}
                isSubmitting={
                  form.formState.isSubmitting || updateProfile.isPending
                }
                onEdit={() => setIsEditing(true)}
                onCancel={handleCancel}
              />
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
