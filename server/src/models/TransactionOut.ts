import { Schema, model, Types } from "mongoose";

export interface TransactionOut {
	_id: Types.ObjectId;
	type: string; // jenis transaksi pengeluaran
	description?: string;
	amount: number;
	createdAt: Date;
	updatedAt: Date;
}

const TransactionOutSchema = new Schema<TransactionOut>(
	{
		type: { type: String, required: true, index: true },
		description: { type: String },
		amount: { type: Number, required: true, min: 0 },
	},
	{ timestamps: true }
);

export const TransactionOutModel = model<TransactionOut>("transactions_out", TransactionOutSchema);
