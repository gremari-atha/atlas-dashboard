import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { PeakHourChart } from "@/components/chart/peak-hour-chart";
import { PlatformList } from "@/components/chart/platform-list";
import { ProductSales } from "@/components/chart/product-sales";
import { RevenueChart } from "@/components/chart/revenue-chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatRupiah } from "@/lib/currency";
import { formatDateIdStandard } from "@/lib/time-converter";
import { getAllStatistic } from "@/services/statistic.service";

export const Route = createFileRoute("/_dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [range, setRange] = useState<"week" | "month" | "3months" | "1year">(
    "month",
  );

  const { data: allStatistic, isLoading: isFetchStatisticLoading } = useQuery({
    queryKey: ["allStatistic", range],
    queryFn: ({ signal }) => getAllStatistic({ range }, signal),
  });

  const getRangeLabel = (rangeStr: string) => {
    switch (rangeStr) {
      case "week":
        return "Minggu Ini";
      case "3months":
        return "3 Bulan Terakhir";
      case "1year":
        return "1 Tahun Terakhir";
      default:
        return "Bulan Ini";
    }
  };

  return (
    <div className="relative flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Decorative Brand Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center relative z-10">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Overview
          </h1>
          <p className="text-xs text-muted-foreground">
            Analisis data keuangan dan transaksi Anda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            Periode:
          </span>
          <Select value={range} onValueChange={(val) => setRange(val as any)}>
            <SelectTrigger className="w-37.5 h-8 text-xs font-medium">
              <SelectValue placeholder="Pilih Periode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week" className="text-xs">
                Minggu Ini
              </SelectItem>
              <SelectItem value="month" className="text-xs">
                Bulan Ini
              </SelectItem>
              <SelectItem value="3months" className="text-xs">
                3 Bulan
              </SelectItem>
              <SelectItem value="1year" className="text-xs">
                1 Tahun
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isFetchStatisticLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-87.5 md:col-span-2 rounded-lg" />
          <Skeleton className="h-87.5 rounded-lg" />
        </div>
      ) : (
        <div className="flex flex-col gap-6 relative z-10">
          {allStatistic?.revenue && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card Penghasilan Hari Ini */}
              <Card className="shadow-sm border border-emerald-500/20 dark:border-emerald-500/10 bg-gradient-to-br from-card/85 to-card/45 backdrop-blur-md hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Penghasilan Hari Ini
                  </CardTitle>
                  <CardDescription className="text-[10px]">
                    Hari Ini (Waktu Jakarta)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <span className="text-2xl font-bold tracking-tight text-emerald-500">
                        {formatRupiah(allStatistic.today.net_income)}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        Total {allStatistic.today.transaction_count} transaksi
                      </span>
                    </div>
                    <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500 shadow-inner">
                      <TrendingUp className="size-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card Penghasilan Bersih */}
              <Card className="shadow-sm border border-primary/20 dark:border-primary/10 bg-gradient-to-br from-card/85 to-card/45 backdrop-blur-md hover:shadow-[0_0_20px_rgba(2,207,233,0.1)] transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Penghasilan Bersih ({getRangeLabel(range)})
                  </CardTitle>
                  <CardDescription className="text-[10px]">
                    Update:{" "}
                    {formatDateIdStandard(
                      allStatistic.revenue.period.updated_at,
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <span className="text-2xl font-bold tracking-tight text-primary">
                        {formatRupiah(allStatistic.revenue.period.net_income)}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        Total {allStatistic.revenue.period.transaction_count}{" "}
                        transaksi
                      </span>
                    </div>
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary shadow-inner">
                      <TrendingUp className="size-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card Total Pengeluaran */}
              <Card className="shadow-sm border border-destructive/20 dark:border-destructive/10 bg-gradient-to-br from-card/85 to-card/45 backdrop-blur-md hover:shadow-[0_0_20px_rgba(239,68,68,0.08)] transition-all duration-300">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Total Pengeluaran ({getRangeLabel(range)})
                  </CardTitle>
                  <CardDescription className="text-[10px]">
                    Update:{" "}
                    {formatDateIdStandard(
                      allStatistic.revenue.period.updated_at,
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <span className="text-2xl font-bold tracking-tight text-destructive">
                        {formatRupiah(allStatistic.revenue.period.expense)}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        Biaya operasional & global
                      </span>
                    </div>
                    <div className="p-2.5 bg-destructive/10 rounded-xl text-destructive shadow-inner">
                      <TrendingDown className="size-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card Grafik Keuangan */}
              <Card className="md:col-span-2 lg:col-span-3 shadow-md border border-border/40 bg-card/65 backdrop-blur-md">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold">
                    Grafik Keuangan ({getRangeLabel(range)})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={allStatistic.revenue} />
                </CardContent>
              </Card>

              {/* Peak Hour */}
              <Card className="lg:col-span-1 shadow-sm border-border/40">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold">
                    Jam Sibuk (Peak Hour)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PeakHourChart data={allStatistic.peakHour} />
                </CardContent>
              </Card>

              {/* Platform */}
              <Card className="lg:col-span-1 shadow-sm border-border/40">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold">
                    Transaksi per Platform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PlatformList data={allStatistic.platform} />
                </CardContent>
              </Card>

              {/* Terlaris */}
              <Card className="md:col-span-2 lg:col-span-1 shadow-sm border-border/40">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-semibold">
                    Produk Terlaris
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductSales data={allStatistic.product} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
