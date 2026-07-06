import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";

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
