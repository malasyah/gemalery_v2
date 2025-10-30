import { Router } from "express";
import { ProductModel } from "../models/Product";
import { CategoryCostModel } from "../models/CategoryCost";
import { calculateCostOfGoods } from "../utils/hpp";
import { authenticate, requireRole, AuthRequest } from "../middleware/auth";
import { UserRole } from "../types/roles";
import { ProductCreateSchema, ProductUpdateSchema } from "../validation/product";
import bcrypt from "bcryptjs";
import { UserModel } from "../models/User";

const router = Router();

// Public list/search products
router.get("/", async (req, res) => {
	const { search, category } = req.query as any;
	const filter: any = {};
	if (search) filter.name = { $regex: String(search), $options: "i" };
	if (category) filter.category = String(category);
	const products = await ProductModel.find(filter).lean();
	return res.json({ products });
});

// Public get product detail
router.get("/:id", async (req, res) => {
	const product = await ProductModel.findById(req.params.id).lean();
	if (!product) return res.status(404).json({ message: "Not found" });
	return res.json({ product });
});

async function withCategoryCosts(categoryName: string | undefined) {
	if (!categoryName) return undefined;
	const cat = await CategoryCostModel.findOne({ name: categoryName }).lean();
	return cat || undefined;
}

function requireAdminApprovalWhenEmployee(role: string) {
	return role === UserRole.Employee;
}

async function verifyAdminApprovalIfNeeded(req: AuthRequest) {
	const adminUser = String(req.headers["x-admin-username"] || "");
	const adminPass = String(req.headers["x-admin-password"] || "");
	if (!adminUser || !adminPass) return false;
	const admin = await UserModel.findOne({ username: adminUser, role: UserRole.Admin });
	if (!admin) return false;
	return await bcrypt.compare(adminPass, admin.passwordHash);
}

// Create product (Admin or Employee). Employee allowed to add without approval per requirement.
router.post("/", authenticate, requireRole(UserRole.Admin, UserRole.Employee), async (req, res) => {
	const parsed = ProductCreateSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
	const input = parsed.data;
	const catCost = await withCategoryCosts(input.category);

	// Auto-calc HPP: product-level if no variants, else per variant
	if (input.variants && input.variants.length > 0) {
		input.variants = input.variants.map((v) => ({
			...v,
			costOfGoods: v.purchasePrice !== undefined ? calculateCostOfGoods(v.purchasePrice, catCost) : v.costOfGoods,
		}));
	} else if (input.purchasePrice !== undefined) {
		input.costOfGoods = calculateCostOfGoods(input.purchasePrice, catCost);
	}

	const created = await ProductModel.create(input as any);
	return res.status(201).json({ product: created });
});

// Update product (Admin; Employee requires admin approval)
router.put("/:id", authenticate, requireRole(UserRole.Admin, UserRole.Employee), async (req: AuthRequest, res) => {
	if (requireAdminApprovalWhenEmployee(req.user!.role)) {
		const ok = await verifyAdminApprovalIfNeeded(req);
		if (!ok) return res.status(403).json({ message: "Admin approval required" });
	}
	const parsed = ProductUpdateSchema.safeParse(req.body);
	if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
	const input = parsed.data as any;

	// If prices provided or category changed, recalc HPP
	const existing = await ProductModel.findById(req.params.id);
	if (!existing) return res.status(404).json({ message: "Not found" });
	const categoryName = input.category || existing.category;
	const catCost = await withCategoryCosts(categoryName);
	if (Array.isArray(input.variants) && input.variants.length > 0) {
		input.variants = input.variants.map((v: any) => ({
			...v,
			costOfGoods: v.purchasePrice !== undefined ? calculateCostOfGoods(v.purchasePrice, catCost) : v.costOfGoods,
		}));
	} else if (input.purchasePrice !== undefined) {
		input.costOfGoods = calculateCostOfGoods(input.purchasePrice, catCost);
	}

	const updated = await ProductModel.findByIdAndUpdate(req.params.id, input, { new: true });
	return res.json({ product: updated });
});

// Delete product (Admin; Employee requires admin approval)
router.delete("/:id", authenticate, requireRole(UserRole.Admin, UserRole.Employee), async (req: AuthRequest, res) => {
	if (requireAdminApprovalWhenEmployee(req.user!.role)) {
		const ok = await verifyAdminApprovalIfNeeded(req);
		if (!ok) return res.status(403).json({ message: "Admin approval required" });
	}
	await ProductModel.findByIdAndDelete(req.params.id);
	return res.json({ success: true });
});

export default router;
