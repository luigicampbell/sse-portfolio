import type { PropsWithChildren } from "react";

import { SiteNavigation } from "./SiteNavigation.tsx";

import "./AppShell.css";

type AppShellLayout =
  | "default"
  | "immersive";

type AppShellProps = PropsWithChildren<{
  showFooter?: boolean;
  layout?: AppShellLayout;
}>;

export function AppShell({
  children,
  showFooter = true,
  layout = "default",
}: AppShellProps) {
  return (
    <div
      className="app-shell"
      data-layout={layout}
    >
      <SiteNavigation />

      <main className="app-shell__main">
        {children}
      </main>

      {showFooter && (
        <footer className="app-shell__footer">
          <p>
            Designed and built by Luigi Campbell.
          </p>
        </footer>
      )}
    </div>
  );
}
