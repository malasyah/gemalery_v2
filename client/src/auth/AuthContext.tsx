import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/http";

type Role = "admin" | "employee" | "customer";

interface UserInfo {
	id: string;
	name: string;
	username: string;
	role: Role;
}

interface AuthContextValue {
	user: UserInfo | null;
	token: string | null;
	login: (username: string, password: string) => Promise<void>;
	register: (name: string, phone: string, username: string, password: string) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [user, setUser] = useState<UserInfo | null>(null);
	const [token, setToken] = useState<string | null>(null);

	useEffect(() => {
		const t = localStorage.getItem("token");
		if (t) {
			setToken(t);
			api<{ user: { userId: string; role: Role } }>("/auth/me").then((r) => {
				setUser({ id: r.user.userId, name: "", username: "", role: r.user.role });
			}).catch(() => {
				localStorage.removeItem("token");
				setToken(null);
				setUser(null);
			});
		}
	}, []);

	const login = async (username: string, password: string) => {
		const res = await api<{ token: string; user: UserInfo }>("/auth/login", {
			method: "POST",
			body: JSON.stringify({ username, password }),
		});
		localStorage.setItem("token", res.token);
		setToken(res.token);
		setUser(res.user);
	};

	const register = async (name: string, phone: string, username: string, password: string) => {
		const res = await api<{ token: string; user: UserInfo }>("/auth/register", {
			method: "POST",
			body: JSON.stringify({ name, phone, username, password }),
		});
		localStorage.setItem("token", res.token);
		setToken(res.token);
		setUser(res.user);
	};

	const logout = () => {
		localStorage.removeItem("token");
		setToken(null);
		setUser(null);
	};

	const value = useMemo(() => ({ user, token, login, register, logout }), [user, token]);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
