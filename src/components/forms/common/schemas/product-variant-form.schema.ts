import { z } from "zod";
import { TimeUnitEnum } from "./time-unit.schema";

export const ProductVariantFormSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  base_price: z.string().min(1, "Harga dasar wajib diisi"),
  duration: z.string().min(1, "Durasi wajib diisi"),
  duration_unit: TimeUnitEnum,
  interval: z.string().min(1, "Interval wajib diisi"),
  interval_unit: TimeUnitEnum,
  cooldown: z.string().min(1, "Cooldown wajib diisi"),
  cooldown_unit: TimeUnitEnum,
  copy_template: z.string(),
});
