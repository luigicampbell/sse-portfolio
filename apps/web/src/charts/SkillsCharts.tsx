import type { Skill } from "@domain/mod.ts";

import { SkillsDoughnut } from "./SkillsDoughnut.tsx";
import { SkillsRadar } from "./SkillsRadar.tsx";
import "./SkillsCharts.css";

interface SkillsChartsProps {
  skills: Skill[];
}

export default function SkillsCharts({
  skills,
}: SkillsChartsProps) {
  return (
    <div className="charts-grid">
      <SkillsDoughnut skills={skills} />
      <SkillsRadar skills={skills} />
    </div>
  );
}
