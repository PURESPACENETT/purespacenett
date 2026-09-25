type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function cleanupMemoryBuckets(now: number): void {
  if (buckets.size < 10_000) return;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function consumeMemoryRateLimit(
  key: string,
  options: { limit: number; windowMs: number },
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  cleanupMemoryBuckets(now);

  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= options.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

async function hashBucketKey(key: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(key),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function checkRateLimit(
  key: string,
  options: { limit: number; windowMs: number },
): Promise<{ allowed: boolean; retryAfterSeconds: number }> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const scope = key.split(":")[0] ?? "default";
    const bucketKey = scope + ":" + (await hashBucketKey(key));
    const { data, error } = await supabaseAdmin.rpc("consume_rate_limit", {
      p_bucket_key: bucketKey,
      p_limit: options.limit,
      p_window_seconds: Math.ceil(options.windowMs / 1000),
    });

    if (error || !data?.[0]) {
      throw error ?? new Error("Réponse de rate limiting invalide");
    }

    return {
      allowed: data[0].allowed,
      retryAfterSeconds: data[0].retry_after_seconds,
    };
  } catch (error) {
    // Défense en profondeur : si Supabase ou la migration distribuée est indisponible,
    // on conserve une protection locale plutôt que de laisser passer les requêtes sans limite.
    console.error("Rate limiting distribué indisponible, bascule mémoire", error);
    return consumeMemoryRateLimit(key, options);
  }
}

export function requestKey(request: Request, scope: string): string {
  const cloudflareIp = request.headers.get("cf-connecting-ip")?.trim();
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  const ip = cloudflareIp || forwarded || realIp || "unknown";
  return scope + ":" + ip;
}
