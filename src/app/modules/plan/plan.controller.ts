import status from "http-status";
import { PlanServices } from "./plan.service";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { Request, Response } from "express";
// // Create Plan
const createPlan = catchAsync(async (req:Request, res:Response) => {
  const result = await PlanServices.createPlan(req.body);
  sendResponse(res, {
    success:true,
    statusCode: status.CREATED,
    message: "Plan created successfully!",
    data: result,
  });
});

// // Get All Plans
const getAllPlans = catchAsync(async (req:Request, res:Response) => {
  const result = await PlanServices.getAllPlans();
  sendResponse(res, {
    success:true,
    statusCode: status.OK,
    message: "Plans fetched successfully!",
    data: result,
  });
});

// // Get Plan by ID
const getPlanById = catchAsync(async (req:Request, res:Response) => {
  const result = await PlanServices.getPlanById(req.params.planId);
  sendResponse(res, {
    success:true,
    statusCode: status.OK,
    message: "Plan fetched successfully!",
    data: result,
  });
});

// Delete Plan
const deletePlan = catchAsync(async (req:Request, res:Response) => {
  const result = await PlanServices.deletePlan(req.params.planId);
  sendResponse(res, {
    success:true,
    statusCode: status.OK,
    message: "Plan deleted successfully!",
    data: result,
  });
});

export const PlanController = {
  createPlan,
  getAllPlans,
  getPlanById,
  deletePlan,
};
