import type { EntityId } from "../domain/models";

export interface IdGenerator {
  generate(): EntityId;
}

const fallbackId = (): EntityId => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 12);
  return `bb-${timestamp}-${random}`;
};

export const defaultIdGenerator: IdGenerator = {
  generate: () => (typeof window.crypto?.randomUUID === "function" ? window.crypto.randomUUID() : fallbackId()),
};
