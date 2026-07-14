import { z } from "zod";
import { useAppForm } from "@/hooks/form.hook";
import type { EmailSubject } from "@/services/email-subject.service";

export const EmailSubjectFormSchema = z.object({
  subject: z.string().min(1, "Subject wajib diisi"),
  extract_method: z.string().min(1, "Extract method wajib diisi"),
});

export type EmailSubjectFormSubmitData = z.infer<typeof EmailSubjectFormSchema>;

export function EmailSubjectForm({
  onSubmit,
  isPending,
  initialData,
  submitButtonText,
}: {
  onSubmit: (values: EmailSubjectFormSubmitData) => void;
  isPending: boolean;
  initialData?: EmailSubject;
  submitButtonText?: string;
}) {
  const form = useAppForm({
    validators: { onSubmit: EmailSubjectFormSchema },
    defaultValues: {
      subject: initialData?.subject ?? "",
      extract_method: initialData?.extract_method ?? "",
    },
    onSubmit: ({ value }) => {
      onSubmit(value);
    },
  });

  const extractMethodOptions = [
    { title: "OTP_EXTRACT", value: "OTP_EXTRACT" },
    { title: "NETFLIX_URL_EXTRACT", value: "NETFLIX_URL_EXTRACT" },
  ];

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
          <form.AppField name="subject">
            {(field) => (
              <field.TextField
                label="Subject"
                placeholder="Masukkan email subject..."
              />
            )}
          </form.AppField>

          <form.AppField name="extract_method">
            {(field) => (
              <field.SelecField
                label="Extract Method"
                placeholder="Pilih Extract Method"
                selectItems={extractMethodOptions}
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
