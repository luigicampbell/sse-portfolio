let connection: Promise<Deno.Kv> | undefined;

export function openKv(path: string): Promise<Deno.Kv> {
  connection ??= Deno.openKv(path);
  return connection;
}

export async function closeKv(): Promise<void> {
  if (!connection) return;

  const kv = await connection;
  kv.close();
  connection = undefined;
}
