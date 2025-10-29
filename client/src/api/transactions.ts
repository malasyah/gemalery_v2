import { api } from "./http";

export async function createTransactionIn(body: any) {
	return api<{ transaction: any }>(`/transactions/in`, { method: "POST", body: JSON.stringify(body) });
}

export async function listTransactionIn() {
	return api<{ transactions: any[] }>(`/transactions/in`);
}

export async function createTransactionOut(body: any) {
	return api<{ transaction: any }>(`/transactions/out`, { method: "POST", body: JSON.stringify(body) });
}

export async function listTransactionOut() {
	return api<{ transactions: any[] }>(`/transactions/out`);
}

export async function reportMonthlySales(month: string) {
	return api<{ month: string; totalOrders: number; count: number }>(`/transactions/reports/monthly-sales?month=${encodeURIComponent(month)}`);
}

export async function reportProfitLoss(month: string) {
	return api<{ month: string; revenue: number; expenses: number; profit: number }>(`/transactions/reports/profit-loss?month=${encodeURIComponent(month)}`);
}
