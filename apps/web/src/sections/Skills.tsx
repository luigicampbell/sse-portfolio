import {
  SKILL_CATEGORIES,
  SKILL_CATEGORY_LABELS,
  SKILL_SUBCATEGORY_LABELS,
} from "@domain/mod.ts";

import type { Skill, SkillCategory, SkillSubcategory } from "@domain/mod.ts";

import "./Skills.css";

interface SkillsProps {
  skills: Skill[];
}

export default function Skills({
  skills,
}: SkillsProps) {
  const groupedSkills = groupSkillsByCategory(
    skills,
  );

  return (
    <section
      id="skills"
      className="skills"
    >
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
            {SKILL_CATEGORIES.map(
              (category) => {
                const categorySkills = groupedSkills.get(
                  category,
                );

                if (
                  !categorySkills
                    ?.length
                ) {
                  return null;
                }

                return (
                  <SkillGroup
                    key={category}
                    category={category}
                    skills={categorySkills}
                  />
                );
              },
            )}
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

interface SkillGroupProps {
  category: SkillCategory;

  skills: Skill[];
}

function SkillGroup({
  category,
  skills,
}: SkillGroupProps) {
  const categoryLabel = SKILL_CATEGORY_LABELS[
    category
  ];

  const headingId = `skills-${category}`;

  const directSkills = skills.filter(
    (skill) =>
      skill.subcategory ===
        undefined,
  );

  const subgroups = groupSkillsBySubcategory(
    skills,
  );

  return (
    <div
      className="skill-group"
      aria-labelledby={headingId}
    >
      <h3
        id={headingId}
        className="skill-group__title"
      >
        {categoryLabel}
      </h3>

      {directSkills.length > 0 &&
        (
          <SkillChipList
            category={category}
            label={`${categoryLabel} skills`}
            skills={directSkills}
          />
        )}

      {subgroups.size > 0 &&
        (
          <div className="skill-group__subgroups">
            {[
              ...subgroups
                .entries(),
            ].map(
              ([
                subcategory,
                subgroupSkills,
              ]) => (
                <div
                  className="skill-subgroup"
                  key={subcategory}
                >
                  <h4 className="skill-subgroup__title">
                    {SKILL_SUBCATEGORY_LABELS[
                      subcategory
                    ]}
                  </h4>

                  <SkillChipList
                    category={category}
                    label={`${
                      SKILL_SUBCATEGORY_LABELS[
                        subcategory
                      ]
                    } skills`}
                    skills={subgroupSkills}
                  />
                </div>
              ),
            )}
          </div>
        )}
    </div>
  );
}

interface SkillChipListProps {
  category: SkillCategory;

  label: string;

  skills: Skill[];
}

function SkillChipList({
  category,
  label,
  skills,
}: SkillChipListProps) {
  return (
    <ul
      className="skill-group__chips"
      aria-label={label}
    >
      {skills.map(
        (skill) => (
          <li
            key={skill.id}
            className={`skill-chip skill-chip--${category}`}
          >
            {skill.label}
          </li>
        ),
      )}
    </ul>
  );
}

function groupSkillsByCategory(
  skills: Skill[],
): Map<
  SkillCategory,
  Skill[]
> {
  const grouped = new Map<
    SkillCategory,
    Skill[]
  >();

  for (const skill of skills) {
    const categorySkills = grouped.get(
      skill.category,
    );

    if (categorySkills) {
      categorySkills.push(
        skill,
      );

      continue;
    }

    grouped.set(
      skill.category,
      [
        skill,
      ],
    );
  }

  return grouped;
}

function groupSkillsBySubcategory(
  skills: Skill[],
): Map<
  SkillSubcategory,
  Skill[]
> {
  const grouped = new Map<
    SkillSubcategory,
    Skill[]
  >();

  for (const skill of skills) {
    if (!skill.subcategory) {
      continue;
    }

    const subgroupSkills = grouped.get(
      skill.subcategory,
    );

    if (subgroupSkills) {
      subgroupSkills.push(
        skill,
      );

      continue;
    }

    grouped.set(
      skill.subcategory,
      [
        skill,
      ],
    );
  }

  return grouped;
}
