import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";

declare global {
	namespace Express {
		interface Request {
			user?: { userId: string; role: string };
		}
	}
}

export interface AuthRequest extends Request {
	user?: { userId: string; role: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
	const auth = req.headers.authorization || "";
	const token = auth.startsWith("Bearer ") ? auth.slice(7) : undefined;
	if (!token) return res.status(401).json({ message: "Unauthorized" });
	const payload = verifyJwt(token);
	if (!payload) return res.status(401).json({ message: "Invalid token" });
	req.user = { userId: payload.userId, role: payload.role };
	next();
}

export function requireRole(...roles: string[]) {
	return (req: AuthRequest, res: Response, next: NextFunction) => {
		if (!req.user) return res.status(401).json({ message: "Unauthorized" });
		if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden" });
		next();
	};
}
