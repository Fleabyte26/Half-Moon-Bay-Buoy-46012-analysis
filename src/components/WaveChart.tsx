
"use client"

import { useMemo } from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { generateHistoricalData } from "@/lib/mock-data"
import { History } from "lucide-react"

const chartConfig = {
  avgWaveHeight: {
    label: "Mean Amplitude (m)",
    color: "hsl(var(--primary))",
  },
  maxWaveHeight: {
    label: "Peak Energy (m)",
    color: "hsl(var(--accent))",
  },
}

interface WaveChartProps {
  stationId?: string;
}

export function WaveChart({ stationId = 'default' }: WaveChartProps) {
  const data = useMemo(() => generateHistoricalData(stationId), [stationId])

  return (
    <Card className="bg-[#0d1117] border-white/5">
      <CardHeader className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-muted-foreground" /> Historical Context Baseline
            </CardTitle>
            <CardDescription className="text-[10px] mt-1 font-mono uppercase opacity-50">
              Station Analysis Epoch: 1984 - 2024
            </CardDescription>
          </div>
          <div className="text-[9px] font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded">
            N = 14,610 DAYS
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[200px] w-full">
          <ChartContainer config={chartConfig}>
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="year" 
                tickLine={false} 
                axisLine={false} 
                tick={{fontSize: 9, fill: 'rgba(255,255,255,0.3)'}}
                tickMargin={8} 
              />
              <YAxis 
                tickLine={false} 
                axisLine={false} 
                tick={{fontSize: 9, fill: 'rgba(255,255,255,0.3)'}}
                tickMargin={8}
                unit="m"
              />
              <ChartTooltip content={<ChartTooltipContent className="bg-[#0a0c10] border-white/10" />} />
              <Legend 
                verticalAlign="top" 
                align="right"
                height={20}
                iconType="circle"
                wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}
              />
              <Line
                type="monotone"
                dataKey="avgWaveHeight"
                stroke="var(--color-avgWaveHeight)"
                strokeWidth={1.5}
                dot={false}
                opacity={0.8}
              />
              <Line
                type="monotone"
                dataKey="maxWaveHeight"
                stroke="var(--color-maxWaveHeight)"
                strokeWidth={1.5}
                dot={false}
                opacity={0.8}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
