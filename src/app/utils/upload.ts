import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "/uploads/"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname) || ".png";
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});
// Memory-based storage (for sending as Buffer)
const memoryStorage = multer.memoryStorage();

export const uploadPDFBuffer = multer({
  storage: memoryStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});
// Image upload with memory storage
export const uploadImageBuffer = multer({
  storage: memoryStorage,
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export const upload = multer({
  storage: storage,
});

