import { NextFunction, Request, Response } from "express";
import ApiError from "../errors/ApiError";

export const parseBodyData1 = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body.bodyData) {

    try {
      req.body = JSON.parse(req.body.bodyData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format in bodyData",
      });
    }
  }
  next();
};

export const parseBodyData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body && req.body.bodyData) {
    try {
      req.body = JSON.parse(req.body.bodyData);
    } catch (error) {
      return next(new ApiError(400, "Invalid JSON format in bodyData"));
    }
  }
  next();
};