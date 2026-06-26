import { z } from "zod";
import { useAppForm } from "@/hooks/form.hook";
import type { Product } from "@/services/product.service";

export const ProductEditFormSchema = z.object({
  name: z.string().min(1, "Nama produk wajib diisi"),
});

export type ProductEditFormSubmitData = z.infer<typeof ProductEditFormSchema>;

export function ProductEditForm({
  onSubmit,
  isPending,
  initialData,
  submitButtonText,
}: {
  onSubmit: (values: ProductEditFormSubmitData) => void;
  isPending: boolean;
  initialData: Product;
  submitButtonText?: string;
}) {
  const form = useAppForm({
    validators: { onSubmit: ProductEditFormSchema },
    defaultValues: {
      name: initialData.name,
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
        <div className="flex flex-col gap-6">
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Nama Produk"
                placeholder="masukkan nama produk..."
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
