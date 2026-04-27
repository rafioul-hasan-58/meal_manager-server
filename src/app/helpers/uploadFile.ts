import multer from "multer";
import multerS3 from "multer-s3";
import config from "../../config";
import { s3Client } from "./s3";

const s3Storage = multerS3({
    s3: s3Client,
    bucket: config.S3.bucketName || "", // Replace with your bucket name
    acl: "public-read", // Ensure files are publicly accessible
    contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically detect content type
    key: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName); // File name in Spaces
    },
});


// Upload image configurations
const upload = multer({
    storage: s3Storage,
});

export const getImageUrl = async (file: Express.MulterS3.File) => {
    let image = file?.location;
    if (!image || !image.startsWith("http")) {
        // image = `https://${config.S3.bucketName}.nyc3.digitaloceanspaces.com/${file?.key}`;
        image = `https://mycvconnect.s3.eu-north-1.amazonaws.com/${file?.key}`;
    }
    return image;
};

const uploadProfileImage = upload.single("profileImage");
const uploadFaceImage = upload.single("faceImage");
const loginImage = upload.single("loginImage");


export const uploadFile = {
    uploadProfileImage,
    uploadFaceImage,
    loginImage
}