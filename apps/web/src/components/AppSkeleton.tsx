import "./AppSkeleton.css";

interface AppSkeletonProps {
  label: string;
}

export function AppSkeleton({
  label,
}: AppSkeletonProps) {
  return (
    <section
      className="app-skeleton"
      aria-busy="true"
      aria-label={label}
    >
      <p className="app-skeleton__label">{label}</p>

      <div className="
          app-skeleton__line
          app-skeleton__line--title
        " />

      <div className="
          app-skeleton__line
          app-skeleton__line--medium
        " />

      <div className="
          app-skeleton__line
          app-skeleton__line--short
        " />
    </section>
  );
}
