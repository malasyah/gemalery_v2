const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

function getToken() {
	return localStorage.getItem("token") || "";
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
	const headers: HeadersInit = {
		"Content-Type": "application/json",
		...(options.headers || {}),
	};
	const token = getToken();
	if (token) (headers as any).Authorization = `Bearer ${token}`;
	const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
	if (!res.ok) throw new Error(await res.text());
	return (await res.json()) as T;
}

export { API_BASE };
