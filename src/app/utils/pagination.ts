import { MAX_PAGINATION_LIMIT } from "../../config/constants";

/**
 * Parses a raw pagination limit value (from query params or filter objects),
 * enforcing a minimum of 1 and a hard cap of MAX_PAGINATION_LIMIT to prevent
 * DoS via memory exhaustion.
 */
export function parseLimit(raw: unknown, defaultValue: number): number {
  const parsed = parseInt(raw as string);
  const value = isNaN(parsed) ? defaultValue : parsed;
  return Math.min(Math.max(value, 1), MAX_PAGINATION_LIMIT);
}
