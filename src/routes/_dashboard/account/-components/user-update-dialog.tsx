import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AccountUserUpdateForm } from "@/components/forms/account-user-update-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  AccountProfileUser,
  UpdateAccountUserPayload,
} from "@/services/account.service";
import { updateAccountUser } from "@/services/account.service";

export function PagesAccountIndexDialogUserUpdate({
  open,
  selectedAccountUser,
  onOpenChange,
  onProfileStateChange,
}: {
  open?: boolean;
  selectedAccountUser?: AccountProfileUser;
  onOpenChange: (value: boolean) => void;
  onProfileStateChange?: (value: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const accountUserUpdateMutation = useMutation({
    mutationFn: (payload: UpdateAccountUserPayload) => {
      if (!selectedAccountUser?.id) throw new Error("No user selected");
      return updateAccountUser(selectedAccountUser.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      toast.success("User Akun berhasil diedit.");
      if (onProfileStateChange) {
        onProfileStateChange(false);
      }
    },
    onError: (error) => {
      toast.error(`Gagal update user akun: ${error.message}`);
    },
    onSettled: () => {
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:min-w-4xl">
        <DialogHeader>
          <DialogTitle>Ubah User Akun</DialogTitle>
        </DialogHeader>
        {selectedAccountUser ? (
          <AccountUserUpdateForm
            initialData={selectedAccountUser}
            isPending={accountUserUpdateMutation.isPending}
            onSubmit={(value) => {
              accountUserUpdateMutation.mutate(value);
            }}
          />
        ) : (
          <div className="flex items-center justify-center">
            <p>Tidak ada user terseleksi</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
