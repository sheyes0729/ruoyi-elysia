import { mkdir, writeFile, rm } from "fs/promises";
import { existsSync } from "fs";
import { join, extname } from "path";
import { randomUUID } from "crypto";

export type UploadResult = {
  url: string;
  fileName: string;
  originalName: string;
  size: number;
  mimeType: string;
};

export type FileConfig = {
  uploadDir: string;
  maxSize: number;
  allowedTypes: string[];
  baseUrl: string;
};

const DEFAULT_CONFIG: FileConfig = {
  uploadDir: process.env.UPLOAD_DIR ?? "./uploads",
  maxSize: Number(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024,
  allowedTypes: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ],
  baseUrl: process.env.UPLOAD_BASE_URL ?? "/uploads",
};

export class FileService {
  private config: FileConfig;

  constructor(config: Partial<FileConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async ensureUploadDir(): Promise<void> {
    if (!existsSync(this.config.uploadDir)) {
      await mkdir(this.config.uploadDir, { recursive: true });
    }
  }

  validateFile(file: { size: number; type: string }): {
    valid: boolean;
    error?: string;
  } {
    if (file.size > this.config.maxSize) {
      return {
        valid: false,
        error: `文件大小超过限制，最大 ${this.config.maxSize / 1024 / 1024}MB`,
      };
    }

    if (!this.config.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `不支持的文件类型，仅支持: ${this.config.allowedTypes.join(", ")}`,
      };
    }

    return { valid: true };
  }

  async upload(file: {
    name: string;
    type: string;
    size: number;
    arrayBuffer: () => Promise<ArrayBuffer>;
  }): Promise<UploadResult> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    await this.ensureUploadDir();

    const ext = extname(file.name);
    const uniqueName = `${randomUUID()}${ext}`;
    const filePath = join(this.config.uploadDir, uniqueName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return {
      url: `${this.config.baseUrl}/${uniqueName}`,
      fileName: uniqueName,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
    };
  }

  async delete(fileName: string): Promise<boolean> {
    const filePath = join(this.config.uploadDir, fileName);
    try {
      await rm(filePath);
      return true;
    } catch {
      return false;
    }
  }

  getConfig(): FileConfig {
    return { ...this.config };
  }
}

export const fileService = new FileService();
