import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN_SECONDS = process.env.JWT_EXPIRES_IN ? Number(process.env.JWT_EXPIRES_IN) : 60 * 60 * 24 * 7; // 7 days

export interface JwtPayload {
	userId: string;
	role: string;
}

export function signJwt(payload: JwtPayload): string {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN_SECONDS });
}

export function verifyJwt(token: string): JwtPayload | null {
	try {
		return jwt.verify(token, JWT_SECRET) as JwtPayload;
	} catch {
		return null;
	}
}
