import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Account } from "@/services/account.service";

export function AccountStatus({
  account,
  className,
}: {
  account: Account;
  className?: string;
}) {
  const status = useMemo(() => {
    if (account.freeze_until) {
      return {
        badgeClass:
          "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/25",
        text: "Freeze",
      };
    }
    if (account.status === "disable") {
      return {
        badgeClass:
          "bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/25",
        text: "Disable",
      };
    }
    if (account.status === "ready" || account.status === "enabled") {
      return {
        badgeClass:
          "bg-neutral-500/10 text-neutral-500 dark:text-neutral-400 border-neutral-500/25",
        text: "Kosong",
      };
    }
    if (account.status === "active") {
      const { maxUser, userCount } = account.profile
        ? account.profile.reduce(
            (acc, profile) => {
              acc.maxUser += profile.max_user;
              acc.userCount += profile.user?.length || 0;
              return acc;
            },
            { maxUser: 0, userCount: 0 },
          )
        : {
            maxUser: account.max_user || 0,
            userCount: account.user_count || 0,
          };

      if (userCount >= maxUser) {
        return {
          badgeClass:
            "bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/25",
          text: "Penuh",
        };
      }
      return {
        badgeClass:
          "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/25",
        text: "Tersedia",
      };
    }
    return {
      badgeClass: "bg-neutral-700/10 text-neutral-400 border-neutral-700/25",
      text: "???",
    };
  }, [account]);

  return (
    <span
      className={cn(
        "flex w-fit items-center justify-center text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border whitespace-nowrap",
        status.badgeClass,
        className,
      )}
    >
      {status.text}
    </span>
  );
}
