import { z } from "zod";
import { MetadataFormSchema } from "./metadata-form.schema";

export const AccountProfileFormSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  max_user: z.string().min(1, "Maksimal user wajib diisi"),
  allow_generate: z.boolean(),
  metadata: z.array(MetadataFormSchema),
});
