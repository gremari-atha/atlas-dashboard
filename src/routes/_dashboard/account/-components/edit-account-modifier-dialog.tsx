import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AccountModifierEditForm } from "@/components/forms/account-modifier-edit.form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { convertMetadataObjectToString } from "@/lib/metadata-converter";
import type {
  Account,
  UpdateAccountModifierPayload,
} from "@/services/account.service";
import {
  getAccountById,
  updateAccountModifier,
} from "@/services/account.service";

export function PagesAccountIndexDialogEditModifier({
  open,
  selectedAccount,
  onOpenChange,
}: {
  open?: boolean;
  selectedAccount?: Account;
  onOpenChange: (value: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const { data: fullAccount, isLoading: isFetchingFullAccount } = useQuery({
    queryKey: ["account", selectedAccount?.id],
    queryFn: () => getAccountById(selectedAccount?.id ?? ""),
    enabled: !!open && !!selectedAccount && !selectedAccount.modifier,
  });

  const account = fullAccount || selectedAccount;

  const accountModifierEditMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAccountModifierPayload;
    }) => updateAccountModifier(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      toast.success("Modifier Akun berhasil diperbarui.");
    },
    onError: (error) => {
      toast.error(`Gagal memperbarui modifier akun: ${error.message}`);
    },
    onSettled: () => {
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:min-w-4xl">
        <DialogHeader>
          <DialogTitle>Ubah Modifier Akun</DialogTitle>
        </DialogHeader>
        {isFetchingFullAccount ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <AccountModifierEditForm
            initialData={account?.modifier}
            isPending={accountModifierEditMutation.isPending}
            onSubmit={(value) => {
              if (!account?.id) return;
              const payload = {
                modifier: value.modifier.map((mod) => ({
                  action: mod.action,
                  modifier_id: mod.modifier_id,
                  metadata: mod.metadata?.length
                    ? convertMetadataObjectToString(mod.metadata)
                    : undefined,
                })),
              };
              accountModifierEditMutation.mutate({ id: account.id, payload });
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
