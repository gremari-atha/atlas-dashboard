import { useState } from "react";
import { ProductVariantSelect } from "@/components/custom/select/product-variant.select";
import { Label } from "@/components/ui/label";
import { useFieldContext } from "@/hooks/form.hook";
import type { ProductVariant } from "@/services/product.service";
import { ErrorDisplay } from "../error-display";

export function ProductVariantSelectField({
  label,
  initialData,
  disabled,
}: {
  label: string;
  initialData?: ProductVariant;
  disabled?: boolean;
}) {
  const field = useFieldContext<string>();
  const [selected, setSelected] = useState<ProductVariant | undefined>(
    initialData,
  );
  const handleSelected = (productVariant?: ProductVariant) => {
    if (disabled) return;
    setSelected(productVariant);
    field.handleChange(productVariant?.id ?? "");
  };
  return (
    <div className="grid gap-2">
      <Label className="text-xs font-semibold">{label}</Label>
      <ProductVariantSelect
        selectedItem={selected}
        onSelect={handleSelected}
        disabled={disabled}
      />
      <ErrorDisplay errors={field.state.meta.errors} />
    </div>
  );
}
