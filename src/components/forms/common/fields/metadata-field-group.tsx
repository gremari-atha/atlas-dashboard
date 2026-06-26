import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { withFieldGroup } from "@/hooks/form.hook";
import { cn } from "@/lib/utils";

interface MetadataFieldGroupValue {
  key: string;
  value: string;
}

export const MetadataFieldGroup = withFieldGroup({
  defaultValues: {
    key: "",
    value: "",
  } as MetadataFieldGroupValue,
  props: { className: "", label: "", onDelete: () => {} },
  render: function Render({ group, className, label, onDelete }) {
    return (
      <div
        className={cn(
          "relative flex flex-col gap-4 border border-border p-4 rounded-lg bg-card/50",
          className,
        )}
      >
        <p className="text-center font-semibold text-xs text-muted-foreground">
          {label}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          className="text-destructive hover:text-destructive/80 absolute top-2 right-2"
        >
          <Trash2 className="size-4" />
        </Button>
        <group.AppField name="key">
          {(field) => (
            <field.TextField
              label="Key"
              placeholder="Masukkan key dari metadata..."
            />
          )}
        </group.AppField>
        <group.AppField name="value">
          {(field) => (
            <field.TextField
              label="Value"
              placeholder="Masukkan value dari metadata..."
            />
          )}
        </group.AppField>
      </div>
    );
  },
});
