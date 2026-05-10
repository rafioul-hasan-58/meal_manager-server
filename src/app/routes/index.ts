import express from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.routes";
import { MealRoutes } from "../modules/meal/meal.routes";
import { MatchRoutes } from "../modules/match/match.routes";
const router = express.Router();

const moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/meal",
    route: MealRoutes,
  },
  {
    path: "/match",
    route: MatchRoutes,
  },

];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
