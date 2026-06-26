import { z } from "zod";

export const MetadataFormSchema = z.object({
  key: z.string().min(1, "Key wajib diisi"),
  value: z.string().min(1, "Value wajib diisi"),
});

export type MetadataFormObject = z.infer<typeof MetadataFormSchema>;
