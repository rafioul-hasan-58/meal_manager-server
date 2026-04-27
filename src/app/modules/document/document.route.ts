import { Router } from "express";
import { DocumentController } from "./document.controller";
import { uploadPDFBuffer } from "../../utils/upload";
import auth from "../../middlewares/auth";

const router = Router();

router.post(
    "/extract-document",
    auth(),
    uploadPDFBuffer.single("file"),
    DocumentController.extractDocument
);
router.post(
    "/analyze-document/:id",
    auth(),
    DocumentController.analyzeDocument
);
router.get(
    "/my-documents",
    auth(),
    DocumentController.myDocuments
);
router.get(
    "/details/:id",
    auth(),
    DocumentController.DocumentDetails
);

export const DocumentRoutes = router;