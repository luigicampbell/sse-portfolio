export type NotFoundGamePointerInput = {
  readonly button: number;
  readonly isPrimary: boolean;
};

export function isNotFoundGameJumpKey(
  key: string,
): boolean {
  return key === " " ||
    key === "ArrowUp";
}

export function shouldHandleNotFoundGamePointer(
  input: NotFoundGamePointerInput,
): boolean {
  return input.button === 0 &&
    input.isPrimary;
}
