import { Router } from "express";
import { CartModel } from "../models/Cart";
import { authenticate, AuthRequest } from "../middleware/auth";

const router = Router();

function buildFilter(req: AuthRequest) {
	const sessionKey = String(req.headers["x-session-key"] || "");
	if (req.user) return { userId: req.user.userId } as any;
	if (sessionKey) return { sessionKey } as any;
	return { sessionKey: "anon" } as any;
}

router.get("/", async (req: AuthRequest, res) => {
	const filter = buildFilter(req);
	const cart = await CartModel.findOne(filter).lean();
	return res.json({ cart: cart || { items: [] } });
});

router.post("/add", async (req: AuthRequest, res) => {
	const { productId, variantCode, quantity } = req.body || {};
	if (!productId || !quantity) return res.status(400).json({ message: "Missing fields" });
	const filter = buildFilter(req);
	const cart = (await CartModel.findOne(filter)) || new CartModel(filter);
	const existing = cart.items.find((i) => String(i.productId) === String(productId) && i.variantCode === variantCode);
	if (existing) existing.quantity += quantity;
	else cart.items.push({ productId, variantCode, quantity });
	await cart.save();
	return res.status(201).json({ cart });
});

router.put("/item", async (req: AuthRequest, res) => {
	const { productId, variantCode, quantity } = req.body || {};
	const filter = buildFilter(req);
	const cart = await CartModel.findOne(filter);
	if (!cart) return res.status(404).json({ message: "Cart not found" });
	const row = cart.items.find((i) => String(i.productId) === String(productId) && i.variantCode === variantCode);
	if (!row) return res.status(404).json({ message: "Item not found" });
	row.quantity = quantity;
	await cart.save();
	return res.json({ cart });
});

router.delete("/item", async (req: AuthRequest, res) => {
	const { productId, variantCode } = req.body || {};
	const filter = buildFilter(req);
	const cart = await CartModel.findOne(filter);
	if (!cart) return res.status(404).json({ message: "Cart not found" });
	cart.items = cart.items.filter((i) => !(String(i.productId) === String(productId) && i.variantCode === variantCode));
	await cart.save();
	return res.json({ cart });
});

// Attach cart to account when logged in
router.post("/attach", authenticate, async (req: AuthRequest, res) => {
	const sessionKey = String(req.headers["x-session-key"] || "");
	if (!sessionKey) return res.json({});
	const guestCart = await CartModel.findOne({ sessionKey });
	if (!guestCart) return res.json({});
	let userCart = await CartModel.findOne({ userId: req.user!.userId });
	if (!userCart) userCart = new CartModel({ userId: req.user!.userId, items: [] });
	for (const item of guestCart.items) {
		const found = userCart.items.find((i) => String(i.productId) === String(item.productId) && i.variantCode === item.variantCode);
		if (found) found.quantity += item.quantity; else userCart.items.push(item);
	}
	await userCart.save();
	await guestCart.deleteOne();
	return res.json({ cart: userCart });
});

export default router;
