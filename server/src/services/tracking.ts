const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY || "";
const RAJAONGKIR_BASE = process.env.RAJAONGKIR_BASE || "https://api.rajaongkir.com/starter";

export interface TrackingEvent {
	time: string;
	status: string;
	location?: string;
}

export interface TrackingResult {
	courier: "JNE";
	waybill: string;
	events: TrackingEvent[];
}

export async function trackJne(waybill: string): Promise<TrackingResult> {
	// RajaOngkir waybill is not available in Starter plan; if no pro key or endpoint fails, return a stub.
	if (!RAJAONGKIR_API_KEY || !RAJAONGKIR_BASE.includes("pro")) {
		return {
			courier: "JNE",
			waybill,
			events: [
				{ time: new Date().toISOString(), status: "Shipment data received", location: "Origin" },
			],
		};
	}
	try {
		const res = await fetch(`${RAJAONGKIR_BASE}/waybill`, {
			method: "POST",
			headers: { key: RAJAONGKIR_API_KEY, "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({ waybill, courier: "jne" }),
		} as any);
		if (!res.ok) throw new Error(await res.text());
		const data = await res.json();
		const manifests: any[] = data?.rajaongkir?.result?.manifest || [];
		const events = manifests.map((m) => ({ time: `${m.manifest_date} ${m.manifest_time}`, status: m.manifest_description, location: m.city_name }));
		return { courier: "JNE", waybill, events };
	} catch {
		return {
			courier: "JNE",
			waybill,
			events: [
				{ time: new Date().toISOString(), status: "In transit", location: "-" },
			],
		};
	}
}
