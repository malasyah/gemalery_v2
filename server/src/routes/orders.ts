import { Router } from "express";
import { authenticate, AuthRequest, requireRole } from "../middleware/auth";
import { OrderModel } from "../models/Order";
import { UserRole } from "../types/roles";
import { trackJne } from "../services/tracking";

const router = Router();

// List orders: admin/employee see all, customer sees own
router.get("/", authenticate, async (req: AuthRequest, res) => {
	const filter: any = (req.user!.role === UserRole.Admin || req.user!.role === UserRole.Employee) ? {} : { userId: req.user!.userId };
	const orders = await OrderModel.find(filter).sort({ createdAt: -1 }).lean();
	return res.json({ orders });
});

// Mark processing
router.post("/:id/process", authenticate, requireRole(UserRole.Admin, UserRole.Employee), async (req, res) => {
	const order = await OrderModel.findByIdAndUpdate(req.params.id, { status: "processing" }, { new: true });
	return res.json({ order });
});

// Ship order: set tracking number and status shipped
router.post("/:id/ship", authenticate, requireRole(UserRole.Admin, UserRole.Employee), async (req, res) => {
	const { trackingNumber } = req.body || {};
	if (!trackingNumber) return res.status(400).json({ message: "trackingNumber required" });
	const order = await OrderModel.findByIdAndUpdate(req.params.id, { status: "shipped", trackingNumber }, { new: true });
	return res.json({ order });
});

// Mark delivered
router.post("/:id/deliver", authenticate, requireRole(UserRole.Admin, UserRole.Employee), async (req, res) => {
	const order = await OrderModel.findByIdAndUpdate(req.params.id, { status: "delivered" }, { new: true });
	return res.json({ order });
});

// Cancel order
router.post("/:id/cancel", authenticate, requireRole(UserRole.Admin, UserRole.Employee), async (req, res) => {
	const order = await OrderModel.findByIdAndUpdate(req.params.id, { status: "cancelled" }, { new: true });
	return res.json({ order });
});

// Tracking by order code (public to the customer who owns or admins)
router.get("/:orderCode/tracking", authenticate, async (req: AuthRequest, res) => {
	const order = await OrderModel.findOne({ orderCode: req.params.orderCode }).lean();
	if (!order) return res.status(404).json({ message: "Not found" });
	if (!(req.user!.role === UserRole.Admin || req.user!.role === UserRole.Employee || String(order.userId) === req.user!.userId)) {
		return res.status(403).json({ message: "Forbidden" });
	}
	if (!order.trackingNumber) return res.status(400).json({ message: "No tracking number" });
	const tracking = await trackJne(order.trackingNumber);
	return res.json({ tracking });
});

export default router;
