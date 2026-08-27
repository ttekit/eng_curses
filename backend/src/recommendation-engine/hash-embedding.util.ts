import type { Vector384 } from "./recommendation.types";

export const VECTOR_DIMS = 384;

function hash_token(token: string): number {
  let hash = 2166136261;
  for (let index = 0; index < token.length; index += 1) {
    hash ^= token.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function tokenize_for_embed(text: string): string[] {
  const matches = text.toLowerCase().match(/[\p{L}\p{N}'-]+/gu) ?? [];
  return matches
    .map((token) => token.replace(/^['-]+|['-]+$/g, ""))
    .filter((token) => token.length >= 2);
}

export function hash_embed(text: string): Vector384 {
  const vector = new Array<number>(VECTOR_DIMS).fill(0);
  const tokens = tokenize_for_embed(text);
  if (tokens.length === 0) {
    return vector as Vector384;
  }
  for (const token of tokens) {
    const bucket = hash_token(token) % VECTOR_DIMS;
    vector[bucket] = (vector[bucket] ?? 0) + 1;
  }
  let norm = 0;
  for (const value of vector) {
    norm += value * value;
  }
  norm = Math.sqrt(norm);
  if (norm === 0) {
    return vector as Vector384;
  }
  return vector.map((value) => value / norm) as Vector384;
}

export function vector_to_pg_literal(vector: Vector384): string {
  return `[${vector.join(",")}]`;
}

export function cosine_similarity(
  left: Vector384 | null,
  right: Vector384 | null,
): number {
  if (!left || !right || left.length !== right.length) {
    return 0;
  }
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let index = 0; index < left.length; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;
    dot += leftValue * rightValue;
    leftNorm += leftValue * leftValue;
    rightNorm += rightValue * rightValue;
  }
  const denom = Math.sqrt(leftNorm) * Math.sqrt(rightNorm);
  if (denom === 0) {
    return 0;
  }
  return dot / denom;
}

export function cefr_to_proficiency_level(cefr: string | null | undefined): number {
  if (!cefr?.trim()) {
    return 2;
  }
  const normalized = cefr.trim().toLowerCase();
  if (/\bpre[-\s]?a1\b/.test(normalized)) return 1;
  if (/\ba1\b/.test(normalized)) return 1;
  if (/\ba2\b/.test(normalized)) return 2;
  if (/\bb1\b/.test(normalized)) return 3;
  if (/\bb2\b/.test(normalized)) return 4;
  if (/\bc1\b/.test(normalized)) return 5;
  if (/\bc2\b/.test(normalized)) return 6;
  return 2;
}
