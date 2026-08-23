import "./PeekingEyes.css";

export function PeekingEyes() {
  return (
    <div
      className="peeking-eyes"
      aria-hidden="true"
    >
      <div className="peeking-eyes__pair">
        <span className="peeking-eyes__eye">
          <span className="peeking-eyes__pupil" />
        </span>

        <span className="peeking-eyes__eye">
          <span className="peeking-eyes__pupil" />
        </span>
      </div>
    </div>
  );
}
