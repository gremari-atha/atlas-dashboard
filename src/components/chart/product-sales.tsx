import type { AllStatistic } from "@/services/statistic.service";

export function ProductSales({ data }: { data: AllStatistic["product"] }) {
  const topProducts = data.slice(0, 3);

  return (
    <div className="flex flex-col gap-4 py-2">
      {topProducts.length === 0 ? (
        <div className="text-center text-xs text-muted-foreground p-4">
          Belum ada data
        </div>
      ) : (
        topProducts.map((item, index) => (
          <div
            key={item.product_variant_id}
            className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs">
                {index + 1}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-xs text-foreground truncate">
                  {item.product_variant?.product?.name || "Varian Tanpa Nama"}
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  {item.product_variant?.name || "No Variant Name"}
                </span>
              </div>
            </div>
            <div className="font-semibold text-xs text-foreground bg-primary/5 border border-primary/10 px-3 py-1 rounded-full whitespace-nowrap">
              {item.items_sold} terjual
            </div>
          </div>
        ))
      )}
    </div>
  );
}
