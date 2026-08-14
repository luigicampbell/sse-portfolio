import type { Skill, SkillCategory } from "@domain/mod.ts";

import "./Skills.css";

const SKILL_CATEGORY_ORDER: readonly SkillCategory[] = [
  "languages",
  "frontend",
  "backend",
  "data",
  "cloud",
  "salesforce",
  "leadership",
  "dev-ops"
];

interface SkillsProps {
  skills: Skill[];
}

export default function Skills({
  skills,
}: SkillsProps) {
  const groupedSkills = groupSkillsByCategory(skills);

  return (
    <section id="skills" className="skills">
      <div className="skills__heading">
        <p className="skills__eyebrow">
          Capabilities
        </p>

        <h2 className="skills__title">
          Strengths
        </h2>

        <p className="skills__description">
          Technologies, disciplines, and responsibilities I use to design,
          build, and deliver maintainable software.
        </p>
      </div>

      {groupedSkills.size > 0
        ? (
          <div className="skills__groups">
            {SKILL_CATEGORY_ORDER.map((category) => {
              const categorySkills = groupedSkills.get(category);

              if (!categorySkills?.length) {
                return null;
              }

              const categoryLabel = formatSkillCategory(category);
              const headingId = `skills-${category}`;

              return (
                <div
                  className="skill-group"
                  key={category}
                  aria-labelledby={headingId}
                >
                  <h3
                    id={headingId}
                    className="skill-group__title"
                  >
                    {categoryLabel}
                  </h3>

                  <ul
                    className="skill-group__chips"
                    aria-label={`${categoryLabel} skills`}
                  >
                    {categorySkills.map((skill) => (
                      <li
                        key={skill.id}
                        className={`skill-chip skill-chip--${category}`}
                      >
                        {skill.label}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )
        : (
          <p className="skills__empty">
            No skills are available.
          </p>
        )}
    </section>
  );
}

function groupSkillsByCategory(
  skills: Skill[],
): Map<SkillCategory, Skill[]> {
  const grouped = new Map<SkillCategory, Skill[]>();

  for (const skill of skills) {
    const categorySkills = grouped.get(skill.category);

    if (categorySkills) {
      categorySkills.push(skill);
      continue;
    }

    grouped.set(skill.category, [skill]);
  }

  return grouped;
}

function formatSkillCategory(
  category: SkillCategory,
): string {
  switch (category) {
    case "languages":
      return "Languages";

    case "frontend":
      return "Frontend";

    case "backend":
      return "Backend";

    case "data":
      return "Data";

case "cloud":
  return "Cloud";

case "dev-ops":
  return "DevOps";

    case "salesforce":
      return "Salesforce";

    case "leadership":
      return "Leadership";
    default:
      return category;
  }
}
