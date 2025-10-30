import { Router } from "express";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/User";
import { signJwt } from "../utils/jwt";
import { authenticate } from "../middleware/auth";
import { UserRole } from "../types/roles";

const router = Router();

router.post("/register", async (req, res) => {
	try {
		const { name, phone, username, password, role } = req.body || {};
		if (!name || !phone || !username || !password) {
			return res.status(400).json({ message: "Missing required fields" });
		}
		const existing = await UserModel.findOne({ username });
		if (existing) return res.status(409).json({ message: "Username already exists" });
		const passwordHash = await bcrypt.hash(password, 10);
		const user = await UserModel.create({ name, phone, username, passwordHash, role: role || UserRole.Customer, addresses: [] });
		const token = signJwt({ userId: String(user._id), role: user.role });
		return res.status(201).json({ token, user: { id: user._id, name: user.name, username: user.username, role: user.role } });
	} catch (e) {
		return res.status(500).json({ message: "Failed to register" });
	}
});

router.post("/login", async (req, res) => {
	try {
		const { username, password } = req.body || {};
		if (!username || !password) return res.status(400).json({ message: "Missing credentials" });
		const user = await UserModel.findOne({ username });
		if (!user) return res.status(401).json({ message: "Invalid credentials" });
		const ok = await bcrypt.compare(password, user.passwordHash);
		if (!ok) return res.status(401).json({ message: "Invalid credentials" });
		const token = signJwt({ userId: String(user._id), role: user.role });
		return res.status(200).json({ token, user: { id: user._id, name: user.name, username: user.username, role: user.role } });
	} catch {
		return res.status(500).json({ message: "Failed to login" });
	}
});

router.get("/me", authenticate, async (req, res) => {
	// req.user is set by middleware
	return res.status(200).json({ user: req.user });
});

export default router;
