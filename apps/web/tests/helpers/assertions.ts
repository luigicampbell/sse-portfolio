const DEFAULT_FLOAT_TOLERANCE = 1e-10;

type TestAssert = {
  assert(
    condition: unknown,
    message: string,
  ): asserts condition;

  equals<T>(
    actual: T,
    expected: T,
    message: string,
  ): void;

  approximatelyEquals(
    actual: number,
    expected: number,
    message: string,
    tolerance?: number,
  ): void;

  sameReference<T extends object>(
    actual: T,
    expected: T,
    message: string,
  ): void;

  differentReference<T extends object>(
    actual: T,
    expected: T,
    message: string,
  ): void;

  throws(
    callback: () => unknown,
    expectedError: ErrorConstructor,
    message: string,
  ): Error;
};

function assert(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function equals<T>(
  actual: T,
  expected: T,
  message: string,
): void {
  if (!Object.is(actual, expected)) {
    throw new Error(
      `${message} Expected ${String(expected)}, received ${String(actual)}.`,
    );
  }
}

function approximatelyEquals(
  actual: number,
  expected: number,
  message: string,
  tolerance = DEFAULT_FLOAT_TOLERANCE,
): void {
  const difference = Math.abs(actual - expected);

  if (difference > tolerance) {
    throw new Error(
      `${message} Expected approximately ${String(expected)}, received ${
        String(actual)
      }.`,
    );
  }
}

function sameReference<T extends object>(
  actual: T,
  expected: T,
  message: string,
): void {
  if (actual !== expected) {
    throw new Error(message);
  }
}

function differentReference<
  T extends object,
>(
  actual: T,
  expected: T,
  message: string,
): void {
  if (actual === expected) {
    throw new Error(message);
  }
}

function throws(
  callback: () => unknown,
  expectedError: ErrorConstructor,
  message: string,
): Error {
  try {
    callback();
  } catch (error) {
    if (error instanceof expectedError) {
      return error;
    }

    const receivedError = error instanceof Error ? error.name : typeof error;

    throw new Error(
      `${message} Expected ${expectedError.prototype.name}, received ${receivedError}.`,
    );
  }

  throw new Error(
    `${message} Expected ${expectedError.prototype.name} to be thrown.`,
  );
}

export const testAssert: TestAssert = {
  assert,
  equals,
  approximatelyEquals,
  sameReference,
  differentReference,
  throws,
};
