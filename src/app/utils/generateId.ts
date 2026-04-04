import { randomUUID } from "crypto";

/**
 * Generates a cryptographically secure unique ID.
 * Replaces Math.random()-based ID generation throughout the codebase.
 */
export function generateId(): string {
  return randomUUID();
}
