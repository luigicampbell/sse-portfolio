import { useEffect, useState } from "react";

import { createBrowserGameLoopDependencies } from "./browser-game-loop.ts";

import { startNotFoundGameLoop } from "./game-loop.ts";

import {
  createNotFoundGameRuntimeState,
  type NotFoundGameRuntimeState,
} from "./game-runtime.ts";

import "./NotFoundGame.css";

export function NotFoundGame() {
  const [runtimeState, setRuntimeState] = useState<NotFoundGameRuntimeState>(
    createNotFoundGameRuntimeState,
  );

  useEffect(() => {
    const initialRuntimeState = createNotFoundGameRuntimeState();

    setRuntimeState(
      initialRuntimeState,
    );

    const dependencies = createBrowserGameLoopDependencies(
      setRuntimeState,
    );

    const controller = startNotFoundGameLoop(
      initialRuntimeState,
      dependencies,
    );

    return () => {
      controller.stop();
    };
  }, []);

  return (
    <section
      className="not-found-game"
      aria-label="Not found game"
    >
      <p className="not-found-game__status">
        {runtimeState.gameState.status}
      </p>
    </section>
  );
}
