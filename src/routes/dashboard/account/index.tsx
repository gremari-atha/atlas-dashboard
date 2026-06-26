import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { NoData } from "@/components/custom/no-data";
import { Pagination } from "@/components/custom/pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AccountFilter } from "@/services/account.service";
import {
  GetAccountsParamsSchema,
  getAllAccount,
} from "@/services/account.service";
import type { OrderByDirection } from "@/types/order-by.type";
import { AccountCard } from "./-components/account-card";
import { PagesAccountIndexCount } from "./-components/account-count";
import { AccountFilterTab } from "./-components/account-filter-tab";
import type { AccountSearchFilter } from "./-components/account-search";
import { PagesAccountIndexSearch } from "./-components/account-search";
import { PagesAccountIndexDialogCommand } from "./-components/command-dialog";
import { PagesAccountIndexDialogEdit } from "./-components/edit-account-dialog";
import { PagesAccountIndexDialogEditModifier } from "./-components/edit-account-modifier-dialog";
import { PagesAccountIndexDialogExpense } from "./-components/expense-dialog";
import { PagesAccountIndexDialogFreeze } from "./-components/freeze-account-dialog";
import { PagesAccountIndexDialogProfile } from "./-components/profile-dialog";
import { PagesAccountIndexDialogUserCreate } from "./-components/user-create-dialog";

export const Route = createFileRoute("/dashboard/account/")({
  component: RouteComponent,
  validateSearch: GetAccountsParamsSchema,
});

function RouteComponent() {
  const searchParam = Route.useSearch();
  const navigate = Route.useNavigate();

  const filter = useMemo<AccountFilter>(
    () => ({
      email_id: searchParam.email_id ?? "",
      product_variant_id: searchParam.product_variant_id ?? "",
      status: searchParam.status ?? "",
      email: searchParam.email ?? "",
      user: searchParam.user ?? "",
      billing: searchParam.billing ?? "",
      product_id: searchParam.product_id ?? "",
    }),
    [searchParam],
  );

  const sort = useMemo<string>(
    () =>
      searchParam.order_by && searchParam.order_direction
        ? `${searchParam.order_by}:${searchParam.order_direction}`
        : "default",
    [searchParam.order_by, searchParam.order_direction],
  );

  const [dialogCreateUserOpen, setDialogCreateUserOpen] =
    useState<boolean>(false);
  const [selectedAccountId, setSelectedAccountId] = useState<
    string | undefined
  >(undefined);
  const [dialogAccountEditOpen, setDialogAccountEditOpen] =
    useState<boolean>(false);
  const [dialogAccountModifierOpen, setDialogAccountModifierOpen] =
    useState<boolean>(false);
  const [dialogFreezeOpen, setDialogFreezeOpen] = useState<boolean>(false);
  const [dialogProfileDetailOpen, setDialogProfileDetailOpen] =
    useState<boolean>(false);
  const [dialogExpenseOpen, setDialogExpenseOpen] = useState<boolean>(false);
  const [dialogCommandOpen, setDialogCommandOpen] = useState<boolean>(false);

  const { data: accounts, isLoading: isFetchAccountLoading } = useQuery({
    queryKey: ["account", searchParam],
    queryFn: ({ signal }) => getAllAccount({ ...searchParam, signal }),
  });

  const selectedAccount = useMemo(() => {
    if (!selectedAccountId || !accounts?.items) return undefined;
    return accounts.items.find((acc) => acc.id === selectedAccountId);
  }, [accounts?.items, selectedAccountId]);

  const handleSearchChange = (searchFilter: AccountSearchFilter) => {
    const cleanFilter = Object.fromEntries(
      Object.entries(searchFilter).map(([key, value]) => [
        key,
        value === "" ? undefined : value,
      ]),
    );
    navigate({
      search: (prev) => ({ ...prev, ...cleanFilter, page: 1 }),
      replace: true,
    });
  };

  const handleFilterChange = (newFilter: AccountFilter) => {
    const cleanFilter = Object.fromEntries(
      Object.entries(newFilter).map(([key, value]) => [
        key,
        value === "" ? undefined : value,
      ]),
    );
    navigate({
      search: (prev) => ({ ...prev, ...cleanFilter, page: 1 }),
      replace: true,
    });
  };

  const handleSortChange = (value: string) => {
    const [orderBy, orderDirection] =
      value === "default" ? [undefined, undefined] : value.split(":");
    navigate({
      search: (prev) => ({
        ...prev,
        order_by: orderBy,
        order_direction: orderDirection as OrderByDirection | undefined,
        page: 1,
      }),
      replace: true,
    });
  };

  const handlePaginationChange = (page: number) => {
    navigate({
      search: (prev) => ({
        ...prev,
        page,
      }),
      replace: true,
    });
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Akun
          </h1>
          <p className="text-xs text-muted-foreground">
            Kelola akun berlangganan dan alokasikan profil pengguna.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDialogCreateUserOpen(true)}
            className="cursor-pointer flex-1 sm:flex-none h-9 text-xs"
          >
            <UserPlus className="size-4 mr-1.5" />
            Generate User
          </Button>
          <Button
            asChild
            size="sm"
            className="flex-1 sm:flex-none h-9 text-xs shadow-sm"
          >
            <Link to="/dashboard/account/create">
              <Plus className="size-4 mr-1.5" />
              Buat Akun
            </Link>
          </Button>
        </div>
      </div>

      <AccountFilterTab
        accountFilter={filter}
        onAccountFilterChange={handleFilterChange}
      />

      <PagesAccountIndexSearch
        defaultSort={sort}
        onSortChanges={handleSortChange}
        onSearchChanges={handleSearchChange}
      />

      <PagesAccountIndexCount
        accountCountFilter={{
          product_variant_id: searchParam.product_variant_id,
        }}
      />

      {isFetchAccountLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      ) : accounts?.items.length ? (
        <div className="space-y-6">
          {accounts.paginationData.totalPage > 1 && (
            <div className="flex items-center justify-center">
              <Pagination
                currentPage={accounts.paginationData.currentPage}
                totalPages={accounts.paginationData.totalPage}
                onPageChange={handlePaginationChange}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {accounts.items.map((account) => (
              <AccountCard
                key={`account-${account.id}`}
                account={account}
                onEditClick={() => {
                  setSelectedAccountId(account.id);
                  setDialogAccountEditOpen(true);
                }}
                onModifierClick={() => {
                  setSelectedAccountId(account.id);
                  setDialogAccountModifierOpen(true);
                }}
                onFreezeClick={() => {
                  setSelectedAccountId(account.id);
                  setDialogFreezeOpen(true);
                }}
                onProfileClick={() => {
                  setSelectedAccountId(account.id);
                  setDialogProfileDetailOpen(true);
                }}
                onExpenseClick={() => {
                  setSelectedAccountId(account.id);
                  setDialogExpenseOpen(true);
                }}
                onCommandClick={() => {
                  setSelectedAccountId(account.id);
                  setDialogCommandOpen(true);
                }}
              />
            ))}
          </div>

          {accounts.paginationData.totalPage > 1 && (
            <div className="flex items-center justify-center pt-2">
              <Pagination
                currentPage={accounts.paginationData.currentPage}
                totalPages={accounts.paginationData.totalPage}
                onPageChange={handlePaginationChange}
              />
            </div>
          )}
        </div>
      ) : (
        <NoData>Akun tidak ditemukan</NoData>
      )}

      {/* Create Account User Dialog */}
      <PagesAccountIndexDialogUserCreate
        open={dialogCreateUserOpen}
        onOpenChange={setDialogCreateUserOpen}
      />

      {/* Edit Account Dialog */}
      <PagesAccountIndexDialogEdit
        open={dialogAccountEditOpen}
        onOpenChange={(open) => {
          setDialogAccountEditOpen(open);
          if (!open) setSelectedAccountId(undefined);
        }}
        selectedAccount={selectedAccount}
      />

      {/* Edit Modifier Dialog */}
      <PagesAccountIndexDialogEditModifier
        open={dialogAccountModifierOpen}
        onOpenChange={(open) => {
          setDialogAccountModifierOpen(open);
          if (!open) setSelectedAccountId(undefined);
        }}
        selectedAccount={selectedAccount}
      />

      {/* Account Freeze Dialog */}
      <PagesAccountIndexDialogFreeze
        open={dialogFreezeOpen}
        onOpenChange={(open) => {
          setDialogFreezeOpen(open);
          if (!open) setSelectedAccountId(undefined);
        }}
        selectedAccount={selectedAccount}
      />

      {/* Profile Detail Dialog */}
      <PagesAccountIndexDialogProfile
        open={dialogProfileDetailOpen}
        onOpenChange={(open) => {
          setDialogProfileDetailOpen(open);
          if (!open) setSelectedAccountId(undefined);
        }}
        selectedAccount={selectedAccount}
      />

      {/* Expense Dialog */}
      <PagesAccountIndexDialogExpense
        open={dialogExpenseOpen}
        onOpenChange={(open) => {
          setDialogExpenseOpen(open);
          if (!open) setSelectedAccountId(undefined);
        }}
        selectedAccount={selectedAccount}
      />

      {/* Command Dialog */}
      <PagesAccountIndexDialogCommand
        open={dialogCommandOpen}
        onOpenChange={(open) => {
          setDialogCommandOpen(open);
          if (!open) setSelectedAccountId(undefined);
        }}
        selectedAccount={selectedAccount}
      />
    </div>
  );
}
