import { api } from "./http";

export interface CartItemReq { productId: string; variantCode?: string; quantity: number }

export async function getCart() {
	return api<{ cart: { items: any[] } }>(`/cart`);
}

export async function addToCart(body: CartItemReq) {
	return api<{ cart: any }>(`/cart/add`, { method: "POST", body: JSON.stringify(body) });
}

export async function updateCartItem(body: CartItemReq) {
	return api<{ cart: any }>(`/cart/item`, { method: "PUT", body: JSON.stringify(body) });
}

export async function removeCartItem(body: { productId: string; variantCode?: string }) {
	return api<{ cart: any }>(`/cart/item`, { method: "DELETE", body: JSON.stringify(body) });
}

export async function listAddresses() {
	return api<{ addresses: any[] }>(`/addresses`);
}

export async function addAddress(addr: any) {
	return api<{ addresses: any[] }>(`/addresses`, { method: "POST", body: JSON.stringify(addr) });
}

export async function quoteShipping(body: { originCityId: string; destinationCityId: string; weightGrams: number }) {
	return api<{ rates: { service: string; cost: number }[] }>(`/checkout/shipping/quote`, { method: "POST", body: JSON.stringify(body) });
}

export async function createOrder(body: { shippingAddress: any; shippingService: string; shippingCost: number; paymentMethod: "va" | "qris" }) {
	return api<{ order: any; payment: any }>(`/checkout/create`, { method: "POST", body: JSON.stringify(body) });
}
