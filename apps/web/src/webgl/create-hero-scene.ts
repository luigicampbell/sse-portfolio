import * as THREE from "three";

import { calculatePixelRatio, normalizePointer } from "./hero-scene.ts";

const CAMERA_FIELD_OF_VIEW = 42;
const CAMERA_NEAR_PLANE = 0.1;
const CAMERA_FAR_PLANE = 100;
const CAMERA_DISTANCE = 7;

const PARTICLE_COUNT = 54;
const PARTICLE_SIZE = 0.045;

const FIELD_WIDTH = 7;
const FIELD_HEIGHT = 4;
const FIELD_DEPTH = 3;

const CONNECTION_DISTANCE = 1.45;

const PARTICLE_OPACITY = 0.72;
const CONNECTION_OPACITY = 0.16;

const ROTATION_SPEED_X = 0.00008;
const ROTATION_SPEED_Y = 0.00012;

const POINTER_ROTATION_X = 0.08;
const POINTER_ROTATION_Y = 0.12;

const POINTER_EASING = 0.035;

const RANDOM_SEED = 2417;

export interface HeroSceneColors {
  primary: string;
  secondary: string;
}

export interface HeroSceneController {
  resize(): void;

  setPointer(
    clientX: number,
    clientY: number,
  ): void;

  dispose(): void;
}

export function createHeroScene(
  canvas: HTMLCanvasElement,
  container: HTMLElement,
  colors: HeroSceneColors,
): HeroSceneController {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });

  renderer.setClearAlpha(
    0,
  );

  renderer.setPixelRatio(
    calculatePixelRatio(
      globalThis.devicePixelRatio ??
        1,
    ),
  );

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    CAMERA_FIELD_OF_VIEW,
    1,
    CAMERA_NEAR_PLANE,
    CAMERA_FAR_PLANE,
  );

  camera.position.z = CAMERA_DISTANCE;

  const field = new THREE.Group();

  scene.add(
    field,
  );

  const positions = createParticlePositions();

  const particleGeometry = new THREE.BufferGeometry();

  particleGeometry
    .setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        positions,
        3,
      ),
    );

  const particleMaterial = new THREE.PointsMaterial({
    color: new THREE.Color(
      colors.primary,
    ),

    size: PARTICLE_SIZE,

    transparent: true,

    opacity: PARTICLE_OPACITY,

    depthWrite: false,
  });

  const particles = new THREE.Points(
    particleGeometry,
    particleMaterial,
  );

  field.add(
    particles,
  );

  const connectionGeometry = createConnectionGeometry(
    positions,
  );

  const connectionMaterial = new THREE.LineBasicMaterial({
    color: new THREE.Color(
      colors.secondary,
    ),

    transparent: true,

    opacity: CONNECTION_OPACITY,

    depthWrite: false,
  });

  const connections = new THREE.LineSegments(
    connectionGeometry,
    connectionMaterial,
  );

  field.add(
    connections,
  );

  const targetRotation = new THREE.Vector2();

  const currentRotation = new THREE.Vector2();

  const clock = new THREE.Clock();

  let animationFrameId: number | undefined;

  let disposed = false;

  function resize(): void {
    if (disposed) {
      return;
    }

    const {
      width,
      height,
    } = container
      .getBoundingClientRect();

    if (
      width <= 0 ||
      height <= 0
    ) {
      return;
    }

    renderer.setPixelRatio(
      calculatePixelRatio(
        globalThis
          .devicePixelRatio ??
          1,
      ),
    );

    renderer.setSize(
      width,
      height,
      false,
    );

    camera.aspect = width /
      height;

    camera
      .updateProjectionMatrix();
  }

  function setPointer(
    clientX: number,
    clientY: number,
  ): void {
    const viewport = container
      .getBoundingClientRect();

    const pointer = normalizePointer(
      clientX,
      clientY,
      viewport,
    );

    targetRotation.x = pointer.y *
      POINTER_ROTATION_X;

    targetRotation.y = pointer.x *
      POINTER_ROTATION_Y;
  }

  function render(): void {
    if (disposed) {
      return;
    }

    animationFrameId = requestAnimationFrame(
      render,
    );

    const elapsed = clock.getElapsedTime();

    currentRotation.x += (
      targetRotation.x -
      currentRotation.x
    ) *
      POINTER_EASING;

    currentRotation.y += (
      targetRotation.y -
      currentRotation.y
    ) *
      POINTER_EASING;

    field.rotation.x = currentRotation.x +
      elapsed *
        ROTATION_SPEED_X;

    field.rotation.y = currentRotation.y +
      elapsed *
        ROTATION_SPEED_Y;

    renderer.render(
      scene,
      camera,
    );
  }

  function dispose(): void {
    if (disposed) {
      return;
    }

    disposed = true;

    if (
      animationFrameId !==
        undefined
    ) {
      cancelAnimationFrame(
        animationFrameId,
      );
    }

    particleGeometry.dispose();
    particleMaterial.dispose();

    connectionGeometry.dispose();
    connectionMaterial.dispose();

    renderer.dispose();
  }

  resize();
  render();

  return {
    resize,
    setPointer,
    dispose,
  };
}

function createParticlePositions(): number[] {
  const random = createSeededRandom(
    RANDOM_SEED,
  );

  const positions: number[] = [];

  for (
    let index = 0;
    index < PARTICLE_COUNT;
    index += 1
  ) {
    positions.push(
      (
        random() -
        0.5
      ) * FIELD_WIDTH,
      (
        random() -
        0.5
      ) * FIELD_HEIGHT,
      (
        random() -
        0.5
      ) * FIELD_DEPTH,
    );
  }

  return positions;
}

function createConnectionGeometry(
  positions: number[],
): THREE.BufferGeometry {
  const vertices: number[] = [];

  const pointCount = positions.length /
    3;

  for (
    let left = 0;
    left < pointCount;
    left += 1
  ) {
    const leftOffset = left * 3;

    for (
      let right = left + 1;
      right < pointCount;
      right += 1
    ) {
      const rightOffset = right * 3;

      const deltaX = positions[
        leftOffset
      ] -
        positions[
          rightOffset
        ];

      const deltaY = positions[
        leftOffset + 1
      ] -
        positions[
          rightOffset + 1
        ];

      const deltaZ = positions[
        leftOffset + 2
      ] -
        positions[
          rightOffset + 2
        ];

      const distance = Math.hypot(
        deltaX,
        deltaY,
        deltaZ,
      );

      if (
        distance >
          CONNECTION_DISTANCE
      ) {
        continue;
      }

      vertices.push(
        positions[
          leftOffset
        ],
        positions[
          leftOffset + 1
        ],
        positions[
          leftOffset + 2
        ],
        positions[
          rightOffset
        ],
        positions[
          rightOffset + 1
        ],
        positions[
          rightOffset + 2
        ],
      );
    }
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      vertices,
      3,
    ),
  );

  return geometry;
}

function createSeededRandom(
  seed: number,
): () => number {
  let state = seed >>> 0;

  return () => {
    state = (
      Math.imul(
        state,
        1664525,
      ) +
      1013904223
    ) >>> 0;

    return (
      state /
      4294967296
    );
  };
}
