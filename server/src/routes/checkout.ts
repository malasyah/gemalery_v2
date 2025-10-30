import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import { CartModel } from "../models/Cart";
import { ProductModel } from "../models/Product";
import { OrderModel } from "../models/Order";
import { getJneRates } from "../services/shipping";
import { createPayment } from "../services/payments/midtrans";

const router = Router();

// Shipping quote (JNE via RajaOngkir). For demo, expects city ids.
router.post("/shipping/quote", async (req, res) => {
	const { originCityId, destinationCityId, weightGrams } = req.body || {};
	if (!originCityId || !destinationCityId || !weightGrams) return res.status(400).json({ message: "Missing fields" });
	const rates = await getJneRates({ originCityId, destinationCityId, weightGrams });
	return res.json({ rates });
});

// Create order and start payment
router.post("/create", authenticate, async (req: AuthRequest, res) => {
	const { shippingAddress, shippingService, shippingCost, paymentMethod } = req.body || {};
	const cart = await CartModel.findOne({ userId: req.user!.userId }).lean();
	if (!cart || cart.items.length === 0) return res.status(400).json({ message: "Cart is empty" });
	// build items snapshot
	const products = await ProductModel.find({ _id: { $in: cart.items.map((i) => i.productId) } }).lean();
	const items = cart.items.map((ci) => {
		const p = products.find((pp) => String(pp._id) === String(ci.productId))!;
		const variant = (p.variants || []).find((v) => v.code === ci.variantCode);
		const unitPrice = (variant?.salePrice ?? p.salePrice ?? 0);
		return {
			productId: ci.productId,
			productName: p.name,
			variantCode: variant?.code,
			variantName: variant?.name,
			quantity: ci.quantity,
			unitPrice,
			subtotal: unitPrice * ci.quantity,
		};
	});
	const totalProducts = items.reduce((s, i) => s + i.subtotal, 0);
	const totalPayable = totalProducts + (shippingCost || 0);
	const orderCode = `ORD-${Date.now()}`;
	const order = await OrderModel.create({
		orderCode,
		userId: req.user!.userId as any,
		items,
		shippingAddress,
		shippingCourier: "JNE",
		shippingService,
		shippingCost,
		paymentMethod,
		paymentStatus: "pending",
		totalProducts,
		totalPayable,
		status: "new",
	});
	// clear cart
	await CartModel.deleteOne({ userId: req.user!.userId });
	// create payment
	const pay = await createPayment({ orderId: order.orderCode, grossAmount: Math.round(order.totalPayable), method: paymentMethod });
	return res.status(201).json({ order, payment: pay });
});

// Midtrans notification webhook (set this URL in Midtrans dashboard)
router.post("/payment/notify", async (req, res) => {
	// For demo, accept any notification and mark paid if status_code == '200'
	const body = req.body || {};
	const orderId = body?.order_id || body?.orderId;
	const statusCode = String(body?.status_code || "");
	if (!orderId) return res.status(400).json({});
	if (statusCode === "200") {
		await OrderModel.findOneAndUpdate({ orderCode: orderId }, { paymentStatus: "paid" });
	}
	return res.json({});
});

export default router;
