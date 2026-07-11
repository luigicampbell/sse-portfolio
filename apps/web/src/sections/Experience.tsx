import type { Experience as ExperienceRecord } from "@domain/mod.ts";

import "./Experience.css";

interface ExperienceProps {
  experience: ExperienceRecord[];
}

export default function Experience({
  experience,
}: ExperienceProps) {
  return (
    <section id="experience" className="experience">
      <div className="experience__heading">
        <p className="experience__eyebrow">
          Background
        </p>

        <h2 className="experience__title">
          Experience
        </h2>

        <p className="experience__description">
          Engineering, technical leadership, and teaching experience.
        </p>
      </div>

      {experience.length > 0
        ? (
          <div className="experience__timeline">
            {experience.map((item) => (
              <article
                className="experience__item"
                key={item.id}
              >
                <div
                  className="experience__marker"
                  aria-hidden="true"
                />

                <div className="experience__content">
                  <div className="experience__item-heading">
                    <div className="experience__position">
                      <h3 className="experience__role">
                        {item.role}
                      </h3>

                      <p className="experience__organization">
                        {item.organization}
                      </p>
                    </div>

                    <time className="experience__dates">
                      {formatDate(item.startDate)}
                      <span aria-hidden="true">–</span>
                      {formatDate(item.endDate)}
                    </time>
                  </div>

                  <p className="experience__summary">
                    {item.summary}
                  </p>

                  {item.highlights.length > 0 && (
                    <ul className="experience__highlights">
                      {item.highlights.map((highlight) => (
                        <li
                          className="experience__highlight"
                          key={highlight}
                        >
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </article>
            ))}
          </div>
        )
        : (
          <p className="experience__empty">
            No experience records are available.
          </p>
        )}
    </section>
  );
}

function formatDate(value?: string): string {
  if (!value) return "Present";

  const [year, month] = value.split("-").map(Number);

  const date = new Date(
    Date.UTC(
      year,
      Math.max((month || 1) - 1, 0),
      1,
    ),
  );

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: month ? "short" : undefined,
    timeZone: "UTC",
  }).format(date);
}
