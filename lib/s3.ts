import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const REGION = process.env.S3_REGION || "ap-south-1";
const BUCKET_NAME = process.env.S3_BUCKET_NAME || "celsius-heaven-assets";

export const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: false,
});

export async function uploadToS3(
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(params);
  console.log(`[S3] Uploading ${fileName} to ${BUCKET_NAME}...`);
  await s3.send(command);

  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${fileName}`;
}

export async function deleteFromS3(fileUrl: string) {
  const key = fileUrl.split('.amazonaws.com/').pop();
  if (!key) return;

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  console.log(`[S3] Deleting ${key}...`);
  await s3.send(command);
}