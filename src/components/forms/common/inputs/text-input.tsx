import type React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ErrorDisplay } from "../error-display";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  errors?: any;
}

export function TextInput({
  label,
  errors,
  id,
  ...attributes
}: TextInputProps) {
  return (
    <div className="grid gap-3">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...attributes} />
      <ErrorDisplay errors={errors} />
    </div>
  );
}
