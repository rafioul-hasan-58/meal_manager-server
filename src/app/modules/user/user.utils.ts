import bcrypt from "bcrypt";
import axios from "axios";
import FormData from "form-data";
import fetch from "node-fetch";
import config from "../../../config";

export const validateSelfie = async (imageUrl: string) => {
	const formData = new FormData();

	const response = await fetch(imageUrl);
	const buffer = Buffer.from(await response.arrayBuffer());

	formData.append("image", buffer, {
		filename: "selfie.jpeg",
		contentType: "image/jpeg",
	});

	const result = await axios.post(
		`${config.ai_base_url}/api/validate-selfie`,
		formData,
		{
			headers: formData.getHeaders(),
			timeout: 30000,
		}
	);
	return result.data;

};


export const hashPassword = async (password: string): Promise<string> => {
	return await bcrypt.hash(password, 12);
};