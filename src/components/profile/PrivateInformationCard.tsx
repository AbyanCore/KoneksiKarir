import { IdCard, Plus, X } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";

interface PrivateInformationCardProps {
  form: UseFormReturn<any>;
  phoneNumbers: string[];
  isEditing: boolean;
  onUpdatePhoneNumber: (index: number, value: string) => void;
  onAddPhoneNumber: () => void;
  onRemovePhoneNumber: (index: number) => void;
}

export default function PrivateInformationCard({
  form,
  phoneNumbers,
  isEditing,
  onUpdatePhoneNumber,
  onAddPhoneNumber,
  onRemovePhoneNumber,
}: PrivateInformationCardProps) {
  return (
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
            {phoneNumbers.length === 0 ? (
              <p className="text-sm text-slate-500">
                No phone numbers added yet
              </p>
            ) : (
              phoneNumbers.map((phone, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="+62 xxx xxxx xxxx"
                    value={phone}
                    onChange={(e) => onUpdatePhoneNumber(index, e.target.value)}
                    disabled={!isEditing}
                    className="flex-1"
                  />
                  {isEditing && phoneNumbers.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => onRemovePhoneNumber(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            )}
            {isEditing && (
              <Button
                type="button"
                variant="outline"
                onClick={onAddPhoneNumber}
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
  );
}
