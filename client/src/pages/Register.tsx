import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Register: React.FC = () => {
	const { register } = useAuth();
	const nav = useNavigate();
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		try {
			await register(name, phone, username, password);
			nav("/");
		} catch (e: any) {
			setError("Registrasi gagal");
		}
	};

	return (
		<div style={{ maxWidth: 360, margin: "40px auto" }}>
			<h2>Daftar</h2>
			<form onSubmit={onSubmit}>
				<div>
					<label>Nama</label>
					<input value={name} onChange={(e) => setName(e.target.value)} required />
				</div>
				<div>
					<label>No HP</label>
					<input value={phone} onChange={(e) => setPhone(e.target.value)} required />
				</div>
				<div>
					<label>Username</label>
					<input value={username} onChange={(e) => setUsername(e.target.value)} required />
				</div>
				<div>
					<label>Password</label>
					<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
				</div>
				{error && <p style={{ color: "red" }}>{error}</p>}
				<button type="submit">Daftar</button>
			</form>
			<p>Sudah punya akun? <Link to="/login">Masuk</Link></p>
		</div>
	);
};

export default Register;
