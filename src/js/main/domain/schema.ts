export const CURRENT_SCHEMA_VERSION = 1 as const;

export type SchemaVersion = typeof CURRENT_SCHEMA_VERSION;

export interface VersionedRecord {
  schemaVersion: number;
}
