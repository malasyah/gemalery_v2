import { api } from "./http";

export interface VariantInput {
	code: string;
	name: string;
	imageUrl?: string;
	stock?: number;
	purchasePrice?: number;
	costOfGoods?: number;
	salePrice?: number;
}

export interface ProductInput {
	name: string;
	productCode: string;
	imageUrl?: string;
	description?: string;
	category: string;
	stock?: number;
	purchasePrice?: number;
	costOfGoods?: number;
	salePrice?: number;
	variants?: VariantInput[];
}

export interface Product extends ProductInput { _id: string }

export async function listProducts(params?: { search?: string; category?: string }) {
	const q = new URLSearchParams();
	if (params?.search) q.set("search", params.search);
	if (params?.category) q.set("category", params.category);
	return api<{ products: Product[] }>(`/products${q.toString() ? `?${q.toString()}` : ""}`);
}

export async function getProduct(id: string) {
	return api<{ product: Product }>(`/products/${id}`);
}

export async function createProduct(body: ProductInput) {
	return api<{ product: Product }>(`/products`, { method: "POST", body: JSON.stringify(body) });
}

export async function updateProduct(id: string, body: Partial<ProductInput>, adminApproval?: { username: string; password: string }) {
	const headers: Record<string, string> = {};
	if (adminApproval) {
		headers["x-admin-username"] = adminApproval.username;
		headers["x-admin-password"] = adminApproval.password;
	}
	return api<{ product: Product }>(`/products/${id}`, { method: "PUT", body: JSON.stringify(body), headers });
}

export async function deleteProduct(id: string, adminApproval?: { username: string; password: string }) {
	const headers: Record<string, string> = {};
	if (adminApproval) {
		headers["x-admin-username"] = adminApproval.username;
		headers["x-admin-password"] = adminApproval.password;
	}
	return api<{ success: boolean }>(`/products/${id}`, { method: "DELETE", headers });
}
