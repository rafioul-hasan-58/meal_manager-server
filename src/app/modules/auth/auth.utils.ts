import jwt, { JwtPayload } from "jsonwebtoken";
import axios from "axios";
import FormData from "form-data";
import fetch from "node-fetch";
import config from "../../../config";

export type IJwtPayload = {
	id?: string;
	fullName?: string;
	email: string;
	profilePic?: string | null;
	role: "USER"
};
export type ILoginJwtPayload = {
	id: string;
};

export const createToken = (
	jwtPayload: IJwtPayload,
	secret: string,
	expiresIn: string
) => {
	return jwt.sign(
		jwtPayload,
		secret as jwt.Secret,
		{
			expiresIn: expiresIn as string,
		} as jwt.SignOptions
	);
};
export const createLoginToken = (
	jwtPayload: ILoginJwtPayload,
	secret: string,
	expiresIn: string
) => {
	return jwt.sign(
		jwtPayload,
		secret as jwt.Secret,
		{
			expiresIn: expiresIn as string,
		} as jwt.SignOptions
	);
};

export const verifyToken = (token: string, secret: string): JwtPayload => {
	return jwt.verify(token, secret) as JwtPayload;
};

export const validateLoginImages = async (prevImage: string, newImage: string) => {
 // 1️⃣ Fetch the previous image (saved faceToken)
    const prevRes = await fetch(prevImage);
    const prevBuffer = Buffer.from(await prevRes.arrayBuffer());

    // 2️⃣ Fetch the new uploaded image
    const newRes = await fetch(newImage);
    const newBuffer = Buffer.from(await newRes.arrayBuffer());

    // 3️⃣ Prepare form-data
    const formData = new FormData();
    formData.append("image1", prevBuffer, {
      filename: "prev.jpeg",
      contentType: "image/jpeg",
    });

    formData.append("image2", newBuffer, {
      filename: "new.jpeg",
      contentType: "image/jpeg",
    });

    // 4️⃣ Make the API request
    const result = await axios.post(
      `${config.ai_base_url}/api/compare-faces`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 20000, // 20 seconds
      }
    );

    console.log("Face comparison result:", result.data);

    return result.data;
};