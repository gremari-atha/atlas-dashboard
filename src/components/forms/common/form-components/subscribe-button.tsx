import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormContext } from "@/hooks/form.hook";

export function SubscribeButton({
  isPending,
  label,
}: {
  isPending?: boolean;
  label?: string;
}) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => (
        <Button
          type="submit"
          className="w-full cursor-pointer h-9 text-xs"
          disabled={!canSubmit || isPending}
        >
          {(isSubmitting || isPending) && (
            <span>
              <LoaderCircle className="animate-spin size-4 mr-2" />
            </span>
          )}
          {label ?? "Submit"}
        </Button>
      )}
    </form.Subscribe>
  );
}
