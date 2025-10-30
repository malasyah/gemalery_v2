import { Schema, model, Types } from "mongoose";
import { Address, AddressSchema } from "./common/Address";

export type PaymentMethod = "va" | "qris";
export type PaymentStatus = "pending" | "paid" | "failed" | "expired" | "refunded";
export type OrderStatus = "new" | "processing" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
	productId: Types.ObjectId;
	productName: string;
	variantCode?: string;
	variantName?: string;
	quantity: number;
	unitPrice: number; // snapshot at time of purchase
	subtotal: number; // quantity * unitPrice
}

export interface Order {
	_id: Types.ObjectId;
	orderCode: string;
	userId?: Types.ObjectId; // undefined for guest
	items: OrderItem[];
	shippingAddress: Address; // snapshot
	shippingCourier: "JNE";
	shippingService?: string; // e.g., REG/YES/OKE
	shippingCost: number;
	paymentMethod: PaymentMethod;
	paymentStatus: PaymentStatus;
	paymentProviderId?: string; // e.g., Midtrans transaction id
	totalProducts: number; // sum of subtotals
	totalPayable: number; // totalProducts + shippingCost
	status: OrderStatus;
	trackingNumber?: string; // JNE resi
	createdAt: Date;
	updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>(
	{
		productId: { type: Schema.Types.ObjectId, ref: "products", required: true },
		productName: { type: String, required: true },
		variantCode: { type: String },
		variantName: { type: String },
		quantity: { type: Number, required: true, min: 1 },
		unitPrice: { type: Number, required: true, min: 0 },
		subtotal: { type: Number, required: true, min: 0 },
	},
	{ _id: false }
);

const OrderSchema = new Schema<Order>(
	{
		orderCode: { type: String, required: true, unique: true, index: true },
		userId: { type: Schema.Types.ObjectId, ref: "users" },
		items: { type: [OrderItemSchema], default: [] },
		shippingAddress: { type: AddressSchema, required: true },
		shippingCourier: { type: String, enum: ["JNE"], required: true },
		shippingService: { type: String },
		shippingCost: { type: Number, required: true, min: 0 },
		paymentMethod: { type: String, enum: ["va", "qris"], required: true },
		paymentStatus: { type: String, enum: ["pending", "paid", "failed", "expired", "refunded"], required: true },
		paymentProviderId: { type: String },
		totalProducts: { type: Number, required: true, min: 0 },
		totalPayable: { type: Number, required: true, min: 0 },
		status: { type: String, enum: ["new", "processing", "shipped", "delivered", "cancelled"], required: true, index: true },
		trackingNumber: { type: String },
	},
	{ timestamps: true }
);

export const OrderModel = model<Order>("orders", OrderSchema);
