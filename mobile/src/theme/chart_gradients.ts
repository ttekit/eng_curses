import { colors } from "./colors";

export type ChartGradient = readonly [string, string];

export const chartGradients: readonly ChartGradient[] = [
  [`${colors.chart1}CC`, `${colors.chart1}4D`],
  [`${colors.chart2}CC`, `${colors.chart2}4D`],
  [`${colors.chart3}CC`, `${colors.chart3}4D`],
  [`${colors.chart4}CC`, `${colors.chart4}4D`],
  [`${colors.chart5}CC`, `${colors.chart5}4D`],
] as const;

export function pick_chart_gradient(seed: number): ChartGradient {
  const index = Math.abs(seed) % chartGradients.length;
  return chartGradients[index] ?? chartGradients[0];
}
