import { z } from "zod";
import { AccountStatusSelect } from "@/constants/account-status-select";
import { useAppForm } from "@/hooks/form.hook";
import type { Account } from "@/services/account.service";

export const AccountEditFormSchema = z.object({
  email_id: z.string().min(1, "Email wajib diisi"),
  account_password: z.string().optional(),
  subscription_expiry: z.date().optional(),
  status: z.string(),
  billing: z.string(),
  label: z.string(),
  product_variant_id: z.string().min(1, "Varian produk wajib diisi"),
});

export type AccountEditFormSubmitData = z.infer<typeof AccountEditFormSchema>;

export function AccountEditForm({
  onSubmit,
  isPending,
  initialData,
  submitButtonText,
}: {
  onSubmit: (values: AccountEditFormSubmitData) => void;
  isPending: boolean;
  initialData?: Account;
  submitButtonText?: string;
}) {
  const form = useAppForm({
    validators: { onSubmit: AccountEditFormSchema },
    defaultValues: {
      email_id: initialData?.email_id || "",
      account_password: initialData?.account_password || "",
      subscription_expiry: initialData?.subscription_expiry
        ? new Date(initialData.subscription_expiry)
        : undefined,
      status: initialData?.status || "",
      billing: initialData?.billing || "",
      label: initialData?.label || "",
      product_variant_id: initialData?.product_variant_id || "",
    } as AccountEditFormSubmitData,
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
          <form.AppField name="email_id">
            {(field) => (
              <field.EmailSelectField
                label="Email"
                initialData={initialData?.email}
              />
            )}
          </form.AppField>

          <form.AppField name="account_password">
            {(field) => (
              <field.TextField
                label="Password Akun"
                placeholder="Masukkan password akun baru..."
              />
            )}
          </form.AppField>

          <form.AppField name="subscription_expiry">
            {(field) => <field.DatePickerField label="Langganan Berakhir" />}
          </form.AppField>

          <form.AppField name="status">
            {(field) => (
              <field.SelecField
                label="Status"
                placeholder="Pilih Status..."
                selectItems={AccountStatusSelect}
              />
            )}
          </form.AppField>

          <form.AppField name="billing">
            {(field) => (
              <field.TextField
                label="Billing (Opsional)"
                placeholder="Masukkan metode pembayaran untuk akun..."
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

          <form.AppField name="label">
            {(field) => (
              <field.TextField
                label="Label / Catatan (Opsional)"
                placeholder="Masukkan catatan untuk akun..."
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
