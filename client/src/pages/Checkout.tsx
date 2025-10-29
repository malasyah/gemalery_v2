import React, { useEffect, useState } from "react";
import { addAddress, createOrder, listAddresses, quoteShipping } from "../api/cart";

const DEFAULT_ORIGIN_CITY_ID = import.meta.env.VITE_ORIGIN_CITY_ID || "501"; // example city id

const CheckoutPage: React.FC = () => {
	const [addresses, setAddresses] = useState<any[]>([]);
	const [selectedIndex, setSelectedIndex] = useState<number>(-1);
	const [newAddr, setNewAddr] = useState<any>({ label: "", name: "", phone: "", street: "", city: "", province: "", postalCode: "" });
	const [rates, setRates] = useState<{ service: string; cost: number }[]>([]);
	const [selectedRate, setSelectedRate] = useState<string>("");
	const [paymentMethod, setPaymentMethod] = useState<"va" | "qris">("va");
	const [result, setResult] = useState<any>(null);

	useEffect(() => { listAddresses().then((r) => setAddresses(r.addresses)); }, []);

	const onAddAddress = async (e: React.FormEvent) => {
		e.preventDefault();
		const r = await addAddress(newAddr);
		setAddresses(r.addresses);
		setNewAddr({ label: "", name: "", phone: "", street: "", city: "", province: "", postalCode: "" });
	};

	const onQuote = async () => {
		const addr = addresses[selectedIndex];
		if (!addr) return;
		// For demo, use placeholder destinationCityId; in production, map city name to ID.
		const destinationCityId = addr.city_id || "114"; // fallback example ID
		const r = await quoteShipping({ originCityId: DEFAULT_ORIGIN_CITY_ID, destinationCityId, weightGrams: 1000 });
		setRates(r.rates);
		setSelectedRate(r.rates[0]?.service || "");
	};

	const onCreateOrder = async () => {
		const addr = addresses[selectedIndex];
		const rate = rates.find((x) => x.service === selectedRate);
		if (!addr || !rate) return;
		const r = await createOrder({ shippingAddress: addr, shippingService: rate.service, shippingCost: rate.cost, paymentMethod });
		setResult(r);
	};

	return (
		<div style={{ maxWidth: 800, margin: "16px auto" }}>
			<h2>Checkout</h2>
			<h3>Alamat Pengiriman</h3>
			{addresses.map((a, i) => (
				<label key={i} style={{ display: "block" }}>
					<input type="radio" name="addr" checked={selectedIndex === i} onChange={() => setSelectedIndex(i)} /> {a.label || a.street} - {a.city}
				</label>
			))}
			<form onSubmit={onAddAddress} style={{ border: "1px solid #eee", padding: 8, marginTop: 8 }}>
				<h4>Tambah Alamat</h4>
				<input placeholder="Label" value={newAddr.label} onChange={(e) => setNewAddr({ ...newAddr, label: e.target.value })} />
				<input placeholder="Nama" value={newAddr.name} onChange={(e) => setNewAddr({ ...newAddr, name: e.target.value })} required />
				<input placeholder="No HP" value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} required />
				<input placeholder="Alamat" value={newAddr.street} onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })} required />
				<input placeholder="Kota" value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} required />
				<input placeholder="Provinsi" value={newAddr.province} onChange={(e) => setNewAddr({ ...newAddr, province: e.target.value })} required />
				<input placeholder="Kode Pos" value={newAddr.postalCode} onChange={(e) => setNewAddr({ ...newAddr, postalCode: e.target.value })} required />
				<button type="submit">Simpan Alamat</button>
			</form>

			<h3 style={{ marginTop: 16 }}>Ongkos Kirim (JNE)</h3>
			<button onClick={onQuote} disabled={selectedIndex < 0}>Cek Ongkir</button>
			{rates.length > 0 && (
				<div>
					{rates.map((r) => (
						<label key={r.service} style={{ display: "block" }}>
							<input type="radio" name="rate" checked={selectedRate === r.service} onChange={() => setSelectedRate(r.service)} /> {r.service} - {r.cost}
						</label>
					))}
				</div>
			)}

			<h3 style={{ marginTop: 16 }}>Pembayaran</h3>
			<label><input type="radio" name="pay" checked={paymentMethod === "va"} onChange={() => setPaymentMethod("va")} /> Virtual Account</label>
			<label style={{ marginLeft: 12 }}><input type="radio" name="pay" checked={paymentMethod === "qris"} onChange={() => setPaymentMethod("qris")} /> QRIS</label>
			<div style={{ marginTop: 12 }}>
				<button onClick={onCreateOrder} disabled={selectedIndex < 0 || !selectedRate}>Buat Pesanan</button>
			</div>

			{result && (
				<div style={{ marginTop: 16, border: "1px solid #ddd", padding: 8 }}>
					<h4>Pesanan dibuat</h4>
					<p>Kode: {result.order?.orderCode}</p>
					{paymentMethod === "va" ? (
						<div>
							<p>VA Info: {JSON.stringify(result.payment)}</p>
						</div>
					) : (
						<div>
							<p>QRIS Info: {JSON.stringify(result.payment)}</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default CheckoutPage;
