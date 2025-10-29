import React, { useEffect, useMemo, useState } from "react";
import { createProduct, deleteProduct, listProducts, updateProduct } from "../api/products";
import type { Product, ProductInput } from "../api/products";
import { useAuth } from "../auth/AuthContext";

const emptyProduct: ProductInput = {
	name: "",
	productCode: "",
	category: "",
	salePrice: undefined,
	purchasePrice: undefined,
	stock: undefined,
	imageUrl: "",
	description: "",
	variants: [],
};

const ManageProducts: React.FC = () => {
	const { user } = useAuth();
	const [products, setProducts] = useState<Product[]>([]);
	const [form, setForm] = useState<ProductInput>(emptyProduct);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [adminUser, setAdminUser] = useState("");
	const [adminPass, setAdminPass] = useState("");
	const isEmployee = useMemo(() => user?.role === "employee", [user]);

	const reload = async () => {
		const r = await listProducts();
		setProducts(r.products);
	};

	useEffect(() => { reload(); }, []);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (editingId) {
			await updateProduct(editingId, form, isEmployee ? { username: adminUser, password: adminPass } : undefined);
		} else {
			await createProduct(form);
		}
		setForm(emptyProduct);
		setEditingId(null);
		setAdminUser("");
		setAdminPass("");
		reload();
	};

	const onEdit = (p: Product) => {
		setEditingId(p._id);
		setForm({
			name: p.name,
			productCode: p.productCode,
			category: p.category,
			salePrice: p.salePrice,
			purchasePrice: p.purchasePrice,
			stock: p.stock,
			imageUrl: p.imageUrl,
			description: p.description,
			variants: p.variants,
		});
	};

	const onDelete = async (id: string) => {
		await deleteProduct(id, isEmployee ? { username: adminUser, password: adminPass } : undefined);
		reload();
	};

	return (
		<div style={{ maxWidth: 1000, margin: "16px auto" }}>
			<h2>Kelola Produk</h2>
			<form onSubmit={onSubmit} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, marginBottom: 16 }}>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
					<label>Nama<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
					<label>Kode<input value={form.productCode} onChange={(e) => setForm({ ...form, productCode: e.target.value })} required disabled={!!editingId} /></label>
					<label>Kategori<input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required /></label>
					<label>Harga Jual<input type="number" value={form.salePrice ?? ""} onChange={(e) => setForm({ ...form, salePrice: e.target.value ? Number(e.target.value) : undefined })} /></label>
					<label>Harga Beli<input type="number" value={form.purchasePrice ?? ""} onChange={(e) => setForm({ ...form, purchasePrice: e.target.value ? Number(e.target.value) : undefined })} /></label>
					<label>Stok<input type="number" value={form.stock ?? ""} onChange={(e) => setForm({ ...form, stock: e.target.value ? Number(e.target.value) : undefined })} /></label>
					<label>Gambar URL<input value={form.imageUrl ?? ""} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></label>
					<label>Deskripsi<input value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
				</div>
				{isEmployee && (
					<div style={{ marginTop: 8 }}>
						<p>Untuk Ubah/Hapus butuh persetujuan Admin:</p>
						<input placeholder="Admin username" value={adminUser} onChange={(e) => setAdminUser(e.target.value)} />
						<input type="password" placeholder="Admin password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} />
					</div>
				)}
				<div style={{ marginTop: 12 }}>
					<button type="submit">{editingId ? "Simpan Perubahan" : "Tambah Produk"}</button>
					{editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyProduct); }}>Batal</button>}
				</div>
			</form>

			<table style={{ width: "100%", borderCollapse: "collapse" }}>
				<thead>
					<tr>
						<th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Nama</th>
						<th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Kode</th>
						<th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Kategori</th>
						<th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Harga</th>
						<th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Aksi</th>
					</tr>
				</thead>
				<tbody>
					{products.map((p) => (
						<tr key={p._id}>
							<td>{p.name}</td>
							<td>{p.productCode}</td>
							<td>{p.category}</td>
							<td>{p.salePrice ?? (p.variants && p.variants[0]?.salePrice) ?? "-"}</td>
							<td>
								<button onClick={() => onEdit(p)}>Edit</button>
								<button onClick={() => onDelete(p._id)} style={{ marginLeft: 8 }}>Hapus</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default ManageProducts;
