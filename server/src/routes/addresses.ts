import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { UserModel } from "../models/User";

const router = Router();

router.get("/", authenticate, async (req: AuthRequest, res) => {
	const user = await UserModel.findById(req.user!.userId).lean();
	return res.json({ addresses: user?.addresses || [] });
});

router.post("/", authenticate, async (req: AuthRequest, res) => {
	const addr = req.body;
	const user = await UserModel.findByIdAndUpdate(
		req.user!.userId,
		{ $push: { addresses: addr } },
		{ new: true }
	);
	return res.status(201).json({ addresses: user?.addresses || [] });
});

router.put("/:index", authenticate, async (req: AuthRequest, res) => {
	const idx = Number(req.params.index);
	const user = await UserModel.findById(req.user!.userId);
	if (!user) return res.status(404).json({ message: "User not found" });
	if (idx < 0 || idx >= user.addresses.length) return res.status(400).json({ message: "Invalid index" });
	user.addresses[idx] = req.body;
	await user.save();
	return res.json({ addresses: user.addresses });
});

router.delete("/:index", authenticate, async (req: AuthRequest, res) => {
	const idx = Number(req.params.index);
	const user = await UserModel.findById(req.user!.userId);
	if (!user) return res.status(404).json({ message: "User not found" });
	if (idx < 0 || idx >= user.addresses.length) return res.status(400).json({ message: "Invalid index" });
	user.addresses.splice(idx, 1);
	await user.save();
	return res.json({ addresses: user.addresses });
});

export default router;
