import status from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { MatchService } from "./match.service";

// ── addMember ─────────────────────────────────────────────────────────────────
export const addMember = catchAsync(async (req: Request, res: Response) => {
    const { matchId } = req.user;
    const result = await MatchService.addMember(matchId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: status.CREATED,
        message: "Member added successfully!",
        data: result,
    });
});

// ── addMultipleMembers ────────────────────────────────────────────────────────
export const addMultipleMembers = catchAsync(async (req: Request, res: Response) => {
    const matchId = req.params.matchId;
    const { members } = req.body;
    const result = await MatchService.addMultipleMembers(matchId, members);
    sendResponse(res, {
        success: true,
        statusCode: status.CREATED,
        message: `${result.created} ${result.created === 1 ? "member" : "members"} added successfully!`,
        data: result,
    });
});

// ── removeMember ──────────────────────────────────────────────────────────────
export const removeMember = catchAsync(async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { matchId } = req.user;
    const result = await MatchService.removeMember(matchId, userId);
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "Member removed successfully!",
        data: result,
    });
});

// ── removeManyMembers ─────────────────────────────────────────────────────────
export const removeManyMembers = catchAsync(async (req: Request, res: Response) => {
    const matchId = req.params.matchId;
    const { userIds } = req.body;
    const result = await MatchService.removeManyMembers(matchId, userIds);
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: `${result.removed} ${result.removed === 1 ? "member" : "members"} removed successfully!`,
        data: result,
    });
});

// ── updateMemberRole ──────────────────────────────────────────────────────────
export const updateMemberRole = catchAsync(async (req: Request, res: Response) => {
    const { matchId, userId } = req.params;
    const { matchRole } = req.body;
    const result = await MatchService.updateMemberRole(matchId, userId, matchRole);
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "Member role updated successfully!",
        data: result,
    });
});

// ── updateMemberStatus ────────────────────────────────────────────────────────
export const updateMemberStatus = catchAsync(async (req: Request, res: Response) => {
    const { matchId, userId } = req.params;
    const { status: memberStatus } = req.body;
    const result = await MatchService.updateMemberStatus(matchId, userId, memberStatus);
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "Member status updated successfully!",
        data: result,
    });
});

// ── getAllMembers ──────────────────────────────────────────────────────────────
export const getAllMembers = catchAsync(async (req: Request, res: Response) => {
    const matchId = req.params.matchId;
    const query = {
        ...req.query,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    } as any;
    const result = await MatchService.getAllMembers(matchId, query);
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "Members fetched successfully!",
        data: result.data,
        meta: result.meta,
    });
});

// ── getSingleMember ───────────────────────────────────────────────────────────
export const getSingleMember = catchAsync(async (req: Request, res: Response) => {
    const { matchId, userId } = req.params;
    const result = await MatchService.getSingleMember(matchId, userId);
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "Member fetched successfully!",
        data: result,
    });
});

export const MatchController = {
    addMember,
    addMultipleMembers,
    removeMember,
    removeManyMembers,
    updateMemberRole,
    updateMemberStatus,
    getAllMembers,
    getSingleMember,
};