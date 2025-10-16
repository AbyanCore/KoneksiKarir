"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { trpc } from "@/components/trpc/trpc-client";
import { useAuth } from "@/components/auth/auth-provider";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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

  // --- NEW: create profile mutation (used when user has no profile yet) ---
  const createProfileMutation = trpc.profile.createMyProfile.useMutation({
    onSuccess: (created) => {
      toast.success("Profile created. You can now edit.");
      // ensure we refetch the profile data
      utils.profile.getMyProfile.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create profile");
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

  // new: helper to focus first input when entering edit mode
  useEffect(() => {
    if (isEditing) {
      // small delay to ensure DOM updated
      setTimeout(() => {
        const fn = document.querySelector<HTMLInputElement>(
          'input[name="fullName"]'
        );
        fn?.focus();
      }, 50);
      // smooth scroll to top of form area
      const formEl = document.querySelector("form");
      formEl?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [isEditing]);

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

  // Handle entering edit mode — now creates profile first if missing
  const handleEdit = async () => {
    // if profile exists behave as before
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
      return;
    }

    // if no userData or still loading, bail out
    if (!userData) return;

    // prevent duplicate create calls
    if (createProfileMutation.isPending) return;

    try {
      // Attempt to create an empty profile on server (server should accept empty/default)
      const created = await createProfileMutation.mutateAsync(
        {} as any // adjust input if your createMyProfile expects fields
      );

      // Invalidate and wait for fresh profile to be fetched
      await utils.profile.getMyProfile.invalidate();

      // If server returned created profile object, use it to seed form
      const createdProfile = (created && (created.profile || created)) || null;

      form.reset({
        email: userData.email,
        fullName: createdProfile?.fullName || "",
        bio: createdProfile?.bio || "",
        lastEducationLevel: createdProfile?.lastEducationLevel || "",
        graduationYear: createdProfile?.graduationYear?.toString() || "",
        institutionName: createdProfile?.institutionName || "",
        resumeUrl: createdProfile?.resumeUrl || "",
        portfolioUrl: createdProfile?.portfolioUrl || "",
        NIK: createdProfile?.NIK || "",
      });

      // set local arrays
      setSkills(createdProfile?.skills || []);
      setSocialLinks(createdProfile?.socialLinks || []);
      setPhoneNumbers(createdProfile?.phoneNumber || []);

      isEditingRef.current = true;
      setIsEditing(true);
    } catch (err) {
      // mutateAsync errors handled by onError as well, but show fallback
      console.error("Create profile error:", err);
      toast.error("Failed to create profile. Please try again.");
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

  const anyPending =
    updateMutation.isPending || createProfileMutation.isPending;

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
        {/* Header + quick actions */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-gray-500 mt-1">
              Manage your personal information and preferences
            </p>
          </div>

          {/* Top action: Edit or Create */}
          <div className="flex items-center gap-2">
            {!userData?.profile ? (
              <Button
                variant="secondary"
                onClick={handleEdit}
                disabled={createProfileMutation.isPending || isEditing}
                title="Create profile and start editing"
              >
                {createProfileMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Profile"
                )}
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={handleEdit}
                disabled={anyPending || isEditing}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* If profile missing and not editing, show a helpful banner */}
        {!userData?.profile && !isEditing && (
          <Card className="p-4 bg-yellow-50 border-yellow-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-yellow-800">
                It looks like you don't have a profile yet. Create one to apply
                for jobs and make your profile visible to recruiters.
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleEdit}
                disabled={createProfileMutation.isPending}
              >
                {createProfileMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </Card>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <BasicInformationCard
              form={form}
              isEditing={isEditing}
              // pass a disabled prop based on save pending
            />
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

            {/* Hide existing ProfileActions while editing; we show sticky actions */}
            {/* {!isEditing && (
              <ProfileActions
                isEditing={isEditing}
                isSubmitting={updateMutation.isPending}
                onEdit={handleEdit}
                onCancel={handleCancel}
              />
            )} */}
          </form>
        </Form>
      </div>

      {/* Sticky action bar while editing */}
      {isEditing && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center pointer-events-none">
          <div className="w-full max-w-4xl px-4 pointer-events-auto">
            <div className="bg-white border rounded-lg shadow-lg p-3 flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={handleCancel}
                disabled={anyPending}
              >
                Cancel
              </Button>
              <Button
                onClick={() => form.handleSubmit(onSubmit)()}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
