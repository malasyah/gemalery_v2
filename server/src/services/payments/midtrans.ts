const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || "";
const MIDTRANS_BASE = process.env.MIDTRANS_BASE || "https://api.sandbox.midtrans.com/v2";

function authHeader() {
	const token = Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString("base64");
	return { Authorization: `Basic ${token}` };
}

export interface PaymentRequest {
	orderId: string;
	grossAmount: number;
	method: "va" | "qris";
	customer?: { name?: string; email?: string; phone?: string };
}

export async function createPayment(req: PaymentRequest) {
	if (!MIDTRANS_SERVER_KEY) {
		// Fallback stub
		return { method: req.method, snapToken: "stub", vaNumbers: [{ bank: "bca", va_number: "0000000000" }], qrisUrl: "https://example.com/qris-stub" };
	}
	if (req.method === "va") {
		const resp = await fetch(`${MIDTRANS_BASE}/charge`, {
			method: "POST",
			headers: { "Content-Type": "application/json", ...authHeader() },
			body: JSON.stringify({
				payment_type: "bank_transfer",
				transaction_details: { order_id: req.orderId, gross_amount: req.grossAmount },
				bank_transfer: { bank: "bca" },
				customer_details: req.customer || {},
			}),
		} as any);
		return await resp.json();
	} else {
		const resp = await fetch(`${MIDTRANS_BASE}/charge`, {
			method: "POST",
			headers: { "Content-Type": "application/json", ...authHeader() },
			body: JSON.stringify({
				payment_type: "qris",
				transaction_details: { order_id: req.orderId, gross_amount: req.grossAmount },
				customer_details: req.customer || {},
			}),
		} as any);
		return await resp.json();
	}
}
