export async function retryTransient<T>(
  operation: () => Promise<T>,
  shouldRetry: (result: T) => boolean,
  options: { attempts?: number; initialDelayMs?: number } = {},
): Promise<T> {
  const attempts = Math.max(1, Math.floor(options.attempts ?? 3));
  const initialDelayMs = Math.max(0, options.initialDelayMs ?? 200);

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const result = await operation();
      if (!shouldRetry(result) || attempt === attempts - 1) return result;
    } catch (error) {
      if (attempt === attempts - 1) throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, initialDelayMs * 2 ** attempt));
  }

  throw new Error("Retry loop finished without a result.");
}
