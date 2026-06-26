import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUBSCRIPTION_EXPIRY_NOTIFIER } from "@/constants/modifier.consf";
import type { MetadataObject } from "@/lib/metadata-converter";
import type { ModifierObject } from "../types/modifier.type";

interface DefaultValue {
  checked?: boolean;
  dday?: string;
}

export function SubscriptionExpiryNotifierModifier({
  defaultValue,
  onChange,
}: {
  defaultValue?: DefaultValue;
  onChange: (id: string, accountModifier: ModifierObject | null) => void;
}) {
  const [checked, setChecked] = useState<boolean>(!!defaultValue?.checked);
  const [dday, setDday] = useState<string>(defaultValue?.dday || "1");

  const handleCheckChange = (value: boolean) => {
    setChecked(value);
    if (!value) {
      onChange(SUBSCRIPTION_EXPIRY_NOTIFIER, null);
    } else {
      const metadata: Array<MetadataObject> = [{ key: "dday", value: dday }];
      onChange(SUBSCRIPTION_EXPIRY_NOTIFIER, {
        modifier_id: SUBSCRIPTION_EXPIRY_NOTIFIER,
        metadata,
      });
    }
  };

  const handleSelectDday = (value: string) => {
    setDday(value);
    if (checked) {
      const metadata: Array<MetadataObject> = [{ key: "dday", value }];
      onChange(SUBSCRIPTION_EXPIRY_NOTIFIER, {
        modifier_id: SUBSCRIPTION_EXPIRY_NOTIFIER,
        metadata,
      });
    }
  };

  return (
    <Collapsible
      open={checked}
      onOpenChange={handleCheckChange}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center gap-3">
        <Checkbox
          id="subs-expiry-notifier-checkbox"
          checked={checked}
          onCheckedChange={(value) => {
            handleCheckChange(value as boolean);
          }}
        />
        <Label
          htmlFor="subs-expiry-notifier-checkbox"
          className="cursor-pointer font-medium text-xs"
        >
          SUBSCRIPTION EXPIRY NOTIFIER
        </Label>
      </div>
      <CollapsibleContent className="flex flex-col gap-3 pl-7 animate-in fade-in duration-200">
        <Label
          htmlFor="subs-expiry-dday-select"
          className="text-xs text-muted-foreground"
        >
          H- Kirim Notifikasi
        </Label>
        <Select value={dday} onValueChange={handleSelectDday}>
          <SelectTrigger
            id="subs-expiry-dday-select"
            className="w-full h-9 text-xs"
          >
            <SelectValue placeholder="Pilih H-" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">h-1 Hari</SelectItem>
            <SelectItem value="2">h-2 Hari</SelectItem>
            <SelectItem value="3">h-3 Hari</SelectItem>
            <SelectItem value="4">h-4 Hari</SelectItem>
            <SelectItem value="5">h-5 Hari</SelectItem>
            <SelectItem value="6">h-6 Hari</SelectItem>
            <SelectItem value="7">h-7 Hari</SelectItem>
          </SelectContent>
        </Select>
      </CollapsibleContent>
    </Collapsible>
  );
}
