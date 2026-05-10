import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { MealController } from "./meal.controller";
import { MealValidation } from "./meal.validation";

const router = Router({ mergeParams: true }); // mergeParams to access :matchId from parent


router.post(
  "/add-single",
  auth(),
  validateRequest(MealValidation.addSingleMealSchema),
  MealController.addSingleMeal
);

// POST /match/:matchId/meals/bulk
router.post(
  "/bulk",
  auth(),
  validateRequest(MealValidation.addMultipleMealsSchema),
  MealController.addMultipleMeals
);

// ── Read ──────────────────────────────────────────────────────────────────────

// GET /match/:matchId/meals
router.get(
  "/",
  auth(),
  validateRequest(MealValidation.getMealsQuerySchema),
  MealController.getAllMeals
);

// GET /match/:matchId/meals/:id
router.get("/:id", auth(), MealController.getSingleMeal);

// ── Update ────────────────────────────────────────────────────────────────────

// PATCH /match/:matchId/meals/:id
router.patch(
  "/:id",
  auth(),
  validateRequest(MealValidation.updateMealSchema),
  MealController.updateMeal
);

// ── Delete ────────────────────────────────────────────────────────────────────

// DELETE /match/:matchId/meals/:id
router.delete("/:id", auth(), MealController.deleteMeal);

// DELETE /match/:matchId/meals  (body: { ids: [...] })
router.delete(
  "/",
  auth(),
  validateRequest(MealValidation.deleteManyMealsSchema),
  MealController.deleteManyMeals
);

export const MealRoutes = router;