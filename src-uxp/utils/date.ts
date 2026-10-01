import { ValidationError } from "../domain/errors";
import type { ISODateString } from "../domain/models";

export const now = (): ISODateString => new Date().toISOString();

export const parse = (value: ISODateString): Date => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError("Date values must be valid ISO 8601 timestamps.");
  }
  return parsed;
};

export const compare = (left: ISODateString, right: ISODateString): number =>
  parse(left).getTime() - parse(right).getTime();

export const formatForDisplay = (value: ISODateString, locale = "en-US"): string =>
  new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(parse(value));
