import { z } from "zod";
import { useAppForm } from "@/hooks/form.hook";
import type { Email } from "@/services/email.service";

export const EmailFormSchema = z.object({
  email: z.string().email("Email tidak valid").min(1, "Email wajib diisi"),
  password: z.string(),
});

export type EmailFormSubmitData = z.infer<typeof EmailFormSchema>;

export function EmailForm({
  onSubmit,
  isPending,
  initialData,
  submitButtonText,
}: {
  onSubmit: (values: EmailFormSubmitData) => void;
  isPending: boolean;
  initialData?: Email;
  submitButtonText?: string;
}) {
  const form = useAppForm({
    validators: { onSubmit: EmailFormSchema },
    defaultValues: {
      email: initialData?.email ?? "",
      password: initialData?.password ?? "",
    },
    onSubmit: ({ value }) => {
      onSubmit({
        email: value.email,
        password: value.password,
      });
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
          <form.AppField name="email">
            {(field) => (
              <field.TextField label="Email" placeholder="masukkan@email.com" />
            )}
          </form.AppField>
          <form.AppField name="password">
            {(field) => (
              <field.TextField
                label="Password (Opsional)"
                placeholder="••••••••"
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
