import { ListBucketsCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./S3Client";
import config from "../../config";



export const deleteFromS3ByUrl = async (fileUrl: string): Promise<void> => {
  const bucketName = config.S3.bucketName


  if (!bucketName) {
    throw new Error("S3 bucket name is not defined in the configuration.");
  }

  // Extract the key from the URL
  try {
    const url = new URL(fileUrl);
    const key = url.pathname.slice(1); // Remove the leading "/"
    // console.log("Extracted Key:", key);

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error: any) {
    throw new Error(`Failed to delete file from S3: ${fileUrl}`);
  }
};

export const deleteFromS3ByUrl2 = async (
  fileUrl: string
): Promise<any> => {
  try {
    const key = fileUrl.split(`/${config.S3.bucketName}/`)[1];
    if (!key) throw new Error("Invalid file URL");

    const command = new DeleteObjectCommand({
      Bucket: config.S3.bucketName,
      Key: key,
    });

    const result = await s3Client.send(command);
    return result;
  } catch (error) {
    console.error("Failed to delete file from DigitalOcean:", error);
    throw error;
  }
};
