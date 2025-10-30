import { Router } from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/User";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";
import { UserRole } from "../types/roles";

const router = Router();

// Admin can list users
router.get("/", authenticate, requireRole(UserRole.Admin), async (_req, res) => {
	const users = await UserModel.find({}, { passwordHash: 0 }).lean();
	return res.json({ users });
});

// Self update profile (name, phone, username, password)
router.put("/me", authenticate, async (req: AuthRequest, res) => {
	const { name, phone, username, password } = req.body || {};
	const update: any = {};
	if (name) update.name = name;
	if (phone) update.phone = phone;
	if (username) update.username = username;
	if (password) update.passwordHash = await bcrypt.hash(password, 10);
	const user = await UserModel.findByIdAndUpdate(req.user!.userId, update, { new: true });
	return res.json({ user: user ? { id: user._id, name: user.name, username: user.username, role: user.role } : null });
});

// Employee destructive actions require Admin approval (username/password in headers)
router.delete("/:id", authenticate, requireRole(UserRole.Admin, UserRole.Employee), async (req, res) => {
	if (req.user!.role === UserRole.Employee) {
		const adminUser = String(req.headers["x-admin-username"] || "");
		const adminPass = String(req.headers["x-admin-password"] || "");
		if (!adminUser || !adminPass) return res.status(403).json({ message: "Admin approval required" });
		const admin = await UserModel.findOne({ username: adminUser, role: UserRole.Admin });
		if (!admin) return res.status(403).json({ message: "Admin not found" });
		const ok = await bcrypt.compare(adminPass, admin.passwordHash);
		if (!ok) return res.status(403).json({ message: "Invalid admin credentials" });
	}
	await UserModel.findByIdAndDelete(req.params.id);
	return res.json({ success: true });
});

export default router;
