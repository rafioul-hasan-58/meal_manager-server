import multer from "multer";
import path from "path";
import fs from "fs";

import httpStatus from "http-status";
import ApiError from "../errors/ApiError";

// Ensure the 'uploads' folder exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Allowed file types
const allowedMimeTypes = ["image/jpeg", "image/png", "application/pdf", "image/jpg"];

// ✅ Filter to reject unsupported mimetypes
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, "wrong mimetype")
  }
};

// ✅ Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files in 'uploads' folder
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    cb(null, `${baseName}-${Date.now()}${ext}`);
  },
});

// ✅ Create multer instance with fileFilter
const upload = multer({ storage, fileFilter });

// ✅ Define field-based uploads


const completeWorkDocuments = upload.fields([
  { name: "signature", maxCount: 1 },
  { name: "beforePhoto", maxCount: 10 },
  { name: "afterPhoto", maxCount: 10 },

]);
// ✅ Upload single files
const avatar = upload.single("avatar");
const chatImage = upload.single("chatImage");
const doc = upload.single("doc");
const jobImage = upload.single("jobImage")

const profileUpdateFields = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "doc", maxCount: 1 },
]);


export const localFileUploader = {
  avatar,
  chatImage,
  doc,
  completeWorkDocuments,
  jobImage,
  profileUpdateFields
};
