import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useFieldContext } from "@/hooks/form.hook";
import { formatDateIdStandard } from "@/lib/time-converter";
import { ErrorDisplay } from "../error-display";

export function DatePickerField({ label }: { label: string }) {
  const field = useFieldContext<Date | undefined>();
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  return (
    <div className="grid gap-2">
      <Label className="text-xs font-semibold">{label}</Label>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="justify-between font-normal text-xs h-9"
          >
            {field.state.value
              ? formatDateIdStandard(field.state.value)
              : "Pilih Tanggal"}
            <ChevronDownIcon className="size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={field.state.value as Date}
            onSelect={(date) => {
              field.handleChange(date);
              setPopoverOpen(false);
            }}
            required
          />
        </PopoverContent>
      </Popover>
      <ErrorDisplay errors={field.state.meta.errors} />
    </div>
  );
}
