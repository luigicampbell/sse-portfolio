import type { PropsWithChildren } from "react";

import "./AppShell.css";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div id="home" className="app-shell">
      <header className="site-header">
        <a
          className="site-header__brand"
          href="#home"
          aria-label="Luigi Campbell home"
        >
          LC
        </a>

        <nav
          className="site-header__nav"
          aria-label="Primary navigation"
        >
          <a className="site-header__link" href="#projects">
            Projects
          </a>

          <a className="site-header__link" href="#experience">
            Experience
          </a>

          <a className="site-header__link" href="#skills">
            Skills
          </a>
        </nav>
      </header>

      <main className="app-shell__main">
        {children}
      </main>

      <footer className="app-shell__footer">
        <p>Designed and built by Luigi Campbell.</p>
      </footer>

      <nav
        className="mobile-tabs"
        aria-label="Mobile navigation"
      >
        <a className="mobile-tabs__link" href="#home" aria-label="Go to home">
          Home
        </a>

        <a
          className="mobile-tabs__link"
          href="#projects"
          aria-label="Go to projects"
        >
          Work
        </a>

        <a
          className="mobile-tabs__link"
          href="#experience"
          aria-label="Go to experience"
        >
          Career
        </a>

        <a
          className="mobile-tabs__link"
          href="#skills"
          aria-label="Go to skills"
        >
          Skills
        </a>
      </nav>
    </div>
  );
}
