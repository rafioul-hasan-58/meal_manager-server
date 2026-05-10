import status from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { MealService } from "./meal.service";

// ── addSingleMeal ─────────────────────────────────────────────────────────────
export const addSingleMeal = catchAsync(async (req: Request, res: Response) => {
    const { matchId, addedById } = req.user;
    const result = await MealService.addSingleMeal(matchId, addedById, req.body);
    sendResponse(res, {
        success: true,
        statusCode: status.CREATED,
        message: "Meal entry added successfully!",
        data: result,
    });
});

// ── addMultipleMeals ──────────────────────────────────────────────────────────
export const addMultipleMeals = catchAsync(async (req: Request, res: Response) => {
    const matchId = req.params.matchId;
    const addedById = req.user?.id as string;
    const { entries } = req.body;
    const result = await MealService.addMultipleMeals(matchId, addedById, entries);
    sendResponse(res, {
        success: true,
        statusCode: status.CREATED,
        message: `${result.created} meal ${result.created === 1 ? "entry" : "entries"} added successfully!`,
        data: result,
    });
});

// ── updateMeal ────────────────────────────────────────────────────────────────
export const updateMeal = catchAsync(async (req: Request, res: Response) => {
    const { matchId, id } = req.params;
    const result = await MealService.updateMeal(id, matchId, req.body);
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "Meal entry updated successfully!",
        data: result,
    });
});

// ── deleteMeal ────────────────────────────────────────────────────────────────
export const deleteMeal = catchAsync(async (req: Request, res: Response) => {
    const { matchId, id } = req.params;
    await MealService.deleteMeal(id, matchId);
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "Meal entry deleted successfully!",
    });
});

// ── deleteManyMeals ───────────────────────────────────────────────────────────
export const deleteManyMeals = catchAsync(async (req: Request, res: Response) => {
    const matchId = req.params.matchId;
    const { ids } = req.body;
    const result = await MealService.deleteManyMeals(ids, matchId);
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: `${result.deleted} meal ${result.deleted === 1 ? "entry" : "entries"} deleted successfully!`,
        data: result,
    });
});

// ── getAllMeals ───────────────────────────────────────────────────────────────
export const getAllMeals = catchAsync(async (req: Request, res: Response) => {
    const matchId = req.params.matchId;
    const result = await MealService.getAllMeals(matchId, req.query as any);
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "Meal entries fetched successfully!",
        data: result.data,
        meta: result.meta,
    });
});

// ── getSingleMeal ─────────────────────────────────────────────────────────────
export const getSingleMeal = catchAsync(async (req: Request, res: Response) => {
    const { matchId, id } = req.params;
    const result = await MealService.getSingleMeal(id, matchId);
    sendResponse(res, {
        success: true,
        statusCode: status.OK,
        message: "Meal entry fetched successfully!",
        data: result,
    });
});

export const MealController = {
    addSingleMeal,
    addMultipleMeals,
    updateMeal,
    deleteMeal,
    deleteManyMeals,
    getAllMeals,
    getSingleMeal,
};