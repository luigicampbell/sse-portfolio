import { AppShell } from "../components/AppShell.tsx";

import { NotFoundGame } from "../features/not-found-game/NotFoundGame.tsx";

export function NotFoundPage() {
  return (
    <AppShell>
      <section
        className="not-found-page"
        aria-labelledby="not-found-title"
      >
        <p className="not-found-page__eyebrow">
          404
        </p>

        <h1
          id="not-found-title"
          className="not-found-page__title"
        >
          This page wandered off.
        </h1>

        <p className="not-found-page__message">
          The page you requested does not exist. You can head back to the
          portfolio or hang around and play.
        </p>

        <p>
          <a href="/">
            Return to portfolio
          </a>
        </p>

        <NotFoundGame />
      </section>
    </AppShell>
  );
}
