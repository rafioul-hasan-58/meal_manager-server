import { Router } from "express";
import { PlanController } from "./plan.controller";
import auth from "../../middlewares/auth";

const router = Router();

router.post(
  "/create-plan",
  auth(),
  PlanController.createPlan
); // ✅

router.get(
  "/get-all-plan",
  auth(),
  PlanController.getAllPlans
); // ✅

router.get(
  "/get-plan/:planId",
  auth(),
  PlanController.getPlanById
);// ✅

router.delete(
  "/delete-plan/:planId",
  auth(),
  PlanController.deletePlan
);// ✅

export const PlanRoutes = router;
