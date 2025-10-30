import { z } from "zod";

export const VariantSchema = z.object({
	code: z.string().min(1),
	name: z.string().min(1),
	imageUrl: z.string().url().optional(),
	stock: z.number().int().min(0).optional(),
	purchasePrice: z.number().min(0).optional(),
	costOfGoods: z.number().min(0).optional(),
	salePrice: z.number().min(0).optional(),
});

export const ProductCreateSchema = z
	.object({
		name: z.string().min(1),
		productCode: z.string().min(1),
		imageUrl: z.string().url().optional(),
		description: z.string().optional(),
		category: z.string().min(1),
		stock: z.number().int().min(0).optional(),
		purchasePrice: z.number().min(0).optional(),
		costOfGoods: z.number().min(0).optional(),
		salePrice: z.number().min(0).optional(),
		variants: z.array(VariantSchema).optional(),
	})
	.superRefine((data, ctx) => {
		const hasVariants = Array.isArray(data.variants) && data.variants.length > 0;
		if (hasVariants) {
			// product-level pricing may be empty; ensure variants exist
			return;
		}
		// no variants: require product-level stock, purchasePrice, costOfGoods (computed), salePrice
		const missing: string[] = [];
		if (data.stock === undefined) missing.push("stock");
		if (data.purchasePrice === undefined) missing.push("purchasePrice");
		if (data.salePrice === undefined) missing.push("salePrice");
		if (missing.length) {
			missing.forEach((m) => ctx.addIssue({ code: z.ZodIssueCode.custom, message: `${m} is required when no variants`, path: [m] }));
		}
	});

export const ProductUpdateSchema = ProductCreateSchema.partial().extend({ productCode: z.string().optional() });

export type VariantInput = z.infer<typeof VariantSchema>;
export type ProductCreateInput = z.infer<typeof ProductCreateSchema>;
export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;
