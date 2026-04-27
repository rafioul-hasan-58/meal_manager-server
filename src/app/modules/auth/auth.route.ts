import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";
import { uploadFile } from "../../helpers/uploadFile";

const router = Router();

router.post("/verify-otp", AuthController.verifyOTP);
router.post("/verify-otp-login", AuthController.verifyOTP);
router.post("/verify-with-mail", auth(), AuthController.verifyWithMail);

router.post(
  "/verify-with-face",
  auth(),
  uploadFile.loginImage,
  AuthController.verifyWithFace
);

router.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.login
);
router.post(
  "/social-login",
  validateRequest(AuthValidation.socialLoginValidationSchema),
  AuthController.socialLogin
);

router.patch(
  "/change-password",
  auth(),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthController.changePassword
);

router.post(
  "/forgot-password",
  validateRequest(AuthValidation.forgotPasswordValidationSchema),
  AuthController.forgotPassword
);

router.post("/reset-password", AuthController.resetPassword);

router.post(
  "/resend-otp",
  validateRequest(AuthValidation.resendOtpValidationSchema),
  AuthController.resendOTP
);

export const AuthRoutes = router;
