export interface ShippingQuery {
	originCityId: string; // RajaOngkir city_id for origin
	destinationCityId: string; // RajaOngkir city_id for destination
	weightGrams: number;
}

export interface ShippingRate {
	service: string; // REG/YES/OKE
	cost: number; // IDR
	estimatedDays?: string;
}

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY || "";
const RAJAONGKIR_BASE = process.env.RAJAONGKIR_BASE || "https://api.rajaongkir.com/starter";

export async function getJneRates(query: ShippingQuery): Promise<ShippingRate[]> {
	if (!RAJAONGKIR_API_KEY) {
		// Fallback flat rate
		return [
			{ service: "REG", cost: 20000 },
			{ service: "YES", cost: 35000 },
		];
	}
	const body = new URLSearchParams({
		origin: query.originCityId,
		destination: query.destinationCityId,
		weight: String(Math.max(1, Math.round(query.weightGrams))),
		courier: "jne",
	});
	const res = await fetch(`${RAJAONGKIR_BASE}/cost`, {
		method: "POST",
		headers: { key: RAJAONGKIR_API_KEY, "Content-Type": "application/x-www-form-urlencoded" },
		body,
	} as any);
	if (!res.ok) throw new Error(`RajaOngkir error: ${await res.text()}`);
	const data = await res.json();
	const costs: any[] = data?.rajaongkir?.results?.[0]?.costs || [];
	return costs.map((c) => ({ service: c.service, cost: c.cost?.[0]?.value || 0, estimatedDays: c.cost?.[0]?.etd }));
}
