import { AppShell } from "../components/AppShell.tsx";

import { NotFoundGame } from "../features/not-found-game/NotFoundGame.tsx";

import { PeekingEyes } from "../features/not-found-game/PeekingEyes.tsx";

import "./NotFoundPage.css";

export function NotFoundPage() {
  return (
    <AppShell
      showFooter={false}
      layout="immersive"
    >
      <section
        className="not-found-page"
        aria-labelledby="not-found-title"
      >
        <header className="not-found-page__intro">
          <p className="not-found-page__eyebrow">
            404 · Uncharted territory
          </p>

          <h1
            id="not-found-title"
            className="not-found-page__title"
          >
            You’ve wandered beyond the mapped paths.
          </h1>

          <blockquote className="not-found-page__quote">
            <p>
              “Not all those who wander are lost.”
            </p>

            <cite>
              J.R.R. Tolkien,{" "}
              <span>
                The Fellowship of the Ring
              </span>
            </cite>
          </blockquote>
        </header>

        <div className="not-found-page__game">
          <NotFoundGame />
        </div>

        <PeekingEyes />
      </section>
    </AppShell>
  );
}
