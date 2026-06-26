import { useState } from "react";
import { EmailSelect } from "@/components/custom/select/email.select";
import { Label } from "@/components/ui/label";
import { useFieldContext } from "@/hooks/form.hook";
import type { Email } from "@/services/email.service";
import { ErrorDisplay } from "../error-display";

export function EmailSelectField({
  label,
  initialData,
}: {
  label: string;
  initialData?: Email;
}) {
  const field = useFieldContext<string>();
  const [selected, setSelected] = useState<Email | undefined>(initialData);
  const handleSelected = (email?: Email) => {
    setSelected(email);
    field.handleChange(email?.id ?? "");
  };
  return (
    <div className="grid gap-2">
      <Label className="text-xs font-semibold">{label}</Label>
      <EmailSelect selectedItem={selected} onSelect={handleSelected} />
      <ErrorDisplay errors={field.state.meta.errors} />
    </div>
  );
}
