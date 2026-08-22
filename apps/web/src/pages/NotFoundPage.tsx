import { AppShell } from "../components/AppShell.tsx";

import { NotFoundGame } from "../features/not-found-game/NotFoundGame.tsx";

import "./NotFoundPage.css";

export function NotFoundPage() {
  return (
    <AppShell>
      <section
        className="not-found-page stack stack--8"
        aria-labelledby="not-found-title"
      >
        <div className="not-found-page__intro content-width stack stack--4">
          <p
            className="not-found-page__eyebrow font-mono"
            aria-hidden="true"
          >
            404
          </p>

          <h1
            id="not-found-title"
            className="not-found-page__title"
          >
            You&apos;ve wandered beyond the mapped paths.
          </h1>

          <blockquote className="not-found-page__quote">
            <p className="not-found-page__quote-text">
              “Not all those who wander are lost.”
            </p>

            <footer className="not-found-page__quote-footer">
              <cite>
                — J.R.R. Tolkien,{" "}
                <em>
                  The Fellowship of the Ring
                </em>
              </cite>
            </footer>
          </blockquote>

          <p className="not-found-page__message">
            This path does not exist in the portfolio. Return to familiar
            ground, or stay a while and play.
          </p>

          <div className="not-found-page__actions cluster">
            <a
              className="not-found-page__return-link"
              href="/"
            >
              Return to portfolio
            </a>
          </div>
        </div>

        <NotFoundGame />
      </section>
    </AppShell>
  );
}
