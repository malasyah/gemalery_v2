import React, { useEffect, useState } from "react";
import { cancelOrder, deliverOrder, listOrders, processOrder, shipOrder, trackOrder } from "../api/orders";
import { useAuth } from "../auth/AuthContext";

const OrdersPage: React.FC = () => {
	const { user } = useAuth();
	const [orders, setOrders] = useState<any[]>([]);
	const [shipResi, setShipResi] = useState<Record<string, string>>({});
	const [tracking, setTracking] = useState<Record<string, any>>({});

	const canManage = !!user && (user.role === "admin" || user.role === "employee");
	const reload = async () => { const r = await listOrders(); setOrders(r.orders); };
	useEffect(() => { reload(); }, []);

	return (
		<div style={{ maxWidth: 1000, margin: "16px auto" }}>
			<h2>Pesanan</h2>
			<table style={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr>
						<th>Kode</th>
						<th>Status</th>
						<th>Bayar</th>
						<th>Total</th>
						<th>Resi</th>
						<th>Aksi</th>
					</tr>
				</thead>
				<tbody>
					{orders.map((o) => (
						<tr key={o._id}>
							<td>{o.orderCode}</td>
							<td>{o.status}</td>
							<td>{o.paymentStatus}</td>
							<td>{o.totalPayable}</td>
							<td>{o.trackingNumber || "-"}</td>
							<td style={{ display: "flex", gap: 6 }}>
								{canManage && (
									<>
										<button onClick={async () => { await processOrder(o._id); reload(); }}>Process</button>
										<input placeholder="Resi JNE" value={shipResi[o._id] || ""} onChange={(e) => setShipResi({ ...shipResi, [o._id]: e.target.value })} style={{ width: 120 }} />
										<button onClick={async () => { await shipOrder(o._id, shipResi[o._id] || ""); reload(); }}>Kirim</button>
										<button onClick={async () => { await deliverOrder(o._id); reload(); }}>Selesai</button>
										<button onClick={async () => { await cancelOrder(o._id); reload(); }}>Batal</button>
									</>
								)}
								<button onClick={async () => { const r = await trackOrder(o.orderCode); setTracking({ ...tracking, [o._id]: r.tracking }); }}>Lacak</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			{orders.map((o) => tracking[o._id] && (
				<div key={`t-${o._id}`} style={{ border: "1px solid #eee", marginTop: 12, padding: 8 }}>
					<h4>Tracking {tracking[o._id].waybill}</h4>
					<ul>
						{tracking[o._id].events.map((e: any, i: number) => (
							<li key={i}>{e.time} - {e.status} {e.location ? `(${e.location})` : ""}</li>
						))}
					</ul>
				</div>
			))}
		</div>
	);
};

export default OrdersPage;
