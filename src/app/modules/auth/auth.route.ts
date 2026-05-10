import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post(
  "/verify-otp",
  validateRequest(AuthValidation.otpValidationSchema),
  AuthController.verifyOTP
);
router.post("/verify-otp-login", AuthController.verifyOTP);
router.post(
  "/verify-email",
  validateRequest(AuthValidation.emailValidationSchema),
  AuthController.verifyWithMail
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

router.post(
  "/reset-password",
  // auth(),
  validateRequest(AuthValidation.resetPasswordValidationSchema),
  AuthController.resetPassword
);

router.post(
  "/resend-otp",
  validateRequest(AuthValidation.resendOtpValidationSchema),
  AuthController.resendOTP
);
router.post(
  "/verify-forgot-password-otp",
  validateRequest(AuthValidation.otpValidationSchema),
  AuthController.verifyForgotPasswordOtp
);

export const AuthRoutes = router;
