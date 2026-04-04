/**
 * Escapes special regex characters in a user-supplied string before using it
 * in a MongoDB $regex query, preventing NoSQL injection via regex patterns.
 */
export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
