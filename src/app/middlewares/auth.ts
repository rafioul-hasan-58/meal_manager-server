import { NextFunction, Request, Response } from "express";
import ApiError from "../errors/ApiError";
import status from 'http-status'
import { jwtHelpers } from "../helpers/jwtHelpers";
import { JwtPayload } from "jsonwebtoken";
import config from "../../config";
const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization;
      // console.log("Authorization Header:", token);

      if (!token || !token.startsWith("Bearer ")) {
        throw new ApiError(status.UNAUTHORIZED, "You are not authorized!");
      }

      const accessToken = token.split(" ")[1];
      if (!accessToken) {
        throw new ApiError(status.UNAUTHORIZED, "Invalid token format");
      }

      const verifiedUser = jwtHelpers.verifyToken(accessToken, config.jwt.access_secret as string) as JwtPayload;

      req.user = verifiedUser;
      // console.log(req.user);

      if (roles.length && !roles.includes(verifiedUser.activeRole)) {
        throw new ApiError(
          status.FORBIDDEN,
          "Forbidden, You are not authorized!"
        );
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth