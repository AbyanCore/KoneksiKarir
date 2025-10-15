import { GraduationCap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
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
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface EducationCardProps {
  form: UseFormReturn<any>;
  isEditing: boolean;
}

export default function EducationCard({ form, isEditing }: EducationCardProps) {
  return (
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
              <FormControl>
                {isEditing ? (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SMA/SMK">SMA/SMK</SelectItem>
                      <SelectItem value="D3">D3 (Diploma)</SelectItem>
                      <SelectItem value="D4/S1">D4/S1 (Bachelor)</SelectItem>
                      <SelectItem value="S2">S2 (Master)</SelectItem>
                      <SelectItem value="S3">S3 (PhD)</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {field.value || "Not specified"}
                  </div>
                )}
              </FormControl>
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
  );
}
