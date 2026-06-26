import { ChevronDownIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange, DayPickerProps } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDateIdStandard } from "@/lib/time-converter";
import { ErrorDisplay } from "../error-display";

type DatePickerProps = DayPickerProps & {
  label: string;
  closeAfterSelect?: boolean;
  value?: Date | DateRange;
  placeholder?: string;
  errors?: any;
};

export function DatePickerInput({
  label,
  errors,
  value,
  placeholder,
  ...attributes
}: DatePickerProps) {
  const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
  const buttonPlaceholder = useMemo(() => {
    if (value) {
      if (value instanceof Date) {
        return formatDateIdStandard(value);
      }
      const valRange = value as DateRange;
      return `${formatDateIdStandard(valRange.from, true)} - ${formatDateIdStandard(valRange.to, true)}`;
    }
    return placeholder || "Pilih Tanggal";
  }, [value, placeholder]);

  return (
    <div className="grid gap-3">
      <Label>{label}</Label>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="justify-between font-normal gap-2"
          >
            {buttonPlaceholder}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar {...attributes} />
        </PopoverContent>
      </Popover>
      <ErrorDisplay errors={errors} />
    </div>
  );
}
