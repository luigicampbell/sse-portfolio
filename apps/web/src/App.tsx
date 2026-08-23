import { lazy, Suspense, useEffect, useState } from "react";
import type { PortfolioPageResponse } from "@domain/mod.ts";

import { AppShell } from "./components/AppShell.tsx";
import { AppSkeleton } from "./components/AppSkeleton.tsx";
import { Loading } from "./components/Loading.tsx";
import { getPortfolio } from "./lib/api.ts";
import { useDocumentSectionTitle } from "./lib/use-document-section-title.ts";
import {
  useLocationHashNavigation,
} from "./lib/use-location-hash-navigation.ts";

import { NotFoundPage } from "./pages/NotFoundPage.tsx";
import { Hero } from "./sections/Hero.tsx";

const Projects = lazy(
  () => import("./sections/Projects.tsx"),
);

const Experience = lazy(
  () => import("./sections/Experience.tsx"),
);

const Skills = lazy(
  () => import("./sections/Skills.tsx"),
);

const SkillsCharts = lazy(
  () =>
    import(
      "./features/skills-charts/SkillsCharts.tsx"
    ),
);

type LoadState =
  | {
    status: "loading";
  }
  | {
    status: "ready";
    data: PortfolioPageResponse;
  }
  | {
    status: "error";
    message: string;
  };

const PORTFOLIO_PATH = "/";

export function App() {
  const pathname = globalThis.location.pathname;

  if (pathname !== PORTFOLIO_PATH) {
    return <NotFoundPage />;
  }

  return <PortfolioApp />;
}

function PortfolioApp() {
  const [state, setState] = useState<LoadState>({
    status: "loading",
  });

  useDocumentSectionTitle(
    state.status === "ready",
  );

  useLocationHashNavigation(
    state.status === "ready",
  );

  useEffect(() => {
    const controller = new AbortController();

    getPortfolio(controller.signal)
      .then((data) => {
        setState({
          status: "ready",
          data,
        });
      })
      .catch((error: unknown) => {
        if (
          controller.signal.aborted
        ) {
          return;
        }

        const message = error instanceof Error
          ? error.message
          : "Unable to load the portfolio.";

        setState({
          status: "error",
          message,
        });
      });

    return () => {
      controller.abort();
    };
  }, []);

  if (state.status === "loading") {
    return <AppSkeleton label="Loading portfolio" />;
  }

  if (state.status === "error") {
    return (
      <AppShell>
        <section
          className="app-status"
          role="alert"
        >
          <p className="app-status__eyebrow">
            Connection problem
          </p>

          <h1 className="app-status__title">
            The portfolio API could not be reached.
          </h1>

          <p className="app-status__message">
            {state.message}
          </p>

          <p className="app-status__hint">
            Confirm that{" "}
            <code>
              deno task dev:api
            </code>{" "}
            is running.
          </p>
        </section>
      </AppShell>
    );
  }

  const { data } = state;

  return (
    <AppShell>
      <Hero
        profile={data.hero.profile}
      />

      <Suspense
        fallback={
          <Loading
            variant="inline"
            label="Loading projects"
          />
        }
      >
        <Projects
          featuredProjects={data.projects.featured}
          projects={data.projects.all}
        />
      </Suspense>

      <Suspense
        fallback={
          <Loading
            variant="inline"
            label="Loading experience"
          />
        }
      >
        <Experience
          experience={data.experience.items}
        />
      </Suspense>

      <Suspense
        fallback={
          <Loading
            variant="inline"
            label="Loading skills"
          />
        }
      >
        <Skills
          skills={data.skills.items}
        />
      </Suspense>

      <Suspense
        fallback={
          <Loading
            variant="inline"
            label="Loading skill charts"
          />
        }
      >
        <SkillsCharts
          skills={data.skills.items}
        />
      </Suspense>
    </AppShell>
  );
}
