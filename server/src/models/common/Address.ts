import { Schema } from "mongoose";

export interface Address {
	label?: string;
	name: string;
	phone: string;
	street: string; // full address text
	city: string;
	province: string;
	postalCode: string;
	country?: string;
}

export const AddressSchema = new Schema<Address>(
	{
		label: { type: String },
		name: { type: String, required: true },
		phone: { type: String, required: true },
		street: { type: String, required: true },
		city: { type: String, required: true },
		province: { type: String, required: true },
		postalCode: { type: String, required: true },
		country: { type: String, default: "Indonesia" },
	},
	{ _id: false }
);
