import {
  DeleteObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

import { getServerEnv } from "@/lib/env";

let r2Client: S3Client | undefined;

export function getR2Client() {
  if (r2Client) {
    return r2Client;
  }

  const env = getServerEnv();

  r2Client = new S3Client({
    region: "auto",
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });

  return r2Client;
}

export async function checkR2Bucket() {
  const env = getServerEnv();

  await getR2Client().send(
    new HeadBucketCommand({
      Bucket: env.R2_BUCKET_NAME,
    }),
  );
}

function getPublicBaseUrl() {
  const publicUrl = getServerEnv().R2_PUBLIC_URL?.replace(/\/$/, "");

  if (!publicUrl) {
    throw new Error("R2_PUBLIC_URL is required for uploaded public images.");
  }

  return publicUrl;
}

export function getR2PublicUrl(key: string) {
  return `${getPublicBaseUrl()}/${key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/")}`;
}

export async function uploadR2Object(input: {
  key: string;
  body: Buffer;
  contentType: string;
}) {
  const env = getServerEnv();

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
    }),
  );

  return getR2PublicUrl(input.key);
}

export async function deleteR2Object(key?: string | null) {
  if (!key) {
    return;
  }

  const env = getServerEnv();

  await getR2Client().send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    }),
  );
}
