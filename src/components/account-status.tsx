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
    if (account.status === "disable") {
      return [
        {
          badgeClass:
            "bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/25",
          text: "Disable",
        },
      ];
    }
    if (account.freeze_until && new Date(account.freeze_until) > new Date()) {
      return [
        {
          badgeClass:
            "bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/25",
          text: "Freeze",
        },
      ];
    }
    if (account.status === "ready" || account.status === "enabled") {
      return [
        {
          badgeClass:
            "bg-neutral-500/10 text-neutral-500 dark:text-neutral-400 border-neutral-500/25",
          text: "Kosong",
        },
      ];
    }
    if (account.status === "active") {
      return [
        {
          badgeClass:
            "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/25",
          text: "Tersedia",
        },
      ];
    }
    if (account.status === "full_manual") {
      return [
        {
          badgeClass:
            "bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/25",
          text: "Penuh",
        },
        {
          badgeClass:
            "bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/25",
          text: "Manual",
        },
      ];
    }
    if (account.status === "full") {
      return [
        {
          badgeClass:
            "bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/25",
          text: "Penuh",
        },
      ];
    }
    return [
      {
        badgeClass: "bg-neutral-700/10 text-neutral-400 border-neutral-700/25",
        text: "???",
      },
    ];
  }, [account]);

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {status.map((item, idx) => (
        <span
          key={idx}
          className={cn(
            "flex w-fit items-center justify-center text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full border whitespace-nowrap",
            item.badgeClass,
          )}
        >
          {item.text}
        </span>
      ))}
    </div>
  );
}
