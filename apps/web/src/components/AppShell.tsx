import type { PropsWithChildren } from "react";

import { SiteNavigation } from "./SiteNavigation.tsx";

import "./AppShell.css";

export function AppShell({
  children,
}: PropsWithChildren) {
  return (
    <div className="app-shell">
      <SiteNavigation />

      <main className="app-shell__main">
        {children}
      </main>

      <footer className="app-shell__footer">
        <p>
          Designed and built by Luigi Campbell.
        </p>
      </footer>
    </div>
  );
}
