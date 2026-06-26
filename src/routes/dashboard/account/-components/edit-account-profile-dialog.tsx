import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AccountProfileForm } from "@/components/forms/account-profile.form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { convertMetadataObjectToString } from "@/lib/metadata-converter";
import type {
  AccountProfile,
  CreateAccountProfilePayload,
  UpdateAccountProfilePayload,
} from "@/services/account.service";
import {
  createNewAccountProfile,
  updateAccountProfile,
} from "@/services/account.service";

export function PagesAccountIndexDialogEditProfile({
  open,
  selectedAccountProfile,
  selectedAccountId,
  onOpenChange,
}: {
  open?: boolean;
  selectedAccountProfile?: AccountProfile;
  selectedAccountId?: string;
  onOpenChange: (value: boolean) => void;
}) {
  const queryClient = useQueryClient();

  const accountProfileCreateMutation = useMutation({
    mutationFn: (payload: CreateAccountProfilePayload) =>
      createNewAccountProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      toast.success("Profil Akun berhasil dibuat.");
    },
    onError: (error) => {
      toast.error(`Gagal membuat profil akun: ${error.message}`);
    },
    onSettled: () => {
      onOpenChange(false);
    },
  });

  const accountProfileEditMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAccountProfilePayload;
    }) => updateAccountProfile(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      toast.success("Profil Akun berhasil diperbarui.");
    },
    onError: (error) => {
      toast.error(`Gagal memperbarui profil akun: ${error.message}`);
    },
    onSettled: () => {
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:min-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {selectedAccountProfile ? "Ubah" : "Buat"} Profil Akun
          </DialogTitle>
        </DialogHeader>
        <AccountProfileForm
          initialData={selectedAccountProfile}
          isPending={
            accountProfileCreateMutation.isPending ||
            accountProfileEditMutation.isPending
          }
          onSubmit={(value) => {
            const payload = {
              ...value,
              max_user: value.max_user
                ? Number.parseInt(value.max_user, 10)
                : 0,
              metadata: convertMetadataObjectToString(value.metadata),
            };
            if (selectedAccountProfile) {
              accountProfileEditMutation.mutate({
                id: selectedAccountProfile.id,
                payload,
              });
            } else {
              accountProfileCreateMutation.mutate({
                ...payload,
                account_id: selectedAccountId,
              });
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
