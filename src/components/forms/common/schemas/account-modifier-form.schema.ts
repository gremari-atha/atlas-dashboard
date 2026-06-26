import { z } from "zod";
import { MetadataFormSchema } from "./metadata-form.schema";

export const AccountModifierFormSchema = z.object({
  modifier_id: z.string().min(1, "Modifier ID wajib diisi"),
  metadata: z.array(MetadataFormSchema).optional(),
});
