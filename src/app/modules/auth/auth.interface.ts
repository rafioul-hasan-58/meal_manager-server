import { userRole } from "@prisma/client";

export type RefreshPayload = {
	id: string;
	fullName: string;
	email: string;
	role: userRole;
	iat: number;
	profilePic?: string;
	exp: number;
	isVerified: boolean;
};
