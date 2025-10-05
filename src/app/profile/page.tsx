"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Briefcase,
  GraduationCap,
  Link as LinkIcon,
  FileText,
  Phone,
  IdCard,
  Plus,
  X,
  Save,
} from "lucide-react";

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

// Mock user data - replace with actual API call
const mockUserProfile = {
  id: "1",
  email: "john.doe@example.com",
  role: "JOB_SEEKER",
  profile: {
    fullName: "John Doe",
    bio: "Passionate full-stack developer with 3 years of experience in building web applications.",
    lastEducationLevel: "S1",
    graduationYear: 2020,
    institutionName: "University of Indonesia",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL"],
    socialLinks: [
      { type: "LinkedIn", url: "https://linkedin.com/in/johndoe" },
      { type: "GitHub", url: "https://github.com/johndoe" },
    ],
    resumeUrl: "https://drive.google.com/file/d/sample-resume",
    portfolioUrl: "https://johndoe.dev",
    NIK: "1234567890123456",
    phoneNumbers: ["+62 812 3456 7890", "+62 858 9876 5432"],
  },
};

export default function Page_Profile() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [skills, setSkills] = useState<string[]>(
    mockUserProfile.profile.skills
  );
  const [newSkill, setNewSkill] = useState("");
  const [socialLinks, setSocialLinks] = useState(
    mockUserProfile.profile.socialLinks
  );
  const [phoneNumbers, setPhoneNumbers] = useState(
    mockUserProfile.profile.phoneNumbers
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      email: mockUserProfile.email,
      fullName: mockUserProfile.profile.fullName,
      bio: mockUserProfile.profile.bio,
      lastEducationLevel: mockUserProfile.profile.lastEducationLevel,
      graduationYear: mockUserProfile.profile.graduationYear.toString(),
      institutionName: mockUserProfile.profile.institutionName,
      resumeUrl: mockUserProfile.profile.resumeUrl,
      portfolioUrl: mockUserProfile.profile.portfolioUrl,
      NIK: mockUserProfile.profile.NIK,
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const profileData = {
        ...data,
        graduationYear: data.graduationYear
          ? parseInt(data.graduationYear)
          : null,
        skills,
        socialLinks,
        phoneNumbers: phoneNumbers.filter(Boolean),
      };
      console.log("Profile data:", profileData);
      // Add your API call here
      // await fetch('/api/profile', { method: 'PUT', body: JSON.stringify(profileData) });

      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

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
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
            className={
              !isEditing
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                : ""
            }
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card className="shadow-lg border-t-4 border-t-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Your personal details and account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          disabled
                          className="bg-slate-50"
                        />
                      </FormControl>
                      <FormDescription>Email cannot be changed</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your full name"
                          {...field}
                          disabled={!isEditing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about yourself..."
                          rows={4}
                          {...field}
                          disabled={!isEditing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Education */}
            <Card className="shadow-lg border-t-4 border-t-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                  Education
                </CardTitle>
                <CardDescription>Your educational background</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="lastEducationLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Education Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!isEditing}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your education level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SMA">SMA</SelectItem>
                          <SelectItem value="D3">D3</SelectItem>
                          <SelectItem value="S1">S1</SelectItem>
                          <SelectItem value="S2">S2</SelectItem>
                          <SelectItem value="S3">S3</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="institutionName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institution Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="University/School name"
                          {...field}
                          disabled={!isEditing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="graduationYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Graduation Year</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 2023"
                          {...field}
                          disabled={!isEditing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Skills */}
            <Card className="shadow-lg border-t-4 border-t-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-green-600" />
                  Skills
                </CardTitle>
                <CardDescription>
                  Your technical and professional skills
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-blue-100 text-blue-700 px-3 py-1"
                    >
                      {skill}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addSkill())
                      }
                    />
                    <Button type="button" onClick={addSkill} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card className="shadow-lg border-t-4 border-t-orange-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5 text-orange-600" />
                  Social Links
                </CardTitle>
                <CardDescription>
                  Your professional profiles and portfolios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {socialLinks.map((link, index) => (
                  <div key={index} className="flex gap-2">
                    <Select
                      value={link.type}
                      onValueChange={(value) =>
                        updateSocialLink(index, "type", value)
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                        <SelectItem value="GitHub">GitHub</SelectItem>
                        <SelectItem value="Portfolio">Portfolio</SelectItem>
                        <SelectItem value="Twitter">Twitter</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) =>
                        updateSocialLink(index, "url", e.target.value)
                      }
                      disabled={!isEditing}
                      className="flex-1"
                    />
                    {isEditing && socialLinks.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeSocialLink(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {isEditing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSocialLink}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Social Link
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card className="shadow-lg border-t-4 border-t-pink-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-pink-600" />
                  Documents
                </CardTitle>
                <CardDescription>
                  Your resume and portfolio links
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="resumeUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Resume URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://drive.google.com/..."
                          {...field}
                          disabled={!isEditing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="portfolioUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://yourportfolio.com"
                          {...field}
                          disabled={!isEditing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Private Information */}
            <Card className="shadow-lg border-t-4 border-t-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IdCard className="h-5 w-5 text-red-600" />
                  Private Information
                </CardTitle>
                <CardDescription>
                  Your personal identification and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="NIK"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIK (National ID)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your national identification number"
                          {...field}
                          disabled={!isEditing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <FormLabel>Phone Numbers</FormLabel>
                  <div className="space-y-2 mt-2">
                    {phoneNumbers.map((phone, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="+62 xxx xxxx xxxx"
                          value={phone}
                          onChange={(e) =>
                            updatePhoneNumber(index, e.target.value)
                          }
                          disabled={!isEditing}
                          className="flex-1"
                        />
                        {isEditing && phoneNumbers.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removePhoneNumber(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addPhoneNumber}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Phone Number
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {isEditing && (
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={form.formState.isSubmitting}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
