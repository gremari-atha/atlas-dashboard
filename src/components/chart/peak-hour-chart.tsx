import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { AllStatistic } from "@/services/statistic.service";

export function PeakHourChart({ data }: { data: AllStatistic["peakHour"] }) {
  const yAxisMax = useMemo(() => {
    if (!data || data.length === 0) return 10;
    const maxVal = Math.max(
      ...data.map((d) => Number(d.transaction_count || 0)),
    );
    return maxVal > 0 ? Math.round(maxVal * 1.2) : 10;
  }, [data]);

  return (
    <ChartContainer
      config={{
        transaction_count: {
          label: "Transaksi",
          color: "var(--primary)",
        },
      }}
      className="aspect-auto h-[250px] w-full"
    >
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          className="stroke-muted/40"
        />
        <XAxis
          dataKey="hour"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => `${value}:00`}
          className="text-xs"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          domain={[0, yAxisMax]}
          className="text-xs"
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent labelFormatter={(label) => `${label}:00`} />
          }
        />
        <Bar
          dataKey="transaction_count"
          fill="var(--color-transaction_count)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
