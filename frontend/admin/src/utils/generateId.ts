/** Generate client-side IDs for GAS CREATE payloads when the server does not assign one. */
export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
