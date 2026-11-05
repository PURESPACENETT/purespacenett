const DNS_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";

function uuidBytes(uuid: string): Uint8Array {
  return new Uint8Array(
    uuid
      .replaceAll("-", "")
      .match(/.{2}/g)!
      .map((byte) => Number.parseInt(byte, 16)),
  );
}

/** Stable UUID v5 for one Meta lead, used with quote_requests.source_external_id. */
export async function metaLeadExternalId(leadgenId: string): Promise<string> {
  const namespace = uuidBytes(DNS_NAMESPACE);
  const name = new TextEncoder().encode(`purespacenett.com:meta-leadgen:v1:${leadgenId}`);
  const input = new Uint8Array(namespace.length + name.length);
  input.set(namespace);
  input.set(name, namespace.length);

  const digest = new Uint8Array(await crypto.subtle.digest("SHA-1", input)).slice(0, 16);
  digest[6] = (digest[6]! & 0x0f) | 0x50;
  digest[8] = (digest[8]! & 0x3f) | 0x80;

  const hex = [...digest].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export async function processIndividually<T, R>(
  items: readonly T[],
  processOne: (item: T) => Promise<R>,
): Promise<{ completed: R[]; failed: Array<{ item: T; error: unknown }> }> {
  const completed: R[] = [];
  const failed: Array<{ item: T; error: unknown }> = [];

  for (const item of items) {
    try {
      completed.push(await processOne(item));
    } catch (error) {
      failed.push({ item, error });
    }
  }

  return { completed, failed };
}
