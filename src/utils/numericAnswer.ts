/**
 * Strict Numeric Answer Normalization & Tolerance Engine
 * Supports exact string matches, float normalization (e.g. 5, 5.0, 5.00),
 * and configurable tolerance (default +-0.05).
 */

export interface NumericComparisonOptions {
  tolerance?: number;
  allowRange?: boolean;
}

export function normalizeNumericInput(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '';
  const str = String(value).trim();
  // Remove trailing decimals if whole number, normalize spacing
  return str.replace(/\s+/g, '');
}

export function isNumericAnswerValid(
  studentInput: string | number | null | undefined,
  correctAnswer: string | number | null | undefined,
  options?: NumericComparisonOptions
): boolean {
  if (studentInput === null || studentInput === undefined || correctAnswer === null || correctAnswer === undefined) {
    return false;
  }

  const cleanStudent = normalizeNumericInput(studentInput);
  const cleanCorrect = normalizeNumericInput(correctAnswer);

  if (!cleanStudent || !cleanCorrect) return false;

  // 1. Direct string match
  if (cleanStudent.toLowerCase() === cleanCorrect.toLowerCase()) {
    return true;
  }

  // 2. Parse numbers
  const studentNum = parseFloat(cleanStudent);
  const correctNum = parseFloat(cleanCorrect);

  if (isNaN(studentNum) || isNaN(correctNum)) {
    return false;
  }

  // Exact float comparison
  if (Math.abs(studentNum - correctNum) < Number.EPSILON) {
    return true;
  }

  // 3. Tolerance matching (e.g. +/- 0.05)
  const tolerance = options?.tolerance ?? 0.05;
  if (Math.abs(studentNum - correctNum) <= tolerance) {
    return true;
  }

  return false;
}

