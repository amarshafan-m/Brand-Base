import { ValidationError } from "./errors";
import { CURRENT_SCHEMA_VERSION, type VersionedRecord } from "./schema";

export type Migration<T extends VersionedRecord> = (record: T) => T;

export interface MigrationPlan<T extends VersionedRecord> {
  fromVersion: number;
  migrate: Migration<T>;
}

export function migrateRecord<T extends VersionedRecord>(
  record: T,
  migrations: MigrationPlan<T>[],
  targetVersion = CURRENT_SCHEMA_VERSION,
): T {
  if (record.schemaVersion > targetVersion) {
    throw new ValidationError("This Brand Base record was created by a newer version.");
  }

  let migrated = record;
  while (migrated.schemaVersion < targetVersion) {
    const migration = migrations.find((candidate) => candidate.fromVersion === migrated.schemaVersion);
    if (!migration) {
      throw new ValidationError(`No migration exists from schema version ${migrated.schemaVersion}.`);
    }
    migrated = migration.migrate(migrated);
  }

  return migrated;
}
