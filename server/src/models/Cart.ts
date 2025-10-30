import { Schema, model, Types } from "mongoose";

export interface CartItem {
	productId: Types.ObjectId;
	variantCode?: string; // optional when no variant
	quantity: number;
}

export interface Cart {
	_id: Types.ObjectId;
	userId?: Types.ObjectId; // absent for guest carts, link via cartId cookie
	sessionKey?: string; // for guests
	items: CartItem[];
	createdAt: Date;
	updatedAt: Date;
}

const CartItemSchema = new Schema<CartItem>(
	{
		productId: { type: Schema.Types.ObjectId, ref: "products", required: true },
		variantCode: { type: String },
		quantity: { type: Number, required: true, min: 1 },
	},
	{ _id: false }
);

const CartSchema = new Schema<Cart>(
	{
		userId: { type: Schema.Types.ObjectId, ref: "users" },
		sessionKey: { type: String },
		items: { type: [CartItemSchema], default: [] },
	},
	{ timestamps: true }
);

export const CartModel = model<Cart>("carts", CartSchema);
