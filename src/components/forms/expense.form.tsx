import { z } from "zod";
import { useAppForm } from "@/hooks/form.hook";

export const ExpenseFormSchema = z.object({
  amount: z.string().min(1, "Jumlah pengeluaran wajib diisi"),
  note: z.string(),
});

export type ExpenseFormSubmitData = z.infer<typeof ExpenseFormSchema>;

export function ExpenseForm({
  onSubmit,
  isPending,
  submitButtonText,
}: {
  onSubmit: (values: ExpenseFormSubmitData) => void;
  isPending: boolean;
  submitButtonText?: string;
}) {
  const form = useAppForm({
    validators: { onSubmit: ExpenseFormSchema },
    defaultValues: {
      amount: "",
      note: "",
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
          <form.AppField name="amount">
            {(field) => (
              <field.TextField
                label="Jumlah Pengeluaran (Rp)"
                type="number"
                placeholder="masukkan nominal pengeluaran..."
              />
            )}
          </form.AppField>

          <form.AppField name="note">
            {(field) => (
              <field.TextareaField
                label="Catatan"
                placeholder="masukkan catatan/deskripsi pengeluaran..."
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
