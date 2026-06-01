import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import "multer"

const s3 = new S3Client({ region: "us-east-1" });
const BUCKET = "ethos-avatars";

export async function uploadAvatar(file: Express.Multer.File, userId: string): Promise<string> {
  const mimeToExt: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
}
  const ext = mimeToExt[file.mimetype] ?? "jpg";
  const key = `avatars/${userId}/${randomUUID()}.${ext}`;

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  }));

  return `https://${BUCKET}.s3.us-east-1.amazonaws.com/${key}`;
}