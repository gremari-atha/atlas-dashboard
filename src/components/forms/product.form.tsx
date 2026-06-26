import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/form.hook";
import type { TimeUnit } from "@/lib/time-converter";
import { convertTimeUnit } from "@/lib/time-converter";
import type { Product } from "@/services/product.service";
import { DurationFieldGroup } from "./common/fields/duration-field-group";
import { ProductVariantFormSchema } from "./common/schemas/product-variant-form.schema";

export const ProductFormSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  variants: z
    .array(ProductVariantFormSchema)
    .min(1, "Varian minimal harus ada 1"),
});

export type ProductFormSubmitData = z.infer<typeof ProductFormSchema>;

function getInitialData(data?: Product): ProductFormSubmitData {
  if (!data) {
    return {
      name: "",
      variants: [
        {
          name: "",
          base_price: "",
          cooldown: "",
          cooldown_unit: "millisecond",
          duration: "",
          duration_unit: "millisecond",
          interval: "",
          interval_unit: "millisecond",
          copy_template: "",
        },
      ],
    };
  }

  const variants = data.variants.map((v) => {
    return {
      name: v.name,
      base_price: v.base_price?.toString() || "",
      duration: v.duration.toString(),
      duration_unit: (v.duration_unit as TimeUnit) || "millisecond",
      interval: v.interval.toString(),
      interval_unit: (v.interval_unit as TimeUnit) || "millisecond",
      cooldown: v.cooldown.toString(),
      cooldown_unit: (v.cooldown_unit as TimeUnit) || "millisecond",
      copy_template: v.copy_template || "",
    };
  });

  return {
    name: data.name,
    variants,
  };
}

export function ProductForm({
  onSubmit,
  isPending,
  initialData,
  submitButtonText,
}: {
  onSubmit: (values: ProductFormSubmitData) => void;
  isPending: boolean;
  initialData?: Product;
  submitButtonText?: string;
}) {
  const form = useAppForm({
    validators: { onSubmit: ProductFormSchema },
    defaultValues: getInitialData(initialData),
    onSubmit: ({ value }) => {
      const variants = value.variants.map((v) => {
        const duration = convertTimeUnit(
          Number.parseInt(v.duration, 10),
          v.duration_unit as TimeUnit,
          "millisecond",
        );
        const interval = convertTimeUnit(
          Number.parseInt(v.interval, 10),
          v.interval_unit as TimeUnit,
          "millisecond",
        );
        const cooldown = convertTimeUnit(
          Number.parseInt(v.cooldown, 10),
          v.cooldown_unit as TimeUnit,
          "millisecond",
        );
        return {
          name: v.name,
          duration: duration.toString(),
          duration_unit: "millisecond" as TimeUnit,
          interval: interval.toString(),
          interval_unit: "millisecond" as TimeUnit,
          cooldown: cooldown.toString(),
          cooldown_unit: "millisecond" as TimeUnit,
          base_price: v.base_price,
          copy_template: v.copy_template,
        };
      });
      onSubmit({ name: value.name, variants });
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
        <div className="flex flex-col gap-6">
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Nama Produk"
                placeholder="masukkan nama produk..."
              />
            )}
          </form.AppField>

          <form.AppField name="variants" mode="array">
            {(field) => (
              <div className="flex flex-col gap-5">
                {field.state.value.map((_, i) => {
                  return (
                    <div
                      key={`variant-${i}`}
                      className="relative border border-border/60 bg-muted/20 space-y-6 p-4 rounded-xl shadow-sm animate-in fade-in duration-200"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-border/40">
                        <p className="text-sm font-semibold text-foreground">
                          Varian #{i + 1}
                        </p>
                        {field.state.value.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              field.removeValue(i);
                            }}
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>

                      <form.AppField name={`variants[${i}].name`}>
                        {(subfield) => (
                          <subfield.TextField
                            label="Nama Varian"
                            placeholder="masukkan nama varian produk..."
                          />
                        )}
                      </form.AppField>

                      <form.AppField name={`variants[${i}].base_price`}>
                        {(subfield) => (
                          <subfield.TextField
                            label="Harga Dasar"
                            type="number"
                            placeholder="masukkan harga dasar varian..."
                          />
                        )}
                      </form.AppField>

                      <DurationFieldGroup
                        form={form}
                        fields={{
                          duration: `variants[${i}].duration`,
                          unit: `variants[${i}].duration_unit`,
                        }}
                        label="Durasi"
                        name={`duration-${i}`}
                        placeholder="masukkan durasi..."
                      />

                      <DurationFieldGroup
                        form={form}
                        fields={{
                          duration: `variants[${i}].interval`,
                          unit: `variants[${i}].interval_unit`,
                        }}
                        label="Interval"
                        name={`interval-${i}`}
                        placeholder="masukkan interval..."
                      />

                      <DurationFieldGroup
                        form={form}
                        fields={{
                          duration: `variants[${i}].cooldown`,
                          unit: `variants[${i}].cooldown_unit`,
                        }}
                        label="Cooldown"
                        name={`cooldown-${i}`}
                        placeholder="masukkan cooldown..."
                      />

                      <form.AppField name={`variants[${i}].copy_template`}>
                        {(subfield) => (
                          <subfield.TextareaField
                            label="Template Salin"
                            placeholder="masukkan template salin..."
                          />
                        )}
                      </form.AppField>
                    </div>
                  );
                })}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    field.pushValue({
                      name: "",
                      base_price: "",
                      duration: "",
                      duration_unit: "millisecond",
                      interval: "",
                      interval_unit: "millisecond",
                      cooldown: "",
                      cooldown_unit: "millisecond",
                      copy_template: "",
                    })
                  }
                  className="w-full cursor-pointer hover:bg-muted"
                >
                  <Plus className="mr-2 size-4" />
                  Tambah Varian
                </Button>
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
