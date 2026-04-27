import express from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.routes";
import { DocumentRoutes } from "../modules/document/document.route";
import { NotificationsRouters } from "../modules/notifications/notification.routes";
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
    path: "/document",
    route: DocumentRoutes,
  },
  {
    path: "/notification",
    route: NotificationsRouters,
  },

];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
