import { Plus } from "lucide-react";
import type z from "zod";
import { Button } from "@/components/ui/button";
import { useAppForm } from "@/hooks/form.hook";
import type { AccountProfile } from "@/services/account.service";
import { MetadataFieldGroup } from "./common/fields/metadata-field-group";
import { AccountProfileFormSchema } from "./common/schemas/account-profile-form.schema";
import type { MetadataFormObject } from "./common/schemas/metadata-form.schema";

export type AccountProfileFormSubmitData = z.infer<
  typeof AccountProfileFormSchema
>;

export function AccountProfileForm({
  onSubmit,
  isPending,
  initialData,
  submitButtonText,
}: {
  onSubmit: (values: AccountProfileFormSubmitData) => void;
  isPending: boolean;
  initialData?: AccountProfile;
  submitButtonText?: string;
}) {
  const form = useAppForm({
    validators: { onSubmit: AccountProfileFormSchema },
    defaultValues: {
      name: initialData?.name ?? "",
      max_user: initialData?.max_user.toString() ?? "",
      allow_generate:
        typeof initialData?.allow_generate === "boolean"
          ? initialData.allow_generate
          : true,
      metadata: initialData?.metadata
        ? initialData.metadata
        : ([] as Array<MetadataFormObject>),
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
                label="Nama Profil"
                placeholder="Masukkan nama profil..."
              />
            )}
          </form.AppField>

          <form.AppField name="max_user">
            {(field) => (
              <field.TextField
                label="Maksimal User"
                type="number"
                placeholder="Masukkan jumlah maksimal user di profil ini..."
              />
            )}
          </form.AppField>

          <form.AppField name="allow_generate">
            {(field) => (
              <field.BooleanCheckboxField label="Izinkan Generate Akun" />
            )}
          </form.AppField>

          <form.AppField name="metadata" mode="array">
            {(field) => (
              <div className="flex flex-col gap-4 border-t border-border pt-4">
                <span className="text-xs font-semibold text-muted-foreground">
                  Metadata
                </span>
                {field.state.value.map((__, i) => (
                  <MetadataFieldGroup
                    key={`metadata-${i}`}
                    form={form}
                    fields={{
                      key: `metadata[${i}].key`,
                      value: `metadata[${i}].value`,
                    }}
                    label={`Metadata ${i + 1}`}
                    onDelete={() => {
                      field.removeValue(i);
                    }}
                    className="border border-border p-4 rounded-lg bg-card/25"
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    field.pushValue({
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

          <form.SubscribeButton
            isPending={isPending}
            label={submitButtonText}
          />
        </div>
      </form>
    </form.AppForm>
  );
}
