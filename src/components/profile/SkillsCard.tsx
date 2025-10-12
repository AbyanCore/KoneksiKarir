import { Briefcase, Plus, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SkillsCardProps {
  skills: string[];
  newSkill: string;
  isEditing: boolean;
  onNewSkillChange: (value: string) => void;
  onAddSkill: () => void;
  onRemoveSkill: (skill: string) => void;
}

export default function SkillsCard({
  skills,
  newSkill,
  isEditing,
  onNewSkillChange,
  onAddSkill,
  onRemoveSkill,
}: SkillsCardProps) {
  return (
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
          {skills.length === 0 ? (
            <p className="text-sm text-slate-500">No skills added yet</p>
          ) : (
            skills.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="bg-blue-100 text-blue-700 px-3 py-1"
              >
                {skill}
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => onRemoveSkill(skill)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))
          )}
        </div>
        {isEditing && (
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill"
              value={newSkill}
              onChange={(e) => onNewSkillChange(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onAddSkill();
                }
              }}
            />
            <Button type="button" onClick={onAddSkill} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
