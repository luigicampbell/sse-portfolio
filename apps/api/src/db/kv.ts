let connection: Promise<Deno.Kv> | undefined;

export function openKv(
  path?: string,
): Promise<Deno.Kv> {
  connection ??= path ? Deno.openKv(path) : Deno.openKv();

  return connection;
}

export async function closeKv(): Promise<void> {
  if (!connection) {
    return;
  }

  const kv = await connection;

  kv.close();

  connection = undefined;
}
