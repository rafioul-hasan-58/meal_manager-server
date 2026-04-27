import { S3Client, S3ClientConfig, ObjectCannedACL } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import path from "path";
import ApiError from "../errors/ApiError";
// import ApiError from "../errorsss/ApiErrors";

// const DO_CONFIG = {
//   endpoint: "https://nyc3.digitaloceanspaces.com",
//   region: "nyc3",
//   credentials: {
//     accessKeyId: "DO002RGDJ947DJHJ9WDT",
//     secretAccessKey: "e5+/pko6Ojar51Hb8ojUKfq2HtXy+tnGKOfs3rIcEfo",
//   },
//   spaceName: "smtech-space",
// };
const DO_CONFIG = {
  endpoint: "https://nyc3.digitaloceanspaces.com",
  region: "nyc3",
  credentials: {
    accessKeyId: "DO00HM4RWDRFHGHB9G6V",
    secretAccessKey: "cZlo11/ULM4uueW3Pg5oWe2hzAFunL5Ap1G+kv3ieDg",
  },
  spaceName: "remans-evidencias",
};

const s3Config: S3ClientConfig = {
  endpoint: DO_CONFIG.endpoint,
  region: DO_CONFIG.region,
  credentials: DO_CONFIG.credentials,
  forcePathStyle: true,
};

const s3 = new S3Client(s3Config);

const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/bmp",
  "image/tiff",
  "image/svg+xml",
  "image/heic",

  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",

  // Audio
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/aac",

  // Video (optional)
  "video/mp4",
  "video/x-msvideo",
  "video/quicktime",
  "video/x-matroska",
  "video/webm",
];

/**
 * Uploads a file buffer to DigitalOcean Spaces and returns the file URL.
 * @param {Express.Multer.File} file - The file object from multer
 * @returns {Promise<string>} - The URL of the uploaded file
 * @throws {Error} - If file validation fails or upload fails
 */
const uploadToDigitalOcean = async (
  file: Express.Multer.File
): Promise<string> => {
  try {
    if (!file) {
      throw new ApiError(400, "No file provided");
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ApiError(
        400,
        `File size exceeds maximum limit of ${MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new ApiError(400, "File type not allowed");
    }
    const fileExtension = path.extname(file.originalname);
    const fileName = `uploads/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}${fileExtension}`;

    const uploadParams = {
      Bucket: DO_CONFIG.spaceName,
      Key: fileName,
      Body: file.buffer,
      ACL: "public-read" as ObjectCannedACL,
      ContentType: file.mimetype,
    };
    const upload = new Upload({
      client: s3,
      params: uploadParams,
    });

    const data = await upload.done();
    const fileUrl =
      data.Location ||
      `${DO_CONFIG.endpoint}/${DO_CONFIG.spaceName}/${fileName}`;

    return fileUrl;
  } catch (error) {
    throw new ApiError(
      500,
      error instanceof Error
        ? `Failed to upload file: ${error.message}`
        : "Failed to upload file to DigitalOcean Spaces"
    );
  }
};

export default uploadToDigitalOcean;
