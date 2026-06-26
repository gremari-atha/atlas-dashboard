import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { withFieldGroup } from "@/hooks/form.hook";
import type { TimeUnit } from "@/lib/time-converter";
import { ErrorDisplay } from "../error-display";

interface DurationFieldGroupValue {
  duration: string;
  unit: TimeUnit | string;
}

export const DurationFieldGroup = withFieldGroup({
  defaultValues: {
    duration: "",
    unit: "millisecond",
  } as DurationFieldGroupValue,
  props: {
    label: "",
    name: "",
    placeholder: "masukkan nilai waktu...",
  },
  render: function Render({ group, label, name, placeholder }) {
    return (
      <div className="grid grid-cols-4 gap-3">
        <Label htmlFor={name} className="col-span-full text-xs font-semibold">
          {label}
        </Label>
        <group.AppField name="duration">
          {(field) => (
            <div className="col-span-3">
              <Input
                id={name}
                name={name}
                type="number"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder={placeholder}
                className="h-9 text-xs"
              />
              <ErrorDisplay errors={field.state.meta.errors} />
            </div>
          )}
        </group.AppField>
        <group.AppField name="unit">
          {(field) => (
            <Select
              name={field.name}
              defaultValue={field.state.value || "millisecond"}
              onValueChange={(value) => {
                field.handleChange(value as TimeUnit);
              }}
            >
              <SelectTrigger className="w-full h-9 text-xs">
                <SelectValue placeholder="Satuan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="millisecond">milidetik</SelectItem>
                <SelectItem value="second">detik</SelectItem>
                <SelectItem value="minute">menit</SelectItem>
                <SelectItem value="hour">jam</SelectItem>
                <SelectItem value="day">hari</SelectItem>
              </SelectContent>
            </Select>
          )}
        </group.AppField>
      </div>
    );
  },
});
