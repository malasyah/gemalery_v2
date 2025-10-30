# Gemalery v2

Full-stack MERN app (Express + MongoDB Atlas + React Vite TS) for Gemalery store.

## Quick start

1) Backend
- cd server
- Copy env and set values:
  - PORT=4000
  - MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority&appName=<app>
  - JWT_SECRET=<strong_secret>
  - CORS_ORIGIN=http://localhost:5173
  - RAJAONGKIR_API_KEY=<optional>
  - RAJAONGKIR_BASE=https://api.rajaongkir.com/pro (optional for waybill)
  - MIDTRANS_SERVER_KEY=<optional sandbox/prod>
  - MIDTRANS_BASE=https://api.sandbox.midtrans.com/v2
- npm run dev

2) Frontend
- cd client
- Create .env.local (optional):
  - VITE_API_BASE=http://localhost:4000
  - VITE_ORIGIN_CITY_ID=<RajaOngkir origin city_id, e.g. 501>
- npm run dev

## Roles & flows
- Admin: full CRUD (users, products, variants, category costs), approve employee destructive actions, orders processing/shipping/delivery, transactions, reports.
- Employee: can view all, can add, update/delete require admin approval headers.
- Customer/Guest: browse products, cart/checkout, shipping via JNE, payment (Midtrans VA/QRIS), tracking.

## Key endpoints (backend)
- Auth: POST /auth/register, /auth/login; GET /auth/me
- Products: GET /products, GET /products/:id, POST /products, PUT /products/:id, DELETE /products/:id
- Addresses: GET/POST/PUT/DELETE /addresses
- Cart: GET /cart, POST /cart/add, PUT /cart/item, DELETE /cart/item, POST /cart/attach
- Checkout: POST /checkout/shipping/quote, POST /checkout/create, POST /checkout/payment/notify
- Orders: GET /orders, POST /orders/:id/process|ship|deliver|cancel, GET /orders/:orderCode/tracking
- Transactions: POST/GET /transactions/in, POST/GET /transactions/out, reports at /transactions/reports/*

Admin approval for Employee update/delete: add headers
- x-admin-username: <admin_username>
- x-admin-password: <admin_password>

## Deployment
- GitHub
  - git add . && git commit -m "init"
  - Create repo on GitHub and set origin: git remote add origin <repo-url>
  - git push -u origin main
- Server (Render/Railway/other):
  - Service root: `server`
  - Build: `npm install && npm run build`
  - Start: `npm start`
  - Env: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `RAJAONGKIR_*`, `MIDTRANS_*`
- Client (Vercel/Netlify):
  - Root: `client`
  - Build: `npm install && npm run build`
  - Output: `client/dist`
  - Env: `VITE_API_BASE` pointing to server URL

## Notes
- RajaOngkir waybill requires Pro; without it, tracking returns stub data.
- Midtrans: set server key for real VA/QRIS. Webhook: `/checkout/payment/notify`.
