import { ChevronsUpDown } from "lucide-react";
import type { z } from "zod";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useAppForm } from "@/hooks/form.hook";
import type { TimeUnit } from "@/lib/time-converter";
import { convertTimeUnit } from "@/lib/time-converter";
import type { ProductVariant } from "@/services/product.service";
import { DurationFieldGroup } from "./common/fields/duration-field-group";
import { ProductVariantFormSchema } from "./common/schemas/product-variant-form.schema";

export type ProductVariantFormSubmitData = z.infer<
  typeof ProductVariantFormSchema
>;

export function ProductVariantForm({
  onSubmit,
  isPending,
  initialData,
  submitButtonText,
}: {
  onSubmit: (values: ProductVariantFormSubmitData) => void;
  isPending: boolean;
  initialData?: ProductVariant;
  submitButtonText?: string;
}) {
  const form = useAppForm({
    validators: { onSubmit: ProductVariantFormSchema },
    defaultValues: {
      name: initialData?.name ?? "",
      base_price: initialData?.base_price ?? "",
      duration: initialData?.duration.toString() ?? "",
      duration_unit: (initialData?.duration_unit as TimeUnit) ?? "millisecond",
      interval: initialData?.interval.toString() ?? "",
      interval_unit: (initialData?.interval_unit as TimeUnit) ?? "millisecond",
      cooldown: initialData?.cooldown.toString() ?? "",
      cooldown_unit: (initialData?.cooldown_unit as TimeUnit) ?? "millisecond",
      copy_template: initialData?.copy_template ?? "",
    },
    onSubmit: ({ value }) => {
      const duration = convertTimeUnit(
        Number.parseInt(value.duration, 10),
        value.duration_unit as TimeUnit,
        "millisecond",
      );
      const interval = convertTimeUnit(
        Number.parseInt(value.interval, 10),
        value.interval_unit as TimeUnit,
        "millisecond",
      );
      const cooldown = convertTimeUnit(
        Number.parseInt(value.cooldown, 10),
        value.cooldown_unit as TimeUnit,
        "millisecond",
      );
      onSubmit({
        ...value,
        duration: duration.toString(),
        duration_unit: "millisecond" as TimeUnit,
        interval: interval.toString(),
        interval_unit: "millisecond" as TimeUnit,
        cooldown: cooldown.toString(),
        cooldown_unit: "millisecond" as TimeUnit,
      });
    },
  });

  return (
    <form.AppForm>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="flex flex-col gap-6 py-2">
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Nama"
                placeholder="masukkan nama varian produk..."
              />
            )}
          </form.AppField>
          <form.AppField name="base_price">
            {(field) => (
              <field.TextField
                label="Harga Dasar"
                type="number"
                placeholder="masukkan harga dasar varian..."
              />
            )}
          </form.AppField>
          <DurationFieldGroup
            form={form}
            fields={{
              duration: "duration",
              unit: "duration_unit",
            }}
            label="Durasi"
            name="duration"
            placeholder="masukkan durasi..."
          />
          <DurationFieldGroup
            form={form}
            fields={{
              duration: "interval",
              unit: "interval_unit",
            }}
            label="Interval"
            name="interval"
            placeholder="masukkan interval..."
          />
          <DurationFieldGroup
            form={form}
            fields={{
              duration: "cooldown",
              unit: "cooldown_unit",
            }}
            label="Cooldown"
            name="cooldown"
            placeholder="masukkan cooldown..."
          />
          <form.AppField name="copy_template">
            {(field) => (
              <div className="space-y-2">
                <field.TextareaField
                  label="Template Salin"
                  placeholder="masukkan template salin..."
                />
                <Collapsible>
                  <CollapsibleTrigger className="text-primary text-xs hover:underline inline-flex items-center gap-1 cursor-pointer font-medium">
                    Tampilkan Daftar Placeholder Template
                    <ChevronsUpDown className="size-3.5" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="text-xs space-y-2 mt-2 bg-muted/40 p-3 rounded-lg border border-border/30">
                    <div className="space-y-0.5">
                      <p className="font-mono font-bold text-foreground">
                        $$email
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        email akun
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-mono font-bold text-foreground">
                        $$password
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        password akun
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-mono font-bold text-foreground">
                        $$profile
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        profile akun
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-mono font-bold text-foreground">
                        $$product
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        produk yang disewa
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-mono font-bold text-foreground">
                        $$expired
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        waktu sewa berakhir
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-mono font-bold text-foreground">
                        $$metadata.[key]
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        menampilkan value dari metadata di profil sesuai key
                        nya. misal $$metadata.pin
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </form.AppField>
          <form.SubscribeButton
            isPending={isPending}
            label={submitButtonText}
          />
        </div>
      </form>
    </form.AppForm>
  );
}
