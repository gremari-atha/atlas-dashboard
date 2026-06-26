import { z } from "zod";
import { useAppForm } from "@/hooks/form.hook";
import type { PlatformProduct } from "@/services/platform-product.service";

export const PlatformProductFormSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
  platform: z.string().min(1, "Platform wajib diisi"),
  variant: z.string(),
  platform_product_id: z.string(),
  product_variant_id: z.string().min(1, "Varian produk wajib diisi"),
});

export type PlatformProductFormSubmitData = z.infer<
  typeof PlatformProductFormSchema
>;

export function PlatformProductForm({
  onSubmit,
  isPending,
  initialData,
  submitButtonText,
}: {
  onSubmit: (values: PlatformProductFormSubmitData) => void;
  isPending: boolean;
  initialData?: PlatformProduct;
  submitButtonText?: string;
}) {
  const form = useAppForm({
    validators: { onSubmit: PlatformProductFormSchema },
    defaultValues: {
      name: initialData?.name ?? "",
      platform: initialData?.platform ?? "",
      variant: initialData?.variant ?? "",
      platform_product_id: initialData?.platform_product_id ?? "",
      product_variant_id: initialData?.product_variant_id ?? "",
    },
    onSubmit: ({ value }) => {
      onSubmit(value);
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
        <div className="flex flex-col gap-5">
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Nama Produk Platform"
                placeholder="masukkan nama produk sesuai nama di platform..."
              />
            )}
          </form.AppField>

          <form.AppField name="variant">
            {(field) => (
              <field.TextField
                label="Variant (Opsional)"
                placeholder="masukkan variant sesuai platform..."
              />
            )}
          </form.AppField>

          <form.AppField name="platform_product_id">
            {(field) => (
              <field.TextField
                label="ID Produk Platform (Opsional)"
                placeholder="masukkan id produk sesuai id di platform..."
              />
            )}
          </form.AppField>

          <form.AppField name="platform">
            {(field) => (
              <field.SelecField
                label="Platform"
                placeholder="Pilih Platform..."
                selectItems={[{ title: "Shopee", value: "Shopee" }]}
              />
            )}
          </form.AppField>

          <form.AppField name="product_variant_id">
            {(field) => (
              <field.ProductVariantSelectField
                label="Varian Produk"
                initialData={initialData?.product_variant}
              />
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
