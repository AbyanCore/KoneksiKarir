import { LinkIcon as LinkIcon2, Plus, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SocialLink {
  type: string;
  url: string;
}

interface SocialLinksCardProps {
  socialLinks: SocialLink[];
  isEditing: boolean;
  onUpdateLink: (index: number, field: "type" | "url", value: string) => void;
  onAddLink: () => void;
  onRemoveLink: (index: number) => void;
}

export default function SocialLinksCard({
  socialLinks,
  isEditing,
  onUpdateLink,
  onAddLink,
  onRemoveLink,
}: SocialLinksCardProps) {
  return (
    <Card className="shadow-lg border-t-4 border-t-orange-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LinkIcon2 className="h-5 w-5 text-orange-600" />
          Social Links
        </CardTitle>
        <CardDescription>
          Your professional profiles and portfolios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {socialLinks.length === 0 ? (
          <p className="text-sm text-slate-500">No social links added yet</p>
        ) : (
          socialLinks.map((link, index) => (
            <div key={index} className="flex gap-2">
              <Select
                value={link.type}
                onValueChange={(value) => onUpdateLink(index, "type", value)}
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
                onChange={(e) => onUpdateLink(index, "url", e.target.value)}
                disabled={!isEditing}
                className="flex-1"
              />
              {isEditing && socialLinks.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => onRemoveLink(index)}
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
            onClick={onAddLink}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Social Link
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
