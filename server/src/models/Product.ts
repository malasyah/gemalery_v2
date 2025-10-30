import { Schema, model, Types } from "mongoose";

export interface Variant {
	code: string;
	name: string;
	imageUrl?: string;
	stock?: number; // optional when managed externally
	purchasePrice?: number; // harga beli
	costOfGoods?: number; // HPP (computed elsewhere, stored for snapshot)
	salePrice?: number; // harga jual di toko ini
}

export interface Product {
	_id: Types.ObjectId;
	name: string;
	productCode: string;
	imageUrl?: string;
	description?: string;
	category: string; // name that links to CategoryCost.name
	stock?: number; // if no variant
	purchasePrice?: number; // if no variant
	costOfGoods?: number; // HPP (if no variant)
	salePrice?: number; // if no variant
	variants?: Variant[]; // if present, product-level pricing fields may be empty
	createdAt: Date;
	updatedAt: Date;
}

const VariantSchema = new Schema<Variant>(
	{
		code: { type: String, required: true },
		name: { type: String, required: true },
		imageUrl: { type: String },
		stock: { type: Number, min: 0 },
		purchasePrice: { type: Number, min: 0 },
		costOfGoods: { type: Number, min: 0 },
		salePrice: { type: Number, min: 0 },
	},
	{ _id: false }
);

const ProductSchema = new Schema<Product>(
	{
		name: { type: String, required: true },
		productCode: { type: String, required: true, unique: true, index: true },
		imageUrl: { type: String },
		description: { type: String },
		category: { type: String, required: true, index: true },
		stock: { type: Number, min: 0 },
		purchasePrice: { type: Number, min: 0 },
		costOfGoods: { type: Number, min: 0 },
		salePrice: { type: Number, min: 0 },
		variants: { type: [VariantSchema], default: undefined },
	},
	{ timestamps: true }
);

export const ProductModel = model<Product>("products", ProductSchema);
