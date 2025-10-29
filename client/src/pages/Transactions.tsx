import React, { useEffect, useState } from "react";
import { createTransactionIn, createTransactionOut, listTransactionIn, listTransactionOut, reportMonthlySales, reportProfitLoss } from "../api/transactions";
import { useAuth } from "../auth/AuthContext";

const TransactionsPage: React.FC = () => {
	const { user } = useAuth();
	const canManage = !!user && (user.role === "admin" || user.role === "employee");
	const [inList, setInList] = useState<any[]>([]);
	const [outList, setOutList] = useState<any[]>([]);
	const [month, setMonth] = useState<string>(new Date().toISOString().slice(0,7));
	const [sales, setSales] = useState<any>(null);
	const [pl, setPl] = useState<any>(null);

	const reload = async () => {
		const ri = await listTransactionIn();
		const ro = await listTransactionOut();
		setInList(ri.transactions);
		setOutList(ro.transactions);
		setSales(await reportMonthlySales(month));
		setPl(await reportProfitLoss(month));
	};
	useEffect(() => { reload(); }, [month]);

	const [inForm, setInForm] = useState<any>({ platform: "tokopedia", items: [], adminFee: 0 });
	const [outForm, setOutForm] = useState<any>({ type: "", description: "", amount: 0 });

	if (!canManage) return <div style={{ maxWidth: 900, margin: "16px auto" }}><h2>Transaksi</h2><p>Hanya Admin/Employee.</p></div>;

	return (
		<div style={{ maxWidth: 1000, margin: "16px auto" }}>
			<h2>Transaksi</h2>
			<h3>Transaksi Masuk (Tokopedia/Shopee/Lainnya)</h3>
			<div style={{ border: "1px solid #eee", padding: 8 }}>
				<select value={inForm.platform} onChange={(e) => setInForm({ ...inForm, platform: e.target.value })}>
					<option value="tokopedia">Tokopedia</option>
					<option value="shopee">Shopee</option>
					<option value="lainnya">Lainnya</option>
				</select>
				<button onClick={() => setInForm({ ...inForm, items: [...inForm.items, { productId: "", variantCode: "", quantity: 1, unitPrice: 0, subtotal: 0 }] })}>Tambah Item</button>
				{inForm.items.map((it: any, idx: number) => (
					<div key={idx}>
						<input placeholder="ProductId" value={it.productId} onChange={(e) => it.productId = e.target.value} />
						<input placeholder="VariantCode" value={it.variantCode} onChange={(e) => it.variantCode = e.target.value} />
						<input type="number" placeholder="Qty" value={it.quantity} onChange={(e) => { it.quantity = Number(e.target.value); it.subtotal = it.quantity * it.unitPrice; setInForm({ ...inForm }); }} />
						<input type="number" placeholder="Harga" value={it.unitPrice} onChange={(e) => { it.unitPrice = Number(e.target.value); it.subtotal = it.quantity * it.unitPrice; setInForm({ ...inForm }); }} />
						<span>Subtotal: {it.subtotal || 0}</span>
					</div>
				))}
				<div>
					<label>Biaya Admin</label>
					<input type="number" value={inForm.adminFee} onChange={(e) => setInForm({ ...inForm, adminFee: Number(e.target.value) })} />
				</div>
				<button onClick={async () => { await createTransactionIn(inForm); setInForm({ platform: "tokopedia", items: [], adminFee: 0 }); reload(); }}>Simpan Transaksi Masuk</button>
			</div>

			<h3 style={{ marginTop: 16 }}>Transaksi Keluar</h3>
			<div style={{ border: "1px solid #eee", padding: 8 }}>
				<input placeholder="Jenis" value={outForm.type} onChange={(e) => setOutForm({ ...outForm, type: e.target.value })} />
				<input placeholder="Keterangan" value={outForm.description} onChange={(e) => setOutForm({ ...outForm, description: e.target.value })} />
				<input type="number" placeholder="Jumlah" value={outForm.amount} onChange={(e) => setOutForm({ ...outForm, amount: Number(e.target.value) })} />
				<button onClick={async () => { await createTransactionOut(outForm); setOutForm({ type: "", description: "", amount: 0 }); reload(); }}>Simpan Pengeluaran</button>
			</div>

			<h3 style={{ marginTop: 16 }}>Daftar Transaksi Masuk</h3>
			<ul>
				{inList.map((t) => (<li key={t._id}>{t.platform} - {t.totalAfterFee}</li>))}
			</ul>

			<h3>Daftar Transaksi Keluar</h3>
			<ul>
				{outList.map((t) => (<li key={t._id}>{t.type} - {t.amount}</li>))}
			</ul>

			<h3 style={{ marginTop: 16 }}>Laporan Bulanan</h3>
			<label>Bulan</label>
			<input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
			<div style={{ display: "flex", gap: 16, marginTop: 8 }}>
				<div style={{ border: "1px solid #ddd", padding: 8 }}>
					<h4>Penjualan</h4>
					<p>Total Items: {sales?.count ?? 0}</p>
					<p>Total Nilai: {sales?.totalOrders ?? 0}</p>
				</div>
				<div style={{ border: "1px solid #ddd", padding: 8 }}>
					<h4>Laba Rugi</h4>
					<p>Pendapatan: {pl?.revenue ?? 0}</p>
					<p>Pengeluaran: {pl?.expenses ?? 0}</p>
					<p>Laba: {pl?.profit ?? 0}</p>
				</div>
			</div>
		</div>
	);
};

export default TransactionsPage;
