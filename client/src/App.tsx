import React, { useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Routes, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { api } from "./api/http";
import ManageProducts from "./pages/ManageProducts";
import CartPage from "./pages/Cart";
import CheckoutPage from "./pages/Checkout";
import OrdersPage from "./pages/Orders";
import TransactionsPage from "./pages/Transactions";
import { addToCart } from "./api/cart";
import "./App.css";

type Product = {
	_id: string;
	name: string;
	imageUrl?: string;
	salePrice?: number;
	variants?: { code: string; name: string; salePrice?: number }[];
};

const ProductsPage: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [search, setSearch] = useState("");
	const nav = useNavigate();
	useEffect(() => {
		api<{ products: Product[] }>(`/products${search ? `?search=${encodeURIComponent(search)}` : ""}`).then((r) => setProducts(r.products));
	}, [search]);
	return (
		<div style={{ maxWidth: 960, margin: "16px auto" }}>
			<h2>Produk</h2>
			<input placeholder="Cari produk" value={search} onChange={(e) => setSearch(e.target.value)} />
			<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginTop: 16 }}>
				{products.map((p) => (
					<div key={p._id} style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
						{p.imageUrl && <img src={p.imageUrl} style={{ width: "100%", height: 140, objectFit: "cover" }} />}
						<h4>{p.name}</h4>
						<p>Harga: {p.salePrice ?? p.variants?.[0]?.salePrice ?? 0}</p>
						<button onClick={async () => { await addToCart({ productId: p._id, quantity: 1 }); nav("/cart"); }}>Masukan ke keranjang</button>
					</div>
				))}
			</div>
		</div>
	);
};

const NavBar: React.FC = () => {
	const { user, logout } = useAuth();
	const canManage = user && (user.role === "admin" || user.role === "employee");
	return (
		<nav style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #eee" }}>
			<Link to="/">Produk</Link>
			<Link to="/cart">Keranjang</Link>
			{canManage && <Link to="/manage/products">Kelola Produk</Link>}
			{canManage && <Link to="/orders">Pesanan</Link>}
			{canManage && <Link to="/transactions">Transaksi & Laporan</Link>}
			<div style={{ marginLeft: "auto" }}>
				{user ? (
					<>
						<span style={{ marginRight: 12 }}>Halo, {user.username} ({user.role})</span>
						<button onClick={logout}>Keluar</button>
					</>
				) : (
					<>
						<Link to="/login">Masuk</Link>
						<Link to="/register" style={{ marginLeft: 8 }}>Daftar</Link>
					</>
				)}
			</div>
		</nav>
	);
};

function AppRoutes() {
	return (
		<Routes>
			<Route path="/" element={<ProductsPage />} />
			<Route path="/login" element={<Login />} />
			<Route path="/register" element={<Register />} />
			<Route path="/manage/products" element={<ManageProducts />} />
			<Route path="/cart" element={<CartPage />} />
			<Route path="/checkout" element={<CheckoutPage />} />
			<Route path="/orders" element={<OrdersPage />} />
			<Route path="/transactions" element={<TransactionsPage />} />
		</Routes>
	);
}

function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
				<NavBar />
				<AppRoutes />
			</AuthProvider>
		</BrowserRouter>
	);
}

export default App;
