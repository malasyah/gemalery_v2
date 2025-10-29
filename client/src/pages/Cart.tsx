import React, { useEffect, useState } from "react";
import { getCart, removeCartItem, updateCartItem } from "../api/cart";
import { Link } from "react-router-dom";

const CartPage: React.FC = () => {
	const [cart, setCart] = useState<{ items: any[] }>({ items: [] });
	const reload = async () => {
		const r = await getCart();
		setCart(r.cart || { items: [] });
	};
	useEffect(() => { reload(); }, []);
	return (
		<div style={{ maxWidth: 800, margin: "16px auto" }}>
			<h2>Keranjang</h2>
			{cart.items.length === 0 ? <p>Keranjang kosong</p> : (
				<table style={{ width: "100%", borderCollapse: "collapse" }}>
					<thead>
						<tr>
							<th>Produk</th>
							<th>Varian</th>
							<th>Qty</th>
							<th>Subtotal</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{cart.items.map((i, idx) => (
							<tr key={idx}>
								<td>{i.productName || i.productId}</td>
								<td>{i.variantName || i.variantCode || "-"}</td>
								<td><input type="number" min={1} value={i.quantity} onChange={async (e) => { await updateCartItem({ productId: i.productId, variantCode: i.variantCode, quantity: Number(e.target.value) }); reload(); }} /></td>
								<td>{i.subtotal ?? "-"}</td>
								<td><button onClick={async () => { await removeCartItem({ productId: i.productId, variantCode: i.variantCode }); reload(); }}>Hapus</button></td>
							</tr>
						))}
					</tbody>
				</table>
			)}
			<div style={{ marginTop: 12 }}>
				<Link to="/checkout"><button disabled={cart.items.length === 0}>Checkout</button></Link>
			</div>
		</div>
	);
};

export default CartPage;
