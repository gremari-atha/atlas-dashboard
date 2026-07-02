import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutGrid, Plus, TableProperties, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { AccountStatus } from "@/components/account-status";
import { NoData } from "@/components/custom/no-data";
import { Pagination } from "@/components/custom/pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

export const Route = createFileRoute("/_dashboard/account/")({
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
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const { data: accounts, isLoading: isFetchAccountLoading } = useQuery({
    queryKey: ["account", searchParam],
    queryFn: ({ signal }) =>
      getAllAccount({ limit: 12, ...searchParam, signal }),
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
            <Link to="/account/create">
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

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto self-start md:self-center shrink-0">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className="size-9 cursor-pointer"
            title="Grid View"
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("table")}
            className="size-9 cursor-pointer"
            title="Table View"
          >
            <TableProperties className="size-4" />
          </Button>
        </div>
        <div className="w-full md:flex-1">
          <PagesAccountIndexSearch
            defaultSort={sort}
            onSortChanges={handleSortChange}
            onSearchChanges={handleSearchChange}
          />
        </div>
      </div>

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
      ) : accounts?.items?.length ? (
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

          {viewMode === "grid" ? (
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
          ) : (
            <div className="rounded-xl border border-border/40 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">
                        Akun (Email)
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">
                        Password
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">
                        Produk & Varian
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">
                        Subscription Expiry
                      </TableHead>
                      <TableHead className="text-right text-xs font-semibold uppercase tracking-wider">
                        Aksi
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accounts.items.map((account) => (
                      <TableRow
                        key={`account-row-${account.id}`}
                        className="hover:bg-muted/10 transition-colors"
                      >
                        <TableCell className="font-semibold text-xs text-foreground py-3">
                          {account.email.email}
                        </TableCell>
                        <TableCell className="font-mono text-xs py-3">
                          {account.account_password}
                        </TableCell>
                        <TableCell className="text-xs py-3">
                          {account.product_variant ? (
                            <div className="flex flex-col">
                              <span className="font-semibold">
                                {account.product_variant.product?.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground font-normal">
                                {account.product_variant.name}
                              </span>
                            </div>
                          ) : (
                            <span className="italic text-muted-foreground">
                              — No Product —
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-3">
                          <AccountStatus account={account} />
                        </TableCell>
                        <TableCell className="text-xs font-semibold py-3">
                          {new Date(
                            account.subscription_expiry,
                          ).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="text-right py-3">
                          <div className="flex gap-1.5 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-[10px] cursor-pointer"
                              onClick={() => {
                                setSelectedAccountId(account.id);
                                setDialogProfileDetailOpen(true);
                              }}
                            >
                              Profile
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-[10px] cursor-pointer"
                              onClick={() => {
                                setSelectedAccountId(account.id);
                                setDialogCommandOpen(true);
                              }}
                            >
                              Command
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-[10px] cursor-pointer"
                              onClick={() => {
                                setSelectedAccountId(account.id);
                                setDialogFreezeOpen(true);
                              }}
                            >
                              Freeze
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-[10px] cursor-pointer"
                              onClick={() => {
                                setSelectedAccountId(account.id);
                                setDialogAccountEditOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

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
