# BrightBuy – Texas Digital Commerce

BrightBuy is a database-driven e-commerce system for Texas customers, built as a university database project.

| Layer    | Tech                                   | Hosting        |
|----------|----------------------------------------|----------------|
| Database | MySQL                                  | Aiven          |
| Backend  | Node.js, Express 5, mysql2             | Render         |
| Frontend | Next.js (React)                        | Vercel         |

**Live site:** https://brightbuy-zeta.vercel.app
**API:** https://brightbuy-backend.onrender.com/api

> The backend runs on Render's free tier, so the first request after a period of inactivity can take 30–60 seconds (cold start).

---

## Team & Contributions

> Each member: replace the placeholder section below with your own work (features, API routes, DB objects, pages). Keep the same format.

| Member | Module | Status |
|--------|--------|--------|
| Member 1 – Kalai | Products, Variants & Catalogue | Done |
| Member 2 | _TODO_ | _TODO_ |
| Member 3 | _TODO | _TODO |
| Member 4 | _TODO_ | _TODO_ |
| Member 5 | _TODO_ | _TODO_ |

### Member 1 – Kalaippiriyan J(240308R): Products, Variants & Catalogue

**Features**
- Product CRUD for admins (create, edit, list, delete) with server-side validation. Create and update run inside a database transaction, so a failure rolls everything back.
- Products have many variants. Each variant has its own SKU, price, stock and default flag.
- Variants use soft delete (`product_variant.is_active`), so history is kept. A default variant is always kept active (fallback is re-assigned).
- Variant attributes (colour, storage, etc.) are stored in `product_attribute`.
- A product can belong to many categories (`product_category`).
- Storefront: product list with backend filters (category, brand/name/SKU search, debounced), and a product detail page with variant chips, attributes and stock.
- Product reviews and ratings: average rating, star breakdown, "show all" list, and a review form for logged-in customers (one review per customer per product).

**API routes** (`/api/products`, `/api/categories`)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/products` | List products (query: `category`, `search`) |
| GET | `/api/products/admin` | Products with variants for the admin list |
| GET | `/api/products/:id` | Product detail with active variants and attributes |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product, categories, variants and attributes |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/products/:id/reviews` | Reviews for a product (reviewer first name and last initial only) |
| POST | `/api/products/:id/reviews` | Add a review (`customerId`, `rating` 1–5, `review` up to 500 chars) |
| GET | `/api/categories` | All categories |

**Database work**
- Tables: `product`, `product_variant`, `product_attribute`, `category`, `product_category`, `inventory`, `product_feedback`.
- Indexes: composite `idx_variant_product_default (product_id, is_default, is_active)`, `idx_product_brand`, `idx_attribute_variant`, plus unique keys `uq_variant_sku`, `uq_category_name`, `uq_feedback (product_id, customer_id)`.
- All queries are parameterised (`?`) to prevent SQL injection.
- Shared helpers in `backend/src/utills/dbHelpers.js` (`nextId`, `validateVariant`, `insertVariant`, `insertAttributes`, `insertCategories`).

**Main files**
- Backend: `controllers/productController.js`, `routes/productRoutes.js`, `routes/categoryRouter.js`, `utills/dbHelpers.js`
- Frontend: `app/products/page.js`, `app/products/[id]/page.js`, `app/admin/products/` (list, new, `[id]/edit`)

### Member 2: _TODO_
_Features, API routes, DB objects, pages._

### Member 3: Auth, Customer & Cart _(confirm and fill in)_
_Registration and login (`/api/auth`), customer profile and addresses (`/api/customers`), cart (`/api/cart`), `sp_register_customer` procedure._

### Member 4: _TODO_
_Features, API routes, DB objects, pages._

### Member 5: _TODO_
_Features, API routes, DB objects, pages._

---

## Project Structure

```
backend/
  database/        schema.sql, seed.sql, procedures.sql, functions.sql, triggers.sql, views.sql
  src/
    config/        db.js (mysql2 pool)
    controllers/   auth, cart, customer, order, product, report
    routes/        one router per controller
    utills/        shared DB helpers
    server.js
frontend/
  src/app/         Next.js pages (products, cart, checkout, account, admin, login, register)
  src/context/     ShopContext.jsx (current user + cart state)
```

## Getting Started

### 1. Database
Create a MySQL database, then run the scripts from `backend/database/` in this order:

```sql
source schema.sql;
source procedures.sql;
source functions.sql;
source triggers.sql;
source views.sql;
source seed.sql;
```

`member3_auth_cart.sql` holds the auth/cart additions; run it if your `schema.sql` does not already include them.

> Aiven runs MySQL in strict mode (`ONLY_FULL_GROUP_BY`, `STRICT_ALL_TABLES`, `ANSI_QUOTES`), so use single quotes for string literals in SQL.

### 2. Backend
```bash
cd backend
npm install
npm run dev        # or: npm start
```
Create `backend/.env` (never commit it):
```
PORT=8000
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
Create `frontend/.env.local` (never commit it):
```
NEXT_PUBLIC_URL=http://localhost:8000
```
`NEXT_PUBLIC_URL` is baked in at build time, so redeploy the frontend after changing it.

## Deployment

- **Render (backend):** root directory `backend`, start command `node src/server.js`, set the `DB_*` environment variables.
- **Vercel (frontend):** root directory `frontend`, set `NEXT_PUBLIC_URL` to the Render URL.
- **Aiven (database):** allow the Render IP / `0.0.0.0/0` in the allowlist.

## Notes

- Authentication currently stores the logged-in customer in the browser (`localStorage`, key `brightbuy_user`) and sends `customerId` with requests (cart, reviews). There is no token verification on the server yet.
- Run `npm run build` in `frontend/` before pushing to catch build errors that would fail the Vercel deploy.
