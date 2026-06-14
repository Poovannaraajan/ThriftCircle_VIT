export function parseApiError(err: unknown): string {
  const e = err as { response?: { data?: { error?: string; message?: string } } };
  return e?.response?.data?.error 
    ?? e?.response?.data?.message 
    ?? "Something went wrong. Please try again.";
}
