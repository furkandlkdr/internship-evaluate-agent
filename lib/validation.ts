export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export const MAX_FIRST_NAME = 50;
export const MAX_LAST_NAME = 50;
export const MAX_TECHNOLOGIES = 1000;
export const MAX_DESCRIPTION = 5000;
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export function validateFirstName(value: string): ValidationResult {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { valid: false, message: "Ad alanı zorunludur." };
  }
  if (trimmed.length > MAX_FIRST_NAME) {
    return {
      valid: false,
      message: `Ad en fazla ${MAX_FIRST_NAME} karakter olabilir.`,
    };
  }
  return { valid: true };
}

export function validateLastName(value: string): ValidationResult {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { valid: false, message: "Soyad alanı zorunludur." };
  }
  if (trimmed.length > MAX_LAST_NAME) {
    return {
      valid: false,
      message: `Soyad en fazla ${MAX_LAST_NAME} karakter olabilir.`,
    };
  }
  return { valid: true };
}

export function validateTechnologies(value: string): ValidationResult {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return {
      valid: false,
      message: "Kullandığınız teknolojiler / uygulamalar alanı zorunludur.",
    };
  }
  if (trimmed.length > MAX_TECHNOLOGIES) {
    return {
      valid: false,
      message: `Bu alan en fazla ${MAX_TECHNOLOGIES} karakter olabilir.`,
    };
  }
  return { valid: true };
}

export function validateDescription(value: string): ValidationResult {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return { valid: false, message: "Açıklama alanı zorunludur." };
  }
  if (trimmed.length > MAX_DESCRIPTION) {
    return {
      valid: false,
      message: `Açıklama en fazla ${MAX_DESCRIPTION} karakter olabilir.`,
    };
  }
  return { valid: true };
}

export function validateCv(file: File | null): ValidationResult {
  if (!file) {
    return { valid: false, message: "CV yüklenmesi zorunludur." };
  }
  if (file.type !== "application/pdf") {
    return { valid: false, message: "Sadece PDF dosyaları kabul edilir." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      message: `Dosya boyutu en fazla ${MAX_FILE_SIZE_MB} MB olabilir.`,
    };
  }
  return { valid: true };
}
