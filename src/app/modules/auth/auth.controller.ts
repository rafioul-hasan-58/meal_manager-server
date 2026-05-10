import status from "http-status";
import { AuthService } from "./auth.service";
import catchAsync from "../../helpers/catchAsync";
import { Request, Response } from "express";
import sendResponse from "../../helpers/sendResponse";

// ── verifyOTP ────────────────────────────────────────────────────────────────
export const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const result = await AuthService.verifyOTP(email, otp);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "OTP verified successfully!",
    data: result,
  });
});


// ── socialLogin ──────────────────────────────────────────────────────────────
export const socialLogin = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.socialLogin(req.body);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Social login successful!",
    data: result,
  });
});

// ── verifyWithMail ───────────────────────────────────────────────────────────
export const verifyWithMail = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await AuthService.verifyWithMail(email);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "OTP sent successfully!",
    data: result,
  });
});

// ── login ────────────────────────────────────────────────────────────────────
export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthService.loginUser(email, password);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User logged In successfully!",
    data: result,
  });
});

// ── changePassword ───────────────────────────────────────────────────────────
export const changePassword = catchAsync(async (req: Request, res: Response) => {
  const email = req.user?.email as string;
  const { currentPassword, newPassword } = req.body;
  await AuthService.changePassword(email, currentPassword, newPassword);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "User password changed successfully!",
  });
});

// ── forgotPassword ───────────────────────────────────────────────────────────
export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await AuthService.forgotPassword(email);
  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: result.message,
    data: result,
  });
});

// ── resetPassword ────────────────────────────────────────────────────────────
export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, newPassword, confirmPassword } = req.body;
  const result = await AuthService.resetPassword(email, newPassword, confirmPassword);
  sendResponse(res, {
    statusCode: status.OK,
    message: result.message,
  });
});

// ── resendOTP ────────────────────────────────────────────────────────────────
export const resendOTP = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await AuthService.resendOtp(email);
  sendResponse(res, {
    statusCode: status.OK,
    message: result.message,
  });
});

export const verifyForgotPasswordOtp = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const result = await AuthService.verifyForgotPasswordOtp(email, otp);
  sendResponse(res, {
    statusCode: status.OK,
    message: "OTP verified successfully!",
    data: result
  });
});

// ── AuthController (re-export as named object for backward compatibility) ────
export const AuthController = {
  verifyOTP,
  socialLogin,
  verifyWithMail,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
  resendOTP,
  verifyForgotPasswordOtp
};