import { Transform } from 'class-transformer';

/**
 * Normalises an incoming enum string to UPPERCASE before validation, so the
 * API can accept the lowercase enum values it emits in responses
 * (e.g. "female" -> "FEMALE", "high" -> "HIGH").
 */
export const ToUpper = () =>
  Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  );
