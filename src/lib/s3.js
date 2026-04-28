import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
  },
  forcePathStyle: true, // Required for MinIO
});

const BUCKET = process.env.S3_BUCKET || "studyhub-receipts";

/**
 * Upload a file to S3/MinIO
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {string} key - The S3 object key (path)
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<string>} The object key
 */
export async function uploadFile(fileBuffer, key, contentType) {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  });

  await s3Client.send(command);
  return key;
}

/**
 * Generate a pre-signed URL for viewing a file
 * @param {string} key - The S3 object key
 * @param {number} expiresIn - URL expiration in seconds (default: 1 hour)
 * @returns {Promise<string>} Pre-signed URL
 */
export async function getPresignedUrl(key, expiresIn = 3600) {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a file from S3/MinIO
 * @param {string} key - The S3 object key
 */
export async function deleteFile(key) {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Generate a unique key for a receipt upload
 * @param {string} userId - The user's ID
 * @param {string} originalFilename - The original file name
 * @returns {string} A unique S3 key
 */
export function generateReceiptKey(userId, originalFilename) {
  const timestamp = Date.now();
  const ext = originalFilename.split(".").pop();
  return `receipts/${userId}/${timestamp}.${ext}`;
}

export { s3Client, BUCKET };
