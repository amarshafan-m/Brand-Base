export type RepositoryErrorCode = "NOT_FOUND" | "VALIDATION" | "DUPLICATE" | "STORAGE" | "CONFLICT";

export class RepositoryError extends Error {
  readonly code: RepositoryErrorCode;
  readonly entity?: string;

  constructor(code: RepositoryErrorCode, message: string, entity?: string) {
    super(message);
    this.name = "RepositoryError";
    this.code = code;
    this.entity = entity;
  }
}

export class NotFoundError extends RepositoryError {
  constructor(entity: string, id: string) {
    super("NOT_FOUND", `${entity} with id '${id}' was not found.`, entity);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends RepositoryError {
  readonly issues: string[];

  constructor(message: string, issues: string[] = []) {
    super("VALIDATION", message);
    this.name = "ValidationError";
    this.issues = issues;
  }
}

export class DuplicateError extends RepositoryError {
  constructor(entity: string, message: string) {
    super("DUPLICATE", message, entity);
    this.name = "DuplicateError";
  }
}

export class PotentialDuplicateError extends DuplicateError {
  public readonly existingAssetId: string;
  
  constructor(entity: string, message: string, existingAssetId: string) {
    super(entity, message);
    this.name = "PotentialDuplicateError";
    this.existingAssetId = existingAssetId;
  }
}

export class StorageError extends RepositoryError {
  constructor(message: string) {
    super("STORAGE", message);
    this.name = "StorageError";
  }
}
