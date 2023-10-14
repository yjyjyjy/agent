import { S3Client } from "@aws-sdk/client-s3";
import { SQSClient } from "@aws-sdk/client-sqs";
const REGION = "us-east-1"; //e.g. "us-east-1"
export const s3Client = new S3Client({ region: REGION });
export const sqsClient = new SQSClient({ region: REGION });