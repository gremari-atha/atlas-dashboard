import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFieldContext } from "@/hooks/form.hook";
import { ErrorDisplay } from "../error-display";

export function TextareaField({
  label,
  placeholder,
}: {
  label: string;
  placeholder?: string;
}) {
  const field = useFieldContext<string>();
  return (
    <div className="grid gap-2">
      <Label htmlFor={field.name} className="text-xs font-semibold">
        {label}
      </Label>
      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-20 text-xs"
      />
      <ErrorDisplay errors={field.state.meta.errors} />
    </div>
  );
}
