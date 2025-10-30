import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface JwtPayload {
	userId: string;
	role: string;
}

export function signJwt(payload: JwtPayload): string {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJwt(token: string): JwtPayload | null {
	try {
		return jwt.verify(token, JWT_SECRET) as JwtPayload;
	} catch {
		return null;
	}
}
