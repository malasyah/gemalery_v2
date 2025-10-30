import { Schema, model, Types } from "mongoose";

export type ExternalPlatform = "tokopedia" | "shopee" | "lainnya";

export interface TransactionInItem {
	productId: Types.ObjectId;
	variantCode?: string;
	quantity: number;
	unitPrice: number; // sale price per unit on that platform
	subtotal: number; // quantity * unitPrice
}

export interface TransactionIn {
	_id: Types.ObjectId;
	platform: ExternalPlatform;
	items: TransactionInItem[];
	adminFee?: number; // biaya admin platform
	totalBeforeFee: number; // sum subtotals
	totalAfterFee: number; // totalBeforeFee - adminFee
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

const TransactionInItemSchema = new Schema<TransactionInItem>(
	{
		productId: { type: Schema.Types.ObjectId, ref: "products", required: true },
		variantCode: { type: String },
		quantity: { type: Number, required: true, min: 1 },
		unitPrice: { type: Number, required: true, min: 0 },
		subtotal: { type: Number, required: true, min: 0 },
	},
	{ _id: false }
);

const TransactionInSchema = new Schema<TransactionIn>(
	{
		platform: { type: String, enum: ["tokopedia", "shopee", "lainnya"], required: true, index: true },
		items: { type: [TransactionInItemSchema], default: [] },
		adminFee: { type: Number, min: 0, default: 0 },
		totalBeforeFee: { type: Number, required: true, min: 0 },
		totalAfterFee: { type: Number, required: true, min: 0 },
		notes: { type: String },
	},
	{ timestamps: true }
);

export const TransactionInModel = model<TransactionIn>("transactions_in", TransactionInSchema);
