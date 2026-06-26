import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { AccountStatusSelect } from "@/constants/account-status-select";
import { useAppForm } from "@/hooks/form.hook";
import { cn } from "@/lib/utils";
import { MetadataFieldGroup } from "./common/fields/metadata-field-group";
import { AccountModifierFormSchema } from "./common/schemas/account-modifier-form.schema";
import { AccountProfileFormSchema } from "./common/schemas/account-profile-form.schema";

export const AccountFormSchema = z.object({
  email_id: z.string().min(1, "Email wajib diisi"),
  account_password: z.string().min(1, "Password wajib diisi"),
  subscription_expiry: z.date().optional(),
  status: z.string(),
  billing: z.string(),
  label: z.string(),
  product_variant_id: z.string().min(1, "Varian produk wajib diisi"),
  profile: z
    .array(AccountProfileFormSchema)
    .min(1, "Minimal harus ada satu profil"),
  modifier: z.array(AccountModifierFormSchema),
});

export type AccountFormSubmitData = z.infer<typeof AccountFormSchema>;

export function AccountCreateForm({
  onSubmit,
  isPending,
  submitButtonText,
}: {
  onSubmit: (values: AccountFormSubmitData) => void;
  isPending: boolean;
  submitButtonText?: string;
}) {
  const form = useAppForm({
    validators: { onSubmit: AccountFormSchema },
    defaultValues: {
      email_id: "",
      account_password: "",
      subscription_expiry: undefined,
      status: "",
      billing: "",
      label: "",
      product_variant_id: "",
      profile: [
        {
          name: "",
          max_user: "",
          allow_generate: true,
          metadata: [],
        },
      ],
      modifier: [],
    } as AccountFormSubmitData,
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
          <form.AppField name="email_id">
            {(field) => <field.EmailSelectField label="Email" />}
          </form.AppField>

          <form.AppField name="account_password">
            {(field) => (
              <field.TextField
                label="Password Akun"
                placeholder="Masukkan password akun..."
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
              <field.ProductVariantSelectField label="Varian Produk" />
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

          <form.AppField name="profile" mode="array">
            {(field) => (
              <div className="flex flex-col gap-4 border-t border-border pt-4">
                <p className="text-sm font-semibold text-foreground">
                  Profil Akun
                </p>
                {field.state.value.map((_, i) => (
                  <div
                    key={`profile-${i}`}
                    className="relative border border-border space-y-6 p-4 rounded-lg bg-card/25"
                  >
                    <p className="text-center font-semibold text-xs text-muted-foreground">
                      Profil {i + 1}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => {
                        field.removeValue(i);
                      }}
                      className={cn(
                        "text-destructive hover:text-destructive/80 absolute top-2 right-2",
                        i === 0 ? "hidden" : "block",
                      )}
                    >
                      <Trash2 className="size-4" />
                    </Button>

                    <form.AppField name={`profile[${i}].name`}>
                      {(subfield) => (
                        <subfield.TextField
                          label="Nama Profil"
                          placeholder="Masukkan nama profil..."
                        />
                      )}
                    </form.AppField>

                    <form.AppField name={`profile[${i}].max_user`}>
                      {(subfield) => (
                        <subfield.TextField
                          label="Maksimal User"
                          type="number"
                          placeholder="Masukkan jumlah maksimal user..."
                        />
                      )}
                    </form.AppField>

                    <form.AppField name={`profile[${i}].allow_generate`}>
                      {(subfield) => (
                        <subfield.BooleanCheckboxField label="Izinkan Generate Akun" />
                      )}
                    </form.AppField>

                    <form.AppField name={`profile[${i}].metadata`} mode="array">
                      {(subfield) => (
                        <div className="flex flex-col gap-4 border-t border-border/40 pt-4">
                          <span className="text-xs font-semibold text-muted-foreground">
                            Metadata
                          </span>
                          {subfield.state.value.map((__, j) => (
                            <MetadataFieldGroup
                              key={`profile-${i}-metadata-${j}`}
                              form={form}
                              fields={{
                                key: `profile[${i}].metadata[${j}].key`,
                                value: `profile[${i}].metadata[${j}].value`,
                              }}
                              label={`Metadata ${j + 1}`}
                              onDelete={() => {
                                subfield.removeValue(j);
                              }}
                              className="border border-border/40 p-4 rounded-lg bg-card/10"
                            />
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              subfield.pushValue({
                                key: "",
                                value: "",
                              })
                            }
                            className="w-full cursor-pointer text-xs"
                          >
                            <Plus className="size-3.5 mr-1" />
                            Tambah Metadata
                          </Button>
                        </div>
                      )}
                    </form.AppField>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    field.pushValue({
                      name: "",
                      max_user: "",
                      allow_generate: true,
                      metadata: [],
                    })
                  }
                  className="w-full cursor-pointer text-xs"
                >
                  <Plus className="size-3.5 mr-1" />
                  Tambah Profil
                </Button>
              </div>
            )}
          </form.AppField>

          <div className="flex flex-col gap-4 border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground">
              Modifier Akun
            </p>
            <form.AppField name="modifier">
              {(field) => <field.AccountModifierField />}
            </form.AppField>
          </div>

          <form.SubscribeButton
            isPending={isPending}
            label={submitButtonText}
          />
        </div>
      </form>
    </form.AppForm>
  );
}
