import { Router } from "express";
import { authenticate, requireRole } from "../middleware/auth";
import { UserRole } from "../types/roles";
import { TransactionInModel } from "../models/TransactionIn";
import { TransactionOutModel } from "../models/TransactionOut";
import { OrderModel } from "../models/Order";

const router = Router();

// Create transaction in (external sales)
router.post("/in", authenticate, requireRole(UserRole.Admin, UserRole.Employee), async (req, res) => {
	const body = req.body || {};
	if (!Array.isArray(body.items) || body.items.length === 0) return res.status(400).json({ message: "items required" });
	const totalBeforeFee = body.items.reduce((s: number, it: any) => s + (it.subtotal || 0), 0);
	const adminFee = Number(body.adminFee || 0);
	const totalAfterFee = Math.max(0, totalBeforeFee - adminFee);
	const created = await TransactionInModel.create({ ...body, totalBeforeFee, totalAfterFee });
	return res.status(201).json({ transaction: created });
});

router.get("/in", authenticate, requireRole(UserRole.Admin, UserRole.Employee), async (_req, res) => {
	const list = await TransactionInModel.find().sort({ createdAt: -1 }).lean();
	return res.json({ transactions: list });
});

// Create transaction out (expenses)
router.post("/out", authenticate, requireRole(UserRole.Admin, UserRole.Employee), async (req, res) => {
	const { type, description, amount } = req.body || {};
	if (!type || amount === undefined) return res.status(400).json({ message: "type and amount required" });
	const created = await TransactionOutModel.create({ type, description, amount });
	return res.status(201).json({ transaction: created });
});

router.get("/out", authenticate, requireRole(UserRole.Admin, UserRole.Employee), async (_req, res) => {
	const list = await TransactionOutModel.find().sort({ createdAt: -1 }).lean();
	return res.json({ transactions: list });
});

// Reports
router.get("/reports/monthly-sales", authenticate, requireRole(UserRole.Admin, UserRole.Employee), async (req, res) => {
	const { month } = req.query as any; // YYYY-MM
	if (!month) return res.status(400).json({ message: "month=YYYY-MM required" });
	const [y, m] = String(month).split("-").map((x) => Number(x));
	const start = new Date(Date.UTC(y, m - 1, 1));
	const end = new Date(Date.UTC(y, m, 1));
	const orders = await OrderModel.find({ createdAt: { $gte: start, $lt: end }, paymentStatus: "paid" }).lean();
	const totalOrders = orders.reduce((s, o) => s + (o.totalProducts || 0), 0);
	return res.json({ month, totalOrders, count: orders.length });
});

router.get("/reports/profit-loss", authenticate, requireRole(UserRole.Admin, UserRole.Employee), async (req, res) => {
	const { month } = req.query as any; // YYYY-MM
	if (!month) return res.status(400).json({ message: "month=YYYY-MM required" });
	const [y, m] = String(month).split("-").map((x) => Number(x));
	const start = new Date(Date.UTC(y, m - 1, 1));
	const end = new Date(Date.UTC(y, m, 1));
	const orders = await OrderModel.find({ createdAt: { $gte: start, $lt: end }, paymentStatus: "paid" }).lean();
	const revenue = orders.reduce((s, o) => s + (o.totalProducts || 0), 0);
	const expensesOut = await TransactionOutModel.aggregate([
		{ $match: { createdAt: { $gte: start, $lt: end } } },
		{ $group: { _id: null, total: { $sum: "$amount" } } },
	]);
	const expenseSum = expensesOut[0]?.total || 0;
	// Note: For accuracy, you may subtract COGS if tracked per item; here we keep it simple.
	const profit = revenue - expenseSum;
	return res.json({ month, revenue, expenses: expenseSum, profit });
});

export default router;
