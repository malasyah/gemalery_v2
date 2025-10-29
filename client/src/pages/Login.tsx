import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Login: React.FC = () => {
	const { login } = useAuth();
	const nav = useNavigate();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		try {
			await login(username, password);
			nav("/");
		} catch (e: any) {
			setError("Login gagal");
		}
	};

	return (
		<div style={{ maxWidth: 360, margin: "40px auto" }}>
			<h2>Masuk</h2>
			<form onSubmit={onSubmit}>
				<div>
					<label>Username</label>
					<input value={username} onChange={(e) => setUsername(e.target.value)} required />
				</div>
				<div>
					<label>Password</label>
					<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
				</div>
				{error && <p style={{ color: "red" }}>{error}</p>}
				<button type="submit">Masuk</button>
			</form>
			<p>Belum punya akun? <Link to="/register">Daftar</Link></p>
			<p>Atau lanjut sebagai <Link to="/">Guest</Link></p>
		</div>
	);
};

export default Login;
