import { z } from "zod";

const socialLoginValidationSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	fullName: z.string().nonempty({ message: "Name is Required" }),
	profileImage: z.string().optional()
});


const loginValidationSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters long" }),
});

const changePasswordValidationSchema = z.object({
	currentPassword: z
		.string({ required_error: "Current password is required" })
		.min(6, {
			message: "Current password must be at least 6 characters long",
		}),
	newPassword: z
		.string({ required_error: "New password is required" })
		.min(6, { message: "New password must be at least 6 characters long" }),
});

const resetPasswordValidationSchema = z.object({
	newPassword: z.string().min(6, "Password must be at least 6 characters"),
	confirmPassword: z.string(),
})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Passwords do not match!",
		path: ["confirmPassword"],
	})

const forgotPasswordValidationSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
});

const resendOtpValidationSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
});

const faceTokenValidationSchema = z.object({
	faceToken: z.string().nonempty("Face Token Is Required!")
})
export const AuthValidation = {
	faceTokenValidationSchema,
	loginValidationSchema,
	socialLoginValidationSchema,
	resendOtpValidationSchema,
	resetPasswordValidationSchema,
	changePasswordValidationSchema,
	forgotPasswordValidationSchema,
};
