"use client";

import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CourseSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CourseSearch({
  value,
  onChange,
  placeholder = "Buscar cursos por nombre o periodo...",
}: CourseSearchProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="course-search" className="sr-only">
        Buscar cursos
      </Label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="course-search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
        />
      </div>
    </div>
  );
}
