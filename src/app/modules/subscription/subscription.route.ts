import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { SubscriptionController } from "./subscription.controller";
import { SubscriptionValidation } from "./subscription.validation";
import express from "express";

const router = Router();

router.post(
  "/create-subscription",
  auth(),
  validateRequest(SubscriptionValidation.SubscriptionValidationSchema),
  SubscriptionController.createSubscription
); // ✅

router.get(
  "/my-subscription",
  auth(),
  SubscriptionController.getMySubscription
); // ✅

router.get(
  "/get-all-subscription",
  auth(),
  SubscriptionController.getAllSubscription
); // ✅

router.get(
  "/get-subscription/:subscriptionId",
  auth(),
  SubscriptionController.getSingleSubscription
); // ✅

router.put(
  "/update-subscription/:subscriptionId",
  auth(),
  SubscriptionController.updateSubscription
);

router.delete(
  "/delete-subscription/:subscriptionId",
  auth(),
  SubscriptionController.deleteSubscription
); // ✅
router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  SubscriptionController.handleStripeWebhook
);
router.get(
  "/monthly-revenue",
  auth(), // only admins can unblock
  SubscriptionController.monthlyRevenue
);
router.get(
  "/get-subscribed-user",
  auth(),
  SubscriptionController.getSubscribedUser
);
export const SubscriptionRoutes = router;
