import { Schema, model, Types } from "mongoose";

export interface CostItem {
	name: string; // e.g., shipping, production, label, packaging, others
	amount: number; // IDR
}

export interface CategoryCost {
	_id: Types.ObjectId;
	name: string; // category name
	costItems: CostItem[];
	createdAt: Date;
	updatedAt: Date;
}

const CostItemSchema = new Schema<CostItem>(
	{
		name: { type: String, required: true },
		amount: { type: Number, required: true, min: 0 },
	},
	{ _id: false }
);

const CategoryCostSchema = new Schema<CategoryCost>(
	{
		name: { type: String, required: true, unique: true, index: true },
		costItems: { type: [CostItemSchema], default: [] },
	},
	{ timestamps: true }
);

export const CategoryCostModel = model<CategoryCost>("category_costs", CategoryCostSchema);
