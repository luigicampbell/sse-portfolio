import type {
  ChartData,
  ChartOptions,
} from "chart.js";

import {
  Radar,
} from "react-chartjs-2";

import type {
  Skill,
} from "@domain/mod.ts";

import "./register.ts";

import {
  summarizeSkillCategories,
} from "./skill-data.ts";

import {
  useChartTheme,
} from "./use-chart-theme.ts";

interface SkillsRadarProps {
  skills: Skill[];
}

export function SkillsRadar({
  skills,
}: SkillsRadarProps) {
  const theme =
    useChartTheme();

  const categories =
    summarizeSkillCategories(
      skills,
    );

  const data:
    ChartData<"radar"> = {
      labels:
        categories.map(
          (category) =>
            category.label,
        ),

      datasets: [
        {
          label:
            "Relative breadth",

          data:
            categories.map(
              (category) =>
                category.breadth,
            ),

          borderColor:
            theme.primary,

          backgroundColor:
            theme.primaryFill,

          pointBackgroundColor:
            theme.primary,

          pointBorderColor:
            theme.surface,

          pointHoverRadius:
            6,

          borderWidth:
            2,

          fill:
            true,
        },
      ],
    };

  const options:
    ChartOptions<"radar"> = {
      responsive:
        true,

      maintainAspectRatio:
        false,

      animation: {
        duration:
          500,
      },

      scales: {
        r: {
          beginAtZero:
            true,

          min:
            0,

          max:
            100,

          ticks: {
            display:
              false,

            stepSize:
              20,
          },

          grid: {
            color:
              theme.grid,
          },

          angleLines: {
            color:
              theme.grid,
          },

          pointLabels: {
            color:
              theme.text,

            font: {
              size:
                12,

              weight:
                600,
            },
          },
        },
      },

      plugins: {
        legend: {
          display:
            false,
        },

        tooltip: {
          callbacks: {
            label(
              context,
            ) {
              return `${context.dataset.label}: ${context.parsed.r}/100`;
            },
          },
        },
      },
    };

  return (
    <div className="chart-panel">
      <div className="chart-heading">
        <p className="eyebrow">
          Breadth
        </p>

        <h3>
          Technical profile
        </h3>

        <p>
          Relative breadth across the
          skill categories represented
          in this portfolio.
        </p>
      </div>

      <div className="chart-container chart-container-radar">
        <Radar
          data={data}
          options={options}
        />
      </div>
    </div>
  );
}