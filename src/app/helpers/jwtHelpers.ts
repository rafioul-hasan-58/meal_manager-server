import jwt from "jsonwebtoken";
import { sign, verify, JwtPayload, Secret, SignOptions } from "jsonwebtoken";


const generateToken1 = (
  payload: Record<string, unknown>,
  secret: Secret,
  expiresIn: any
): string => {
  const token = jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn,
  });
  return token;
};

const verifyToken1 = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};

const generateToken = (
  payload: string | object | Buffer,
  secret: Secret,
  expiresIn: string | number = "30d"
): string => {
  return sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: expiresIn as SignOptions["expiresIn"],
  });
};

const verifyToken = (token: string, secret: Secret): JwtPayload => {
  return verify(token, secret) as JwtPayload;
};



export const jwtHelpers = {
  generateToken,
  verifyToken,
};
