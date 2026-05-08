import { NextFunction, Request, Response, Router } from "express";
import { UserValidation } from "./user.validation";
import validateRequest from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import auth from "../../middlewares/auth";
import { parseBody } from "../../middlewares/parseBody";
import { uploadFile } from "../../helpers/uploadFile";
const router = Router();


router.get("/get-all-users", auth(), UserController.getAllUser);

router.get(
  "/get-user/:userId",
  auth(),
  UserController.getSingleUserById
);

router.post(
  "/register",
  validateRequest(UserValidation.registerSchema),
  UserController.register
);


router.get(
  "/my-profile",
  auth(),
  UserController.myProfile
); // ✅

router.patch(
  "/update-profile",
  uploadFile.uploadProfileImage,
  parseBody,
  validateRequest(UserValidation.updateUserValidationSchema),
  auth(),
  UserController.updateProfile
);

router.delete(
  "/delete-user/:userId",
  auth(),
  UserController.deleteUser
);


export const UserRoutes = router;
