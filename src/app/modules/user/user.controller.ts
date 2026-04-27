import status from "http-status";
import { Request, Response } from "express";
import catchAsync from "../../helpers/catchAsync";
import { UserService } from "./user.service";
import sendResponse from "../../helpers/sendResponse";
import config from "../../../config";
import axios from "axios";
import ApiError from "../../errors/ApiError";
import FormData from "form-data";
import { getImageUrl } from "../../helpers/uploadFile";
import { validateSelfie } from "./user.utils";


export const UserController = {

  uploadPDFToAI: catchAsync(async (req: Request, res: Response) => {
    const file = req.file;

    if (!file || file.mimetype !== "application/pdf") {
      throw new ApiError(status.BAD_REQUEST, "A valid PDF file is required");
    }

    const form = new FormData();
    form.append("files", file.buffer, {
      filename: file.originalname,
      contentType: "application/pdf",
    });

    const aiResponse = await axios.post("http://10.0.80.19:5011/api/v1/extract", form, {
      headers: {
        ...form.getHeaders(),
        Accept: "application/json",
      },
    });

    sendResponse(res, {
      statusCode: status.OK,
      message: "PDF processed successfully!",
      data: aiResponse.data,
    });
  }),

  register: catchAsync(async (req: Request, res: Response) => {
    const result = await UserService.register(req.body);
    sendResponse(res, {
      success: true,
      statusCode: status.OK,
      message: "User registered successfully!",
      data: result,
    });
  }),

  getAllUser: catchAsync(async (req, res) => {
    const result = await UserService.getAllUserFromDB(req.query);
    sendResponse(res, {
      statusCode: status.OK,
      message: "Users are retrieved successfully!",
      meta: result.meta,
      data: result.data,
    });
  }),


  updateProfile: catchAsync(async (req, res) => {
    const { id } = req.user;
    const payload = req.body;
    if (req.file) {
      const profileImage = await getImageUrl(req.file as any);
      payload.profileImage = profileImage
    }
    const result = await UserService.updateProfile(id, payload);
    sendResponse(res, {
      statusCode: status.OK,
      message: "User updated successfully!",
      data: result,
    });
  }),

  myProfile: catchAsync(async (req, res) => {
    const { id } = req.user;
    const result = await UserService.myProfile(id);
    sendResponse(res, {
      statusCode: status.OK,
      message: "My Profile fetched successfully!",
      data: result,
    });
  }),

  updateFaceToken: catchAsync(async (req, res) => {
    const { id } = req.user;
    let faceToken = await getImageUrl(req.file as any);
    if (!faceToken) {
      throw new ApiError(status.NOT_FOUND, `Face Token Not Found!${config.environment === "Development" ? "In user controller" : ""}`)
    }

    // 1️⃣ Validate image BEFORE saving
    const validation = await validateSelfie(faceToken);

    if (!validation?.valid) {
      throw new ApiError(status.BAD_REQUEST, validation.message);
    }

    const result = await UserService.updateFaceToken(id, faceToken);
    sendResponse(res, {
      statusCode: status.OK,
      message: "Identity verified successfully!",
      data: result,
    });
  }),

  getSingleUserById: catchAsync(async (req, res) => {
    const { userId } = req.params;

    const result = await UserService.getSingleUserByIdFromDB(userId);

    sendResponse(res, {
      statusCode: status.OK,
      message: "User retrieved successfully!",
      data: result,
    });
  }),

  deleteUser: catchAsync(async (req, res) => {
    const { userId } = req.params;

    await UserService.deleteUserFromDB(userId);

    sendResponse(res, {
      statusCode: status.OK,
      message: "User deleted successfully!",
    });
  })
};
