import { useState } from "react";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { useAppForm } from "@/hooks/form.hook";
import type { ProductVariant } from "@/services/product.service";

const AccountUserTransactionFormSchema = z.object({
  platform: z.string().min(1, "Platform wajib diisi"),
});

export const AccountUserFormSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  product_variant_id: z.string().min(1, "Varian produk wajib diisi"),
  account_profile_id: z.string().optional(),
  price: z.string(),
  transaction: AccountUserTransactionFormSchema.optional(),
  expired_at: z.date().optional(),
});

export type AccountUserFormSubmitData = z.infer<typeof AccountUserFormSchema>;

export interface AccountUserFormInitialData {
  product_variant_id: string;
  product_variant: ProductVariant;
  account_profile_id: string;
}

export function AccountUserForm({
  onSubmit,
  isPending,
  initialData,
  submitButtonText,
}: {
  onSubmit: (values: AccountUserFormSubmitData) => void;
  isPending: boolean;
  initialData?: AccountUserFormInitialData;
  submitButtonText?: string;
}) {
  const form = useAppForm({
    validators: { onSubmit: AccountUserFormSchema },
    defaultValues: {
      name: "",
      product_variant_id: initialData?.product_variant_id || "",
      account_profile_id: initialData?.account_profile_id || undefined,
      price: "",
      transaction: {
        platform: "",
      },
      expired_at: undefined,
    } as AccountUserFormSubmitData,
    onSubmit: ({ value }) => {
      onSubmit({ ...value });
    },
  });

  const [withTransaction, setWithTransaction] = useState<boolean>(true);
  const [overwriteExpiredAt, setOverwriteExpiredAt] = useState<boolean>(false);

  const handleWithTransactionChange = (value: boolean) => {
    if (value) {
      form.setFieldValue("transaction", { platform: "" });
    } else {
      form.setFieldValue("transaction", undefined);
    }
    setWithTransaction(value);
  };

  const handleOverwriteExpiredAtChange = (value: boolean) => {
    if (!value && !!form.getFieldValue("expired_at")) {
      form.setFieldValue("expired_at", undefined);
    }
    setOverwriteExpiredAt(value);
  };

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
                label="Nama User"
                placeholder="Masukkan nama user..."
              />
            )}
          </form.AppField>

          <form.AppField name="product_variant_id">
            {(field) => (
              <field.ProductVariantSelectField
                label="Varian Produk"
                initialData={initialData?.product_variant}
                disabled={!!initialData && !!initialData.product_variant_id}
              />
            )}
          </form.AppField>

          <Collapsible
            open={withTransaction}
            onOpenChange={handleWithTransactionChange}
            className="flex flex-col gap-3 border border-border/40 p-4 rounded-lg bg-card/25"
          >
            <div className="flex items-center gap-3">
              <Checkbox
                id="with-transaction-checkbox"
                checked={withTransaction}
                onCheckedChange={(value) => {
                  handleWithTransactionChange(value as boolean);
                }}
              />
              <Label
                htmlFor="with-transaction-checkbox"
                className="cursor-pointer text-xs font-semibold"
              >
                Simpan Transaksi
              </Label>
            </div>
            <CollapsibleContent className="flex flex-col gap-4 pl-7 animate-in fade-in duration-200">
              {withTransaction && (
                <>
                  <form.AppField name="transaction.platform">
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
                  <form.AppField name="price">
                    {(field) => (
                      <field.TextWithOptions
                        id="price"
                        itemStorageName="total-price"
                        label="Harga (Opsional)"
                        type="number"
                        placeholder="Gunakan harga dasar jika kosong..."
                      />
                    )}
                  </form.AppField>
                </>
              )}
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={overwriteExpiredAt}
            onOpenChange={handleOverwriteExpiredAtChange}
            className="flex flex-col gap-3 border border-border/40 p-4 rounded-lg bg-card/25"
          >
            <div className="flex items-center gap-3">
              <Checkbox
                id="overwrite-expired-checkbox"
                checked={overwriteExpiredAt}
                onCheckedChange={(value) => {
                  handleOverwriteExpiredAtChange(value as boolean);
                }}
              />
              <Label
                htmlFor="overwrite-expired-checkbox"
                className="cursor-pointer text-xs font-semibold"
              >
                Overwrite Tanggal Berakhir
              </Label>
            </div>
            <CollapsibleContent className="flex flex-col gap-4 pl-7 animate-in fade-in duration-200">
              <form.AppField name="expired_at">
                {(field) => (
                  <field.DatePickerField label="Pilih Tanggal Berakhir" />
                )}
              </form.AppField>
            </CollapsibleContent>
          </Collapsible>

          <form.SubscribeButton
            isPending={isPending}
            label={submitButtonText}
          />
        </div>
      </form>
    </form.AppForm>
  );
}
