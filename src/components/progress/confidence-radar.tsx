"use client";

import { useTranslations } from "next-intl";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import type { ConfidenceComparison } from "@/core/domain";

interface ConfidenceRadarProps {
  comparisons: ConfidenceComparison[];
}

const EARLIEST_COLOR = "#d0761f";
const LATEST_COLOR = "#7b83f2";

export function ConfidenceRadar({ comparisons }: ConfidenceRadarProps) {
  const t = useTranslations("progress");
  const tCommon = useTranslations("common");

  const data = comparisons.map((comparison) => ({
    topic: tCommon(`topics.${comparison.topic}`),
    earliest: comparison.earliest,
    latest: comparison.latest,
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="var(--color-line-strong)" />
          <PolarAngleAxis
            dataKey="topic"
            tick={{ fill: "var(--color-ink-muted)", fontSize: 11 }}
          />
          <PolarRadiusAxis
            domain={[0, 5]}
            tickCount={6}
            tick={false}
            axisLine={false}
          />
          <Radar
            name={t("earliest")}
            dataKey="earliest"
            stroke={EARLIEST_COLOR}
            strokeWidth={2}
            fill={EARLIEST_COLOR}
            fillOpacity={0.12}
            dot={{ r: 2.5, fill: EARLIEST_COLOR, strokeWidth: 0 }}
          />
          <Radar
            name={t("latest")}
            dataKey="latest"
            stroke={LATEST_COLOR}
            strokeWidth={2}
            fill={LATEST_COLOR}
            fillOpacity={0.22}
            dot={{ r: 2.5, fill: LATEST_COLOR, strokeWidth: 0 }}
          />
          <Legend
            wrapperStyle={{
              fontSize: 12,
              color: "var(--color-ink-secondary)",
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
