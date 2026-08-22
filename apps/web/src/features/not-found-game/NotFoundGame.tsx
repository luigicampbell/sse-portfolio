import { useEffect, useRef, useState } from "react";

import { createBrowserGameLoopDependencies } from "./browser-game-loop.ts";

import {
  type NotFoundGameLoopController,
  startNotFoundGameLoop,
} from "./game-loop.ts";

import {
  createNotFoundGameRuntimeState,
  type NotFoundGameRuntimeState,
  restartNotFoundGameRuntime,
} from "./game-runtime.ts";

import { startGame } from "./game-state.ts";

import "./NotFoundGame.css";

const WORLD_WIDTH = 14;

export function NotFoundGame() {
  const [runtimeState, setRuntimeState] = useState<NotFoundGameRuntimeState>(
    createNotFoundGameRuntimeState,
  );

  const controllerRef = useRef<NotFoundGameLoopController | null>(
    null,
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

    controllerRef.current = controller;

    return () => {
      controller.stop();

      if (
        controllerRef.current ===
          controller
      ) {
        controllerRef.current = null;
      }
    };
  }, []);

  const handleStart = (): void => {
    controllerRef.current
      ?.updateRuntimeState(
        (
          state,
        ): NotFoundGameRuntimeState => {
          const gameState = startGame(
            state.gameState,
          );

          if (
            gameState ===
              state.gameState
          ) {
            return state;
          }

          return {
            ...state,
            gameState,
          };
        },
      );
  };

  const handleRestart = (): void => {
    controllerRef.current
      ?.updateRuntimeState(
        restartNotFoundGameRuntime,
      );
  };

  const gameState = runtimeState.gameState;

  return (
    <section
      className="not-found-game"
      aria-label="Not found game"
    >
      <header className="not-found-game__hud">
        <p>
          Score{" "}
          <strong>
            {gameState.score}
          </strong>
        </p>

        <p>
          High score{" "}
          <strong>
            {gameState.highScore}
          </strong>
        </p>
      </header>

      <div
        className="not-found-game__world"
        aria-label="Game world"
      >
        <div
          className="not-found-game__player"
          style={{
            bottom: `calc(${-gameState.player.y} * var(--not-found-game-unit))`,
          }}
          aria-hidden="true"
        />

        {gameState.obstacles.map(
          (obstacle) => (
            <div
              key={obstacle.id}
              className="not-found-game__obstacle"
              style={{
                left: `${
                  (
                    obstacle.x /
                    WORLD_WIDTH
                  ) * 100
                }%`,
                width: `${
                  (
                    obstacle.width /
                    WORLD_WIDTH
                  ) * 100
                }%`,
                height: `calc(${obstacle.height} * var(--not-found-game-unit))`,
              }}
              aria-hidden="true"
            />
          ),
        )}

        <div
          className="not-found-game__ground"
          aria-hidden="true"
        />
      </div>

      <div className="not-found-game__controls">
        {gameState.status ===
            "ready" && (
          <button
            type="button"
            className="not-found-game__control"
            onClick={handleStart}
          >
            Start game
          </button>
        )}

        {gameState.status ===
            "game-over" && (
          <button
            type="button"
            className="not-found-game__control"
            onClick={handleRestart}
          >
            Play again
          </button>
        )}
      </div>

      <p
        className="not-found-game__status"
        role="status"
      >
        {gameState.status}
      </p>
    </section>
  );
}
