import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import status from "http-status";
import sendResponse from "../../helpers/sendResponse";
import { DocumentService } from "./document.service";

export const DocumentController = {
    extractDocument: catchAsync(async (req: Request, res: Response) => {
        const { extractedText } = req.body
        const userId = req.user?.id;
        const result = await DocumentService.extractDocument(extractedText, userId);
        sendResponse(res, {
            statusCode: status.OK,
            message: "PDF extracted saved successfully!",
            data: result
        });
    }),
    analyzeDocument: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const docId = req.params.id;
        const result = await DocumentService.analyzeDocument(docId, userId);
        sendResponse(res, {
            statusCode: status.OK,
            message: "PDF analyzed successfully!",
            data: result
        });
    }),
    myDocuments: catchAsync(async (req: Request, res: Response) => {
        const userId = req.user?.id;
        const result = await DocumentService.getMyDocuments(userId);
        sendResponse(res, {
            statusCode: status.OK,
            message: "My documents retrieved successfully!",
            data: result
        });
    }),
    DocumentDetails: catchAsync(async (req: Request, res: Response) => {
        const { id } = req.params;
        const result = await DocumentService.DocumentDetails(id);
        sendResponse(res, {
            statusCode: status.OK,
            message: "My document retrieved successfully!",
            data: result
        });
    }),
}