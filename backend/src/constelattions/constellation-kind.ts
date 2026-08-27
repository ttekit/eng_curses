/**
 * Constellation ownership kinds stored on `Constellation.kind`.
 */
export const ConstellationKind = {
  FOUNDATION: "FOUNDATION",
  PERSONAL: "PERSONAL",
} as const;

export type ConstellationKind =
  (typeof ConstellationKind)[keyof typeof ConstellationKind];
