import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/form.hook";

const TransactionItemFormSchema = z.object({
  product_variant_id: z.string().min(1, "Varian produk wajib diisi"),
  price: z.string().optional(),
});

export const TransactionFormSchema = z.object({
  customer: z.string().min(1, "Nama customer wajib diisi"),
  platform: z.string().min(1, "Platform wajib diisi"),
  items: z.array(TransactionItemFormSchema).min(1, "Minimal harus ada 1 item"),
});

export type TransactionFormSubmitData = z.infer<typeof TransactionFormSchema>;

export function TransactionCreateForm({
  onSubmit,
  isPending,
  submitButtonText,
}: {
  onSubmit: (values: TransactionFormSubmitData) => void;
  isPending: boolean;
  submitButtonText?: string;
}) {
  const form = useAppForm({
    validators: { onSubmit: TransactionFormSchema },
    defaultValues: {
      customer: "",
      platform: "",
      items: [
        {
          product_variant_id: "",
          price: "",
        },
      ],
    } as TransactionFormSubmitData,
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
          <form.AppField name="customer">
            {(field) => (
              <field.TextField
                label="Nama Customer"
                placeholder="Masukkan nama customer..."
              />
            )}
          </form.AppField>

          <form.AppField name="platform">
            {(field) => (
              <field.SelecField
                label="Platform"
                placeholder="Pilih Platform..."
                selectItems={[
                  { title: "Shopee", value: "Shopee" },
                  { title: "Whatsapp", value: "Whatsapp" },
                ]}
              />
            )}
          </form.AppField>

          <form.AppField name="items" mode="array">
            {(field) => (
              <div className="flex flex-col gap-5">
                <div className="flex justify-between items-center pb-2 border-b border-border/40">
                  <p className="text-sm font-semibold text-foreground">
                    Daftar Item Sewa
                  </p>
                </div>

                {field.state.value.map((_, i) => (
                  <div
                    key={`item-${i}`}
                    className="relative border border-border/60 bg-muted/20 space-y-6 p-4 rounded-xl shadow-sm animate-in fade-in duration-200"
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Item #{i + 1}
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

                    <form.AppField name={`items[${i}].product_variant_id`}>
                      {(subfield) => (
                        <subfield.ProductVariantSelectField label="Varian Produk" />
                      )}
                    </form.AppField>

                    <form.AppField name={`items[${i}].price`}>
                      {(subfield) => (
                        <subfield.TextWithOptions
                          id={`variant-price-${i}`}
                          itemStorageName="total-price"
                          label="Harga Khusus (opsional)"
                          type="number"
                          placeholder="Kosongkan untuk menggunakan harga dasar varian..."
                        />
                      )}
                    </form.AppField>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    field.pushValue({
                      product_variant_id: "",
                      price: "",
                    })
                  }
                  className="w-full cursor-pointer hover:bg-muted"
                >
                  <Plus className="mr-2 size-4" />
                  Tambah Item
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
