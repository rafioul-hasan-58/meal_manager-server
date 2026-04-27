import status from "http-status";

import { SubscriptionServices } from "./subscription.service";
import { JwtPayload } from "jsonwebtoken";
import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";

const createSubscription = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.user;
  const { planId } = req.body;

  const result = await SubscriptionServices.createSubscription(email, planId);

  sendResponse(res, {
    statusCode: status.CREATED,
    message: "Subscription Created successfully.",
    data: result,
  });
});

const getAllSubscription = catchAsync(async (req: Request, res: Response) => {
  const results = await SubscriptionServices.getAllSubscription(req.query);
  sendResponse(res, {
    success:true,
    statusCode: status.OK,
    message: "Subscriptions retrieved successfully",
    meta: results.meta,
    data: results.data,
  });
});

const getSingleSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionServices.getSingleSubscription(
    req.params.subscriptionId
  );
  sendResponse(res, {
    success:true,
    statusCode: status.OK,
    message: "Subscription retrieved successfully",
    data: result,
  });
});

const getMySubscription = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.user as JwtPayload;
  const result = await SubscriptionServices.getMySubscription(email);

  sendResponse(res, {
    success:true,
    statusCode: status.OK,
    message: "Subscription retrieved successfully.",
    data: result,
  });
});

const updateSubscription = catchAsync(async (req: Request, res: Response) => {
  const { subscriptionId } = req.params;

  const result = await SubscriptionServices.updateSubscription(
    subscriptionId,
    req.body
  );
  sendResponse(res, {
    success:true,
    statusCode: status.OK,
    message: "Subscription updated successfully.",
    data: result,
  });
});

const deleteSubscription = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionServices.deleteSubscription(
    req.params.subscriptionId
  );

  sendResponse(res, {
    success:true,
    statusCode: status.OK,
    message: "Subscription deleted successfully.",
    data: result,
  });
});
const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"];
  const result = await SubscriptionServices.HandleStripeWebhook(req.body, sig);

  res.status(status.OK).json({
    success: true,
    statusCode: status.OK,
    message: "Webhook event processed successfully",
    data: result,
  });
});
const monthlyRevenue = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionServices.monthlyRevenue();
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Monthly revenue fetched successfully!",
    data: result,
  });
});
const getSubscribedUser = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptionServices.getSubscribedUser(req.query);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "SubscribedUser fetched successfully!!",
    data: result,
  });
});

export const SubscriptionController = {
  createSubscription,
  getAllSubscription,
  getMySubscription,
  getSingleSubscription,
  updateSubscription,
  deleteSubscription,
  handleStripeWebhook,
  monthlyRevenue,
  getSubscribedUser,
};
