import type { Project } from "@domain/mod.ts";

import "./Projects.css";

interface ProjectsProps {
  featuredProjects: Project[];
  projects: Project[];
}

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

export default function Projects({
  featuredProjects,
  projects,
}: ProjectsProps) {
  const featuredIds = new Set(
    featuredProjects.map((project) => project.id),
  );

  const remainingProjects = projects.filter(
    (project) => !featuredIds.has(project.id),
  );

  return (
    <section id="projects" className="projects">
      <div className="projects__heading">
        <p className="projects__eyebrow">Selected work</p>
        <h2 className="projects__title">Projects</h2>
      </div>

      {featuredProjects.length > 0
        ? (
          <div className="projects__group">
            <div className="projects__grid">
              {featuredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  featured
                />
              ))}
            </div>
          </div>
        )
        : (
          <p className="projects__empty">
            No featured projects are available.
          </p>
        )}

      {remainingProjects.length > 0 && (
        <div className="projects__group">
          <div className="projects__group-heading">
            <p className="projects__eyebrow">More work</p>
            <h3 className="projects__group-title">
              Other projects
            </h3>
          </div>

          <div className="projects__grid projects__grid--compact">
            {remainingProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ProjectCard({
  project,
  featured = false,
}: ProjectCardProps) {
  const repositoryLink = findProjectLink(
    project,
    "source",
    "github",
    "repository",
  );

  const liveLink = findProjectLink(
    project,
    "live",
    "demo",
    "website",
  );

  const visibleTechnologies = project.technologies.slice(0, 5);
  const visibleTags = project.tags?.slice(0, 2) ?? [];

  const detailUrl = `/projects/${encodeURIComponent(project.slug)}`;

  const cardClassName = featured
    ? "project-card project-card--featured"
    : "project-card";

  return (
    <article className={cardClassName}>
      <a
        className="project-card__primary-link"
        href={detailUrl}
        aria-label={`View details for ${project.title}`}
      />

      <div className="project-card__content">
        <div className="project-card__heading">
          <h3 className="project-card__title">
            {project.title}
          </h3>

          {featured && (
            <span className="project-card__featured-label">
              Featured
            </span>
          )}
        </div>

        <p className="project-card__summary">
          {project.summary}
        </p>

        {visibleTechnologies.length > 0 && (
          <ul
            className="project-card__technologies"
            aria-label={`${project.title} technologies`}
          >
            {visibleTechnologies.map((technology) => (
              <li
                key={technology}
                className="project-card__technology"
              >
                {technology}
              </li>
            ))}
          </ul>
        )}

        {visibleTags.length > 0 && (
          <div
            className="project-card__tags"
            aria-label={`${project.title} tags`}
          >
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="project-card__tag"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="project-card__links">
        {repositoryLink && (
          <a
            className="project-card__link"
            href={repositoryLink.url}
            target="_blank"
            rel="noreferrer"
          >
            View source
          </a>
        )}

        {liveLink && (
          <a
            className="project-card__link"
            href={liveLink.url}
            target="_blank"
            rel="noreferrer"
          >
            Live project
          </a>
        )}
      </div>
    </article>
  );
}

function findProjectLink(
  project: Project,
  ...labels: string[]
) {
  return project.links.find((link) =>
    labels.includes(link.label.toLowerCase())
  );
}
