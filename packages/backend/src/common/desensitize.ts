const SENSITIVE_FIELDS = [
  "password",
  "oldPassword",
  "newPassword",
  "confirmPassword",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "cookie",
  "secret",
  "secretKey",
  "privateKey",
  "creditCard",
  "cardNumber",
  "cvv",
  "idNumber",
  "idCard",
  "phone",
  "mobile",
  "bankCard",
  "bankAccount",
] as const;

const MASK_CHAR = "*";
const PARTIAL_KEEP = 3;

export function maskSensitiveData<T extends Record<string, unknown>>(
  data: T,
  fieldsToMask?: readonly string[],
): Partial<Record<keyof T, string>> {
  const fields = fieldsToMask ?? SENSITIVE_FIELDS;
  const result: Partial<Record<keyof T, string>> = {};

  for (const key of Object.keys(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = fields.some((f) => lowerKey.includes(f.toLowerCase()));

    if (isSensitive) {
      const value = data[key as keyof T];
      const strValue = typeof value === "string" ? value : String(value ?? "");
      result[key as keyof T] = maskString(strValue);
    }
  }

  return result;
}

export function maskString(value: string): string {
  if (!value || value.length === 0) {
    return value;
  }

  if (value.length <= PARTIAL_KEEP * 2) {
    return MASK_CHAR.repeat(value.length);
  }

  const start = value.slice(0, PARTIAL_KEEP);
  const end = value.slice(-PARTIAL_KEEP);
  const middleLength = value.length - PARTIAL_KEEP * 2;
  const middle = MASK_CHAR.repeat(Math.min(middleLength, 8));

  return `${start}${middle}${end}`;
}

export function maskObject<T extends Record<string, unknown>>(
  obj: T,
  fieldsToMask?: readonly string[],
): T {
  const masked = maskSensitiveData(obj, fieldsToMask);

  const result = { ...obj };

  for (const [key, value] of Object.entries(masked)) {
    (result as Record<string, unknown>)[key] = value;
  }

  return result;
}

export function isSensitiveField(fieldName: string): boolean {
  const lowerField = fieldName.toLowerCase();
  return SENSITIVE_FIELDS.some((f) => lowerField.includes(f.toLowerCase()));
}
