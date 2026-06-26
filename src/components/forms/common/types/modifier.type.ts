import type { MetadataObject } from "@/lib/metadata-converter";

export interface ModifierObject {
  modifier_id: string;
  metadata: Array<MetadataObject>;
}
