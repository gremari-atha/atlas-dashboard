import { useMemo } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatRupiah } from "@/lib/currency";
import type { RevenueStatistic } from "@/services/statistic.service";

function RevenueChart({ data }: { data: RevenueStatistic }) {
  const maxTransactionVal = useMemo(() => {
    if (!data?.daily?.length) return 10;
    return Math.max(
      ...data.daily.map((d: any) => Number(d.transaction_count || 0)),
    );
  }, [data]);

  const yAxisMax =
    maxTransactionVal > 0 ? Math.round(maxTransactionVal * 1.5) : 10;

  return (
    <ChartContainer
      config={{
        net_income: {
          label: "Penghasilan Bersih",
          color: "hsl(var(--chart-1))",
        },
        expense: {
          label: "Pengeluaran",
          color: "hsl(var(--chart-2))",
        },
        transaction_count: {
          label: "Transaksi",
          color: "hsl(var(--chart-3))",
        },
      }}
      className="aspect-auto h-[350px] w-full"
    >
      <ComposedChart accessibilityLayer data={data.daily}>
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          className="stroke-muted/40"
        />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          className="text-xs"
        />
        <YAxis
          yAxisId="axis_revenue"
          orientation="left"
          tickLine={false}
          axisLine={false}
          className="text-xs"
        />
        <YAxis
          yAxisId="axis_trx"
          orientation="right"
          domain={[0, yAxisMax]}
          tickLine={false}
          axisLine={false}
          className="text-xs"
        />

        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value, _name, item) => {
                if (item.dataKey === "net_income") {
                  return formatRupiah(Number(value));
                }
                if (item.dataKey === "expense") {
                  return formatRupiah(Number(value));
                }
                if (item.dataKey === "transaction_count") {
                  return `${value} transaksi`;
                }
                return value;
              }}
            />
          }
        />
        <Bar
          dataKey="net_income"
          yAxisId="axis_revenue"
          fill="var(--color-net_income)"
          radius={[4, 4, 0, 0]}
          barSize={20}
        />
        <Bar
          dataKey="expense"
          yAxisId="axis_revenue"
          fill="var(--color-expense)"
          radius={[4, 4, 0, 0]}
          barSize={20}
        />

        <Line
          type="monotone"
          dataKey="transaction_count"
          yAxisId="axis_trx"
          stroke="var(--color-transaction_count)"
          strokeWidth={2}
          dot={{ r: 4, fill: "var(--background)" }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ChartContainer>
  );
}

export default RevenueChart;
export { RevenueChart };
