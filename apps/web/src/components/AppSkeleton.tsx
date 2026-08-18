import "./AppSkeleton.css";

interface AppSkeletonProps {
  label?: string;
}

export function AppSkeleton({
  label = "Loading portfolio",
}: AppSkeletonProps) {
  return (
    <div
      className="app-skeleton"
      aria-busy="true"
    >
      <span
        className="visually-hidden"
        role="status"
      >
        {label}
      </span>

      <div
        className="app-skeleton__hero"
        aria-hidden="true"
      >
        <div className="app-skeleton__main">
          <div className="app-skeleton__identity">
            <div className="app-skeleton__media">
              <div className="app-skeleton__avatar" />
            </div>

            <div className="app-skeleton__identity-content">
              <div className="app-skeleton__line app-skeleton__line--eyebrow" />

              <div className="app-skeleton__name">
                <div className="app-skeleton__line app-skeleton__line--first-name" />
                <div className="app-skeleton__line app-skeleton__line--last-name" />
              </div>

              <div className="app-skeleton__titles">
                <div className="app-skeleton__line app-skeleton__line--title-primary" />
                <div className="app-skeleton__line app-skeleton__line--title-secondary" />
              </div>
            </div>
          </div>

          <div className="app-skeleton__summary">
            <div className="app-skeleton__line app-skeleton__line--summary-full app-skeleton__line--summary-1" />
            <div className="app-skeleton__line app-skeleton__line--summary-full app-skeleton__line--summary-2" />
            <div className="app-skeleton__line app-skeleton__line--summary-full app-skeleton__line--summary-3" />
            <div className="app-skeleton__line app-skeleton__line--summary-short app-skeleton__line--summary-4" />
          </div>

          <div className="app-skeleton__footer">
            <div className="app-skeleton__actions">
              <div className="app-skeleton__action" />
              <div className="app-skeleton__action" />
            </div>

            <div className="app-skeleton__socials">
              <div className="app-skeleton__social-control" />
            </div>

            <div className="app-skeleton__details">
              <div className="app-skeleton__line app-skeleton__line--location" />
            </div>
          </div>
        </div>

        <div className="app-skeleton__metrics">
          <div className="app-skeleton__metric">
            <div className="app-skeleton__line app-skeleton__line--metric-value" />
            <div className="app-skeleton__line app-skeleton__line--metric-label" />
          </div>

          <div className="app-skeleton__metric">
            <div className="app-skeleton__line app-skeleton__line--metric-value" />
            <div className="app-skeleton__line app-skeleton__line--metric-label" />
          </div>

          <div className="app-skeleton__metric">
            <div className="app-skeleton__line app-skeleton__line--metric-value" />
            <div className="app-skeleton__line app-skeleton__line--metric-label" />
          </div>
        </div>
      </div>
    </div>
  );
}
