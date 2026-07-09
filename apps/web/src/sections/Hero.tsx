import type { Profile, ProfileImageSource, RichTextRun } from "@domain/mod.ts";

import "./Hero.css";

interface HeroProps {
  profile: Profile;
}

export function Hero({ profile }: HeroProps) {
  const initials = getInitials(profile.name);

  return (
    <section className="hero">
      <div className="hero__main">
        <div className="hero__identity">
          <div className="hero__media">
            {profile.avatar
              ? (
                <picture className="hero__picture">
                  <source
                    srcSet={createSrcSet(profile.avatar.sources.webp)}
                    sizes="(min-width: 48rem) 16rem, 6.5rem"
                    type="image/webp"
                  />

                  <img
                    className="hero__avatar"
                    src={getLargestSource(profile.avatar.sources.png)}
                    srcSet={createSrcSet(profile.avatar.sources.png)}
                    sizes="(min-width: 48rem) 16rem, 6.5rem"
                    alt={profile.avatar.alt}
                    width={profile.avatar.width}
                    height={profile.avatar.height}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                  />
                </picture>
              )
              : (
                <div
                  className="hero__avatar-placeholder"
                  aria-hidden="true"
                >
                  {initials}
                </div>
              )}
          </div>

          <div className="hero__identity-content">
            <p className="hero__eyebrow">
              {profile.eyebrow}
            </p>

            <h1 className="hero__title">
              {profile.name}
            </h1>

            <p className="hero__headline">
              {profile.headline}
            </p>
          </div>
        </div>

        <p className="hero__summary">
          {profile.summary.map((part: RichTextRun, index: number) => (
            <SummaryRun
              key={`${index}-${part.text}`}
              part={part}
            />
          ))}
        </p>

        <div className="hero__footer">
          {profile.actions.length > 0 && (
            <div
              className="hero__actions"
              aria-label="Portfolio actions"
            >
              {profile.actions.map((action: Profile["actions"][number]) => (
                <a
                  className={[
                    "hero__action",
                    `hero__action--${action.variant}`,
                  ].join(" ")}
                  href={action.href}
                  download={action.download
                    ? `${toFileName(profile.name)}-cv.pdf`
                    : undefined}
                  key={action.id}
                >
                  {action.label}
                </a>
              ))}
            </div>
          )}

          {profile.socials.length > 0 && (
            <ul
              className="hero__socials"
              aria-label="Professional profiles"
            >
              {profile.socials.map((social: Profile["socials"][number]) => (
                <li
                  className="hero__social-item"
                  key={social.id}
                >
                  <a
                    className="hero__social-link"
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {social.label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {(profile.location || profile.email) && (
            <div className="hero__details">
              {profile.location && (
                <p className="hero__detail">
                  {profile.location}
                </p>
              )}

              {profile.email && (
                <a
                  className="hero__detail hero__detail--link"
                  href={`mailto:${profile.email}`}
                >
                  {profile.email}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {profile.metrics.length > 0 && (
        <aside
          className="hero__metrics"
          aria-label="Career highlights"
        >
          {profile.metrics.map((metric: Profile["metrics"][number]) => (
            <article
              className="hero__metric"
              key={metric.id}
            >
              <strong className="hero__metric-value">
                {metric.value}
              </strong>

              <span className="hero__metric-label">
                {metric.label}
              </span>
            </article>
          ))}
        </aside>
      )}
    </section>
  );
}

interface SummaryRunProps {
  part: RichTextRun;
}

function SummaryRun({
  part,
}: SummaryRunProps) {
  const content = part.emphasis ? <strong>{part.text}</strong> : part.text;

  if (!part.link) {
    return <>{content}</>;
  }

  return (
    <a
      className="hero__summary-link"
      href={part.link}
    >
      {content}
    </a>
  );
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function toFileName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createSrcSet(
  sources: readonly ProfileImageSource[],
): string {
  return sources
    .map((source) => `${source.src} ${source.width}w`)
    .join(", ");
}

function getLargestSource(
  sources: readonly ProfileImageSource[],
): string {
  const largest = sources.reduce(
    (currentLargest, source) =>
      source.width > currentLargest.width ? source : currentLargest,
  );

  return largest.src;
}
