import { api } from "./http";

export async function listOrders() {
	return api<{ orders: any[] }>(`/orders`);
}

export async function processOrder(id: string) {
	return api<{ order: any }>(`/orders/${id}/process`, { method: "POST" });
}

export async function shipOrder(id: string, trackingNumber: string) {
	return api<{ order: any }>(`/orders/${id}/ship`, { method: "POST", body: JSON.stringify({ trackingNumber }) });
}

export async function deliverOrder(id: string) {
	return api<{ order: any }>(`/orders/${id}/deliver`, { method: "POST" });
}

export async function cancelOrder(id: string) {
	return api<{ order: any }>(`/orders/${id}/cancel`, { method: "POST" });
}

export async function trackOrder(orderCode: string) {
	return api<{ tracking: { courier: string; waybill: string; events: { time: string; status: string; location?: string }[] } }>(`/orders/${orderCode}/tracking`);
}
