import ApiError from "../../errors/ApiError";
import status from "http-status";
import axios from "axios";
import config from "../../../config";
import prisma from "../../lib/prisma";
import { RiskEnum } from "@prisma/client";

export const DocumentService = {
    extractDocument: async (extractedText: string, userId: string) => {

        // // if (!file || file.mimetype !== "application/pdf") {
        // //     throw new ApiError(status.BAD_REQUEST, "A valid PDF file is required");
        // // }

        // const form = new FormData();
        // form.append("files", file.buffer, {
        //     filename: file.originalname,
        //     contentType: "application/pdf",
        // });

        // const response = await axios.post(`${config.ai_base_url}/extract`, form, {
        //     headers: {
        //         ...form.getHeaders(),
        //         Accept: "application/json",
        //     },
        // });
        // const extractedText = response?.data?.data?.successful_files?.[0]?.text;

        // if (!extractedText) {
        //     throw new Error("No extracted text found");
        // }
        const result = await prisma.document.create({
            data: {
                extractedText,
                userId
            },
            select: {
                id: true
            }
        });
        return result
    },

    analyzeDocument: async (docId: string, userId: string) => {
        const document = await prisma.document.findUnique({
            where: { id: docId },
            select: {
                extractedText: true,
                userId: true,
            },
        });

        if (!document) {
            throw new ApiError(status.NOT_FOUND, "Document not found");
        }

        if (document.userId !== userId) {
            throw new ApiError(status.FORBIDDEN, "You do not have access to this document");
        }

        const headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        };

        const payload1 = { contract_text: document.extractedText };
        const payload2 = { text: document.extractedText };

        const [analyzeRes, summarizeRes] = await Promise.all([
            axios.post(`${config.ai_base_url}/api/v1/analyze`, payload1, { headers }),
            axios.post(`${config.ai_base_url}/api/v1/summarize`, payload2, { headers }),
        ]);

        const analysis = analyzeRes.data;
        const summary = summarizeRes.data;

        // --- Calculate riskLevel ---
        const redFlags = analysis.red_flags || [];
        let highCount = 0, mediumCount = 0, lowCount = 0;

        redFlags.forEach((flag: any) => {
            if (flag.severity === "High") highCount++;
            else if (flag.severity === "Medium") mediumCount++;
            else if (flag.severity === "Low") lowCount++;
        });

        let riskLevel: RiskEnum = "LOW";
        // Compare counts to decide
        if (highCount >= mediumCount && highCount >= lowCount) {
            riskLevel = "HIGH";
        } else if (mediumCount >= highCount && mediumCount >= lowCount) {
            riskLevel = "MEDIUM";
        } else {
            riskLevel = "LOW";
        }

        // --- Calculate renewal days ---
        const upcomingRenewal = new Date(analysis.overall_section.Upcoming_Renewal);
        const now = new Date();
        const diffTime = upcomingRenewal.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)).toString();
        const result = await prisma.document.update({
            where: { id: docId },
            data: {
                data: analysis,
                documentType: analysis.document_type,
                summery: summary.summary,
                expiryDate: new Date(analysis.overall_section.contract_end),
                riskLevel,
                renewalRemaining: diffDays
            },
        });

        return result
    },

    getMyDocuments: async (userId: string) => {
        const documents = await prisma.document.findMany({
            where: {
                userId
            },
            select: {
                id: true,
                documentType: true,
                riskLevel: true,
                renewalRemaining: true,
                createdAt: true,
            }
        });

        return documents
    },

    DocumentDetails: async (documentId: string) => {
        const result = await prisma.document.findUnique({
            where: {
                id: documentId
            },
        });

        return result
    }

}