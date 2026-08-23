import {
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { createBrowserGameLoopDependencies } from "./browser-game-loop.ts";

import {
  type NotFoundGameLoopController,
  startNotFoundGameLoop,
} from "./game-loop.ts";

import {
  createNotFoundGameRuntimeState,
  jumpNotFoundGameRuntime,
  type NotFoundGameRuntimeState,
  restartNotFoundGameRuntime,
} from "./game-runtime.ts";

import {
  isNotFoundGameJumpKey,
  shouldHandleNotFoundGamePointer,
} from "./game-input.ts";

import { playNotFoundGameSoundEffect } from "./browser-game-audio.ts";

import { getNotFoundGameSoundEffect } from "./game-audio.ts";

import { startGame } from "./game-state.ts";

import "./NotFoundGame.css";

const WORLD_WIDTH = 14;
const PLAYER_X = 1;
const PLAYER_WIDTH = 1;

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

    let previousRuntimeState = initialRuntimeState;

    const dependencies = createBrowserGameLoopDependencies(
      (
        nextRuntimeState,
      ) => {
        const soundEffect = getNotFoundGameSoundEffect(
          previousRuntimeState
            .gameState,
          nextRuntimeState
            .gameState,
        );

        previousRuntimeState = nextRuntimeState;

        if (soundEffect !== null) {
          playNotFoundGameSoundEffect(
            soundEffect,
          );
        }

        setRuntimeState(
          nextRuntimeState,
        );
      },
    );

    const controller = startNotFoundGameLoop(
      initialRuntimeState,
      dependencies,
    );

    controllerRef.current = controller;

    const handleVisibilityChange = (): void => {
      controller.setPaused(
        document.visibilityState ===
          "hidden",
      );
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    handleVisibilityChange();

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );

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

  useEffect(() => {
    if (
      gameState.status !==
        "running"
    ) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ): void => {
      if (
        !isNotFoundGameJumpKey(
          event.key,
        )
      ) {
        return;
      }

      event.preventDefault();

      controllerRef.current
        ?.updateRuntimeState(
          jumpNotFoundGameRuntime,
        );
    };

    globalThis.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      globalThis.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [gameState.status]);

  const handleJump = (): void => {
    controllerRef.current
      ?.updateRuntimeState(
        jumpNotFoundGameRuntime,
      );
  };

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
  ): void => {
    if (
      gameState.status !==
        "running" ||
      !shouldHandleNotFoundGamePointer({
        button: event.button,
        isPrimary: event.isPrimary,
      })
    ) {
      return;
    }

    event.preventDefault();

    handleJump();
  };

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

        <span
          className="not-found-game__status"
          role="status"
        >
          {gameState.status}
        </span>
      </header>

      <div
        className="not-found-game__world"
        aria-label="Game world"
        onPointerDown={handlePointerDown}
      >
        <div
          className="not-found-game__player"
          style={{
            left: toWorldPercent(PLAYER_X),
            width: toWorldPercent(PLAYER_WIDTH),
            bottom: `calc(
              var(--not-found-game-ground-offset) +
              (${-gameState.player.y} * var(--not-found-game-unit))
            )`,
          }}
          aria-hidden="true"
        />

        {gameState.obstacles.map(
          (obstacle) => (
            <div
              key={obstacle.id}
              className="not-found-game__obstacle"
              style={{
                left: toWorldPercent(
                  obstacle.x,
                ),
                width: toWorldPercent(
                  obstacle.width,
                ),
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
      </div>
    </section>
  );
}

function toWorldPercent(
  value: number,
): string {
  return `${
    (value / WORLD_WIDTH) *
    100
  }%`;
}
