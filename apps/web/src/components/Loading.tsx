import "./Loading.css";

interface LoadingProps {
  label: string;
  variant?:
    | "page"
    | "inline"
    | "control";
}

export function Loading({
  label,
  variant = "inline",
}: LoadingProps) {
  return (
    <div
      className={[
        "loading",
        `loading--${variant}`,
      ].join(" ")}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span
        className="loading__spinner"
        aria-hidden="true"
      />

      <span className="loading__label">
        {label}
      </span>
    </div>
  );
}
