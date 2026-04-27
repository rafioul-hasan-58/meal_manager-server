import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join(process.cwd(), "public", "uploads"));
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = `${Date.now()}`;
//     const ext = path.extname(file.originalname);
//     const baseName = path.basename(file.originalname, ext);
//     cb(null, `${baseName}-${uniqueSuffix}${ext}`);
//   },
// });

const upload = multer({ storage: storage });

const audio = upload.single("audio");

// Upload single images

// const chatImage = upload.single("chatImage");

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


export const fileUploader = {
  avatar,
  chatImage,
  audio,
  profileUpdateFields,
  jobImage,
  // chatImage,
  doc,
  completeWorkDocuments

};
