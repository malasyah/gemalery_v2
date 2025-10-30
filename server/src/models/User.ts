import { Schema, model, Types } from "mongoose";
import { AddressSchema, Address } from "./common/Address";
import { UserRole } from "../types/roles";

export interface User {
	_id: Types.ObjectId;
	name: string;
	phone: string;
	username: string;
	passwordHash: string;
	role: UserRole;
	addresses: Address[];
	createdAt: Date;
	updatedAt: Date;
}

const UserSchema = new Schema<User>(
	{
		name: { type: String, required: true },
		phone: { type: String, required: true },
		username: { type: String, required: true, unique: true, index: true },
		passwordHash: { type: String, required: true },
		role: { type: String, enum: Object.values(UserRole), required: true, index: true },
		addresses: { type: [AddressSchema], default: [] },
	},
	{ timestamps: true }
);

export const UserModel = model<User>("users", UserSchema);
