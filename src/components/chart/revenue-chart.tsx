import { useMemo } from "react";
import {
  Area,
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
          color: "var(--primary)",
        },
        expense: {
          label: "Pengeluaran",
          color: "var(--destructive)",
        },
        transaction_count: {
          label: "Transaksi",
          color: "oklch(0.62 0.16 250)",
        },
      }}
      className="aspect-auto h-[350px] w-full"
    >
      <ComposedChart accessibilityLayer data={data.daily}>
        <defs>
          <linearGradient id="colorNetIncome" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-net_income)"
              stopOpacity={0.35}
            />
            <stop
              offset="95%"
              stopColor="var(--color-net_income)"
              stopOpacity={0.02}
            />
          </linearGradient>
          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-expense)"
              stopOpacity={0.25}
            />
            <stop
              offset="95%"
              stopColor="var(--color-expense)"
              stopOpacity={0.01}
            />
          </linearGradient>
        </defs>
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
        <Area
          type="monotone"
          dataKey="net_income"
          yAxisId="axis_revenue"
          stroke="var(--color-net_income)"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorNetIncome)"
        />
        <Area
          type="monotone"
          dataKey="expense"
          yAxisId="axis_revenue"
          stroke="var(--color-expense)"
          strokeWidth={1.5}
          fillOpacity={1}
          fill="url(#colorExpense)"
        />

        <Line
          type="monotone"
          dataKey="transaction_count"
          yAxisId="axis_trx"
          stroke="var(--color-transaction_count)"
          strokeWidth={3}
          dot={{
            r: 4,
            fill: "var(--background)",
            stroke: "var(--color-transaction_count)",
            strokeWidth: 2,
          }}
          activeDot={{ r: 6, fill: "var(--color-transaction_count)" }}
        />
      </ComposedChart>
    </ChartContainer>
  );
}

export default RevenueChart;
export { RevenueChart };
