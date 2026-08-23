import { useEffect } from "react";

export function getLocationHashTargetId(
  hash: string,
): string | null {
  if (
    hash.length <= 1 ||
    !hash.startsWith("#")
  ) {
    return null;
  }

  try {
    const id = decodeURIComponent(
      hash.slice(1),
    ).trim();

    return id.length > 0 ? id : null;
  } catch {
    return null;
  }
}

export function useLocationHashNavigation(
  isReady: boolean,
): void {
  useEffect(() => {
    if (!isReady) {
      return;
    }

    let observer: MutationObserver | null = null;

    let animationFrameId: number | null = null;

    const disconnectObserver = (): void => {
      observer?.disconnect();
      observer = null;
    };

    const scrollToHashTarget = (): boolean => {
      const targetId = getLocationHashTargetId(
        globalThis.location.hash,
      );

      if (targetId === null) {
        disconnectObserver();

        return true;
      }

      const target = globalThis.document
        .getElementById(
          targetId,
        );

      if (target === null) {
        return false;
      }

      disconnectObserver();

      if (
        animationFrameId !== null
      ) {
        globalThis
          .cancelAnimationFrame(
            animationFrameId,
          );
      }

      animationFrameId = globalThis
        .requestAnimationFrame(
          () => {
            animationFrameId = null;

            target.scrollIntoView({
              block: "start",
            });
          },
        );

      return true;
    };

    const watchForTarget = (): void => {
      disconnectObserver();

      if (
        scrollToHashTarget()
      ) {
        return;
      }

      observer = new MutationObserver(
        () => {
          scrollToHashTarget();
        },
      );

      observer.observe(
        globalThis.document.body,
        {
          childList: true,
          subtree: true,
        },
      );
    };

    const handleHashChange = (): void => {
      watchForTarget();
    };

    watchForTarget();

    globalThis.addEventListener(
      "hashchange",
      handleHashChange,
    );

    return () => {
      globalThis.removeEventListener(
        "hashchange",
        handleHashChange,
      );

      disconnectObserver();

      if (
        animationFrameId !== null
      ) {
        globalThis
          .cancelAnimationFrame(
            animationFrameId,
          );
      }
    };
  }, [isReady]);
}
