export function parseApiError(err: unknown): string {
  const e = err as {
    response?: {
      status?: number
      data?: { error?: string; message?: string; messages?: Record<string, string[]> }
    }
  }

  if (e?.response?.status === 429) {
    return "Too many requests. Please wait a moment and try again."
  }

  if (e?.response?.status === 403) {
    return e?.response?.data?.error ?? "You don't have permission to do this."
  }

  const messages = e?.response?.data?.messages
  if (messages) {
    const firstField = Object.keys(messages)[0]
    return messages[firstField][0] ?? "Validation error"
  }

  return (
    e?.response?.data?.error ??
    e?.response?.data?.message ??
    "Something went wrong. Please try again."
  )
}
