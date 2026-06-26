import type { AllStatistic } from "@/services/statistic.service";

export function PlatformList({ data }: { data: AllStatistic["platform"] }) {
  return (
    <div className="flex flex-col gap-4 py-2">
      {data.length === 0 ? (
        <div className="text-center text-xs text-muted-foreground p-4">
          Belum ada data
        </div>
      ) : (
        data.map((item) => (
          <div
            key={item.platform}
            className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-foreground/80">
                {item.platform}
              </span>
            </div>
            <div className="font-medium text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-md">
              {item.transaction_count} transaksi
            </div>
          </div>
        ))
      )}
    </div>
  );
}
