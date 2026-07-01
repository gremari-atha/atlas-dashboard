import { useMemo } from "react";
import type { AllStatistic } from "@/services/statistic.service";

export function ProductSales({ data }: { data: AllStatistic["product"] }) {
  const topProducts = useMemo(() => data.slice(0, 5), [data]);

  const maxSold = useMemo(() => {
    if (topProducts.length === 0) return 1;
    return Math.max(...topProducts.map((p) => p.items_sold), 1);
  }, [topProducts]);

  return (
    <div className="flex flex-col gap-5 py-2">
      {topProducts.length === 0 ? (
        <div className="text-center text-xs text-muted-foreground p-4">
          Belum ada data
        </div>
      ) : (
        topProducts.map((item, index) => (
          <div
            key={item.product_variant_id}
            className="flex items-center gap-4"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs shadow-inner">
              {index + 1}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex justify-between items-center text-xs font-semibold text-foreground gap-2">
                <span className="truncate">
                  {item.product_variant?.product?.name || "Varian Tanpa Nama"}
                </span>
                <span className="text-muted-foreground font-mono text-[10px] whitespace-nowrap">
                  {item.items_sold} terjual
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground truncate">
                {item.product_variant?.name || "No Variant Name"}
              </span>
              <div className="w-full bg-muted/40 h-1.5 rounded-full overflow-hidden mt-1.5 border border-border/10">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${(item.items_sold / maxSold) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
