import status from "http-status";
import { AuthService } from "./auth.service";
import catchAsync from "../../helpers/catchAsync";
import { Request, Response } from "express";
import sendResponse from "../../helpers/sendResponse";
import ApiError from "../../errors/ApiError";
import { getImageUrl } from "../../helpers/uploadFile";
import { validateLoginImages } from "./auth.utils";
import prisma from "../../lib/prisma";
import jwt from 'jsonwebtoken';



export const AuthController = {

  verifyOTP: catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const result = await AuthService.verifyOTP(email, otp);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "OTP verified successfully!",
      data: result,
    });
  }),
  verifyOTPLogin: catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    const result = await AuthService.verifyOTPLogin(email, otp);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "OTP verified successfully!",
      data: result,
    });
  }),


  socialLogin: catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.socialLogin(req.body);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Social login successful!",
      data: result,
    });
  }),


  verifyWithFace: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.user;

    let loginImage = await getImageUrl(req.file as any);
    if (!loginImage) {
      throw new ApiError(status.NOT_FOUND, `Previous Image Not Found!`)
    }

    const user = await prisma.user.findUnique({
      where: {
        id
      },
      select: {
        faceToken: true
      }
    });

    const prevImage = user?.faceToken;

    if (!prevImage) {
      throw new ApiError(status.NOT_FOUND, "Previous Image not found!")
    }

    const validation = await validateLoginImages(prevImage, loginImage)

    if (!validation.match) {
      throw new ApiError(status.NOT_FOUND, "Face does not match!")
    }

    const result = await AuthService.verifyWithFace(id);

    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "Face verified successfully!",
      data: result,
    });
  }),


  verifyWithMail: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.user;
    const result = await AuthService.verifyWithMail(id);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "OTP sent successfully!",
      data: result,
    });
  }),

  login: catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await AuthService.loginUser(email, password);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "User logged In successfully!",
      data: result,

    });
  }),
  changePassword: catchAsync(async (req, res) => {
    const email = req.user?.email as string;
    const { currentPassword, newPassword } = req.body;
    await AuthService.changePassword(email, currentPassword, newPassword);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "User password changed successfully!",
    });
  }),

  forgotPassword: catchAsync(async (req, res) => {
    const { email } = req.body;
    const result = await AuthService.forgotPassword(email);

    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: result.message,
      data: result,
    });
  }),
  resetPassword: catchAsync(async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    const result = await AuthService.resetPassword(
      email,
      newPassword,
      confirmPassword
    );

    sendResponse(res, {
      statusCode: status.OK,
      message: result.message,
    });
  }),

  resendOTP: catchAsync(async (req, res) => {
    const { email } = req.body;

    const result = await AuthService.resendOtp(email);

    sendResponse(res, {
      statusCode: status.OK,
      message: result.message,
    });
  }),

  

};
