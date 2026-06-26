import { z } from "zod";
import { useAppForm } from "@/hooks/form.hook";
import type { AccountProfileUser } from "@/services/account.service";

export const AccountUserUpdateFormSchema = z.object({
  name: z.string().min(1, "Nama user wajib diisi"),
  expired_at: z.date().optional(),
});

export type AccountUserUpdateFormSubmitData = z.infer<
  typeof AccountUserUpdateFormSchema
>;

export function AccountUserUpdateForm({
  onSubmit,
  isPending,
  initialData,
  submitButtonText,
}: {
  onSubmit: (values: AccountUserUpdateFormSubmitData) => void;
  isPending: boolean;
  initialData: AccountProfileUser;
  submitButtonText?: string;
}) {
  const form = useAppForm({
    validators: { onSubmit: AccountUserUpdateFormSchema },
    defaultValues: {
      name: initialData.name,
      expired_at: initialData.expired_at
        ? new Date(initialData.expired_at)
        : undefined,
    } as AccountUserUpdateFormSubmitData,
    onSubmit: ({ value }) => {
      onSubmit({ ...value });
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
                label="Nama User"
                placeholder="Masukkan nama user..."
              />
            )}
          </form.AppField>

          <form.AppField name="expired_at">
            {(field) => (
              <field.DatePickerField label="Pilih Tanggal Berakhir" />
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
