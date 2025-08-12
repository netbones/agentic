import crypto from "node:crypto";
import { env } from "@/utils/env";

const IV_LENGTH = 12; // AES-GCM recommended
const AUTH_TAG_LENGTH = 16;

const key = crypto.pbkdf2Sync(
  env.EMAIL_ENCRYPT_SECRET,
  env.EMAIL_ENCRYPT_SALT,
  100000,
  32,
  "sha256",
);

export function encryptToken(text: string | null): string | null {
  if (text == null) return null;

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("hex");
}

export function decryptToken(encryptedText: string | null): string | null {
  if (encryptedText == null) return null;

  try {
    const buffer = Buffer.from(encryptedText, "hex");
    const iv = buffer.subarray(0, IV_LENGTH);
    const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}
