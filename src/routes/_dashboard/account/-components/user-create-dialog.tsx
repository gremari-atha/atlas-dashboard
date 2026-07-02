import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AccountUserFormInitialData } from "@/components/forms/account-user.form";
import { AccountUserForm } from "@/components/forms/account-user.form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { handleCopyTemplate } from "@/lib/copy-template";
import type { CreateAccountUserPayload } from "@/services/account.service";
import { createNewAccountUser } from "@/services/account.service";

export function PagesAccountIndexDialogUserCreate({
  open,
  initialFormData,
  onOpenChange,
  onProfileStateChange,
}: {
  open?: boolean;
  initialFormData?: AccountUserFormInitialData;
  onOpenChange: (value: boolean) => void;
  onProfileStateChange?: (value: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const accountUserCreateMutation = useMutation({
    mutationFn: (payload: CreateAccountUserPayload) =>
      createNewAccountUser(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      toast.success("User Akun berhasil dibuat.");
      handleCopyTemplate(data.profile, data.account);
      if (onProfileStateChange) {
        onProfileStateChange(false);
      }
    },
    onError: (error) => {
      toast.error(`Gagal membuat user akun: ${error.message}`);
    },
    onSettled: () => {
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:min-w-4xl">
        <DialogHeader>
          <DialogTitle>Buat User Akun</DialogTitle>
        </DialogHeader>
        <AccountUserForm
          initialData={initialFormData}
          isPending={accountUserCreateMutation.isPending}
          onSubmit={(value) => {
            accountUserCreateMutation.mutate({
              ...value,
              product_variant_id: value.product_variant_id,
              account_profile_id: value.account_profile_id
                ? value.account_profile_id
                : undefined,
              price: value.price ? Number.parseInt(value.price, 10) : undefined,
              transaction: value.transaction
                ? {
                    platform: value.transaction.platform,
                  }
                : undefined,
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
