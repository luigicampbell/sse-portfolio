import type { ChartData, ChartOptions } from "chart.js";
import { Doughnut } from "react-chartjs-2";

import type { Skill } from "@domain/mod.ts";

import "./register.ts";
import { summarizeSkillCategories } from "./skill-data.ts";
import { useChartTheme } from "./use-chart-theme.ts";

interface SkillsDoughnutProps {
  skills: Skill[];
}

export function SkillsDoughnut({
  skills,
}: SkillsDoughnutProps) {
  const theme = useChartTheme();
  const categories = summarizeSkillCategories(skills);

  const data: ChartData<"doughnut"> = {
    labels: categories.map((category) => category.label),
    datasets: [
      {
        label: "Category strength",
        data: categories.map((category) => category.average),
        backgroundColor: categories.map(
          (_, index) =>
            theme.categoryColors[index % theme.categoryColors.length],
        ),
        borderColor: theme.surface,
        borderWidth: 4,
        hoverOffset: 6,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    animation: {
      duration: 500,
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: theme.text,
          padding: 18,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        callbacks: {
          label(context) {
            const value = context.parsed;

            return `${context.label}: ${value}/100`;
          },
        },
      },
    },
  };

  return (
    <div className="chart-panel">
      <div className="chart-heading">
        <p className="eyebrow">Distribution</p>
        <h3>Capability areas</h3>
        <p>
          Average strength grouped by engineering discipline.
        </p>
      </div>

      <div className="chart-container chart-container-doughnut">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}
