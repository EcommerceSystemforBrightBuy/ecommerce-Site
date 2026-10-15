# BrightBuy – Texas Digital Commerce

BrightBuy is a database-driven e-commerce system for Texas customers, built as a university database project.

| Layer    | Tech                                   | Hosting        |
|----------|----------------------------------------|----------------|
| Database | MySQL                                  | Aiven          |
| Backend  | Node.js, Express 5, mysql2             | Render         |
| Frontend | Next.js (React)                        | Vercel         |
| Containers | Docker, Docker Compose               | Local / self-hosted |

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
| Member 5 - Gayashan | Management Reports (SQL views and admin report pages) | Done |

### Member 1 – Kalaippiriyan J(240308R): Products, Variants & Catalogue

**Features**
- Product CRUD for admins (create, edit, list, delete) with server-side validation. Create and update run inside a database transaction, so a failure rolls everything back.
- Products have many variants. Each variant has its own SKU, price, stock and default flag.
- Variants use soft delete (`product_variant.is_active`), so history is kept. A default variant is always kept active (fallback is re-assigned).
- Variant attributes (colour, storage, etc.) are stored in `product_attribute`.
- A product can belong to many categories (`product_category`).
- Storefront: product list with backend filters (category, brand/name/SKU search, debounced), and a product detail page with variant chips, attributes and stock.
- Product reviews and ratings (product detail page):
  - Summary box with the average (e.g. `3.4 /5`), star display and the number of ratings, plus a 5★ to 1★ breakdown bar chart. Stars are yellow everywhere for a familiar, consistent look.
  - "Product Reviews" toolbar with **Sort** (Newest, Highest rating, Lowest rating) and **Filter** by star (All star, 5 star … 1 star). Both run in the browser on the list returned by the API.
  - Review list as full-width rows (stars, date, reviewer name, text), showing the first 3 with a "Show all N reviews" / "Show fewer reviews" toggle.
  - Review form for logged-in customers: interactive star picker with labels (Poor to Excellent), optional text (max 500 characters, with counter), and inline success or error messages. Submit stays disabled until a rating is chosen. Logged-out visitors see a "Log in" prompt. One review per customer per product.
  - Reviews can also be submitted from the customer's orders page (`app/account/orders/page.js`) through the same endpoint.

**API routes** (`/api/products`, `/api/categories`)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/products` | List products (query: `category`, `search`) |
| GET | `/api/products/admin` | Products with variants for the admin list |
| GET | `/api/products/:id` | Product detail with active variants and attributes |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product, categories, variants and attributes |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/products/:id/reviews` | Reviews for a product, newest first (`getProductReviews`). Reviewer shown as `customer_name`, first name and last initial only (e.g. `Kalai S.`) |
| POST | `/api/products/feedback` | Add a review (`addProductFeedback`). Body: `productId`, `customerId`, `rating` (whole number 1–5), `review` (up to 500 chars). Returns `201 { success: true }` |
| GET | `/api/categories` | All categories |

**Review endpoint behaviour** (`addProductFeedback`)
- Validates the customer id, rating (integer 1–5) and review length (max 500 characters).
- Runs in a transaction: checks the customer and an active product exist, then inserts the review with a generated `FB###` id (retries up to 3 times on an id clash).
- One review per customer per product (`uq_feedback`): a second review returns `409 You have already reviewed this product`.
- Other errors: `400` invalid input or customer, `403` customer not found, `404` product not found.

**Database work**
- Tables: `product`, `product_variant`, `product_attribute`, `category`, `product_category`, `inventory`, `product_feedback`.
- Indexes: composite `idx_variant_product_default (product_id, is_default, is_active)`, `idx_product_brand`, `idx_attribute_variant`, plus unique keys `uq_variant_sku`, `uq_category_name`, `uq_feedback (product_id, customer_id)`.
- All queries are parameterised (`?`) to prevent SQL injection.
- Shared helpers in `backend/src/utills/dbHelpers.js` (`nextId`, `validateVariant`, `insertVariant`, `insertAttributes`, `insertCategories`).

**Main files**
- Backend: `controllers/productController.js`, `routes/productRoutes.js`, `routes/categoryRouter.js`, `utills/dbHelpers.js`
- Frontend: `app/products/page.js`, `app/products/[id]/page.js` (product detail, reviews section), `app/admin/products/` (list, new, `[id]/edit`)

### Member 2: _TODO_
_Features, API routes, DB objects, pages._

### Member 3: Auth, Customer & Cart _(confirm and fill in)_
_Registration and login (`/api/auth`), customer profile and addresses (`/api/customers`), cart (`/api/cart`), `sp_register_customer` procedure._

### Member 4: _TODO_
_Features, API routes, DB objects, pages._

### Member 5 – Abeykoon AJPGP. (<240009C>): Executive Management Reports

**Features**
- Five management reports, each built the same way: a SQL view in MySQL, an Express endpoint that reads the view, and an admin page that displays it.
- Report 1, **Quarterly sales**: orders, units and revenue per quarter, with a year selector and summary cards (total revenue, orders, average order value).
- Report 2, **Top-selling products**: products ranked by units sold, then gross revenue, with a period selector (This Month, This Quarter, Year-to-Date, All Time).
- Report 3, **Category-wise orders**: number of orders per category, shown as bars with a share percentage. Categories with no orders still appear with 0.
- Report 4, **Delivery time estimates**: upcoming (not delivered, not cancelled) orders with destination city, main or regional city, delivery status, estimated arrival date and days remaining. Past-due orders are flagged "Overdue".
- Report 5, **Customer order summary**: every registered customer with lifetime orders, total spent, Card vs Cash on Delivery counts, and paid vs pending payments. Includes a name/email search.
- Every report page has loading, error and "no data" states and a print button. A reports directory page links to all five.

**API routes** (`/api/reports`)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/reports/quarterly-sales?year=2026` | Quarterly sales for a year (defaults to the current year) |
| GET | `/api/reports/top-selling?period=ytd` | Top 10 products. `period`: `month`, `quarter`, `ytd`, `all` |
| GET | `/api/reports/category-orders` | Order count per category |
| GET | `/api/reports/delivery-estimates` | Upcoming deliveries, ordered by estimated arrival date |
| GET | `/api/reports/customer-summary` | Per-customer order and payment summary, highest spend first |

**Database work** (`backend/database/views.sql`)
- `v_quarterly_sales`: groups by `YEAR` and `QUARTER` of `order_date`. Revenue is `SUM(order_item.subtotal)`, not `order.total_amount`, so orders with several items are not double counted. `COUNT(DISTINCT order_id)` gives the order count.
- `v_top_selling_products`: joins `order_item` to `product_variant` to `product`, because sales are recorded per variant but reported per product. It returns one row per product per day, so Express can filter by period and add the days up.
- `v_category_order_totals`: starts from `category` with `LEFT JOIN`s so empty categories are kept. An order containing products from two categories counts once in each.
- `v_delivery_time_estimates`: joins `order`, `delivery`, `customer`, `user`, and reaches the city through `delivery_address_id` to `customer_address` to `city`. These are `LEFT JOIN`s, so Store Pickup orders and orders without an address still appear. `days_remaining` is `DATEDIFF(estimated_delivery_date, CURDATE())`.
- `v_customer_order_summary`: starts from `customer` so customers with no orders appear. Uses `SUM(payment_method = 'Card Payment')`-style counts and `COALESCE` to turn NULL into 0.
- Cancelled orders are excluded from every report.
- A view cannot take parameters, so the views return all years and dates, and the filters (`WHERE sales_year = ?`, `WHERE sales_date >= ?`) are applied in the Express query.
- Query results are converted with `Number()` / `parseFloat()` before being sent, because MySQL returns `SUM` and `DECIMAL` values as strings.
- Views only read data, so they are always current and never need refreshing. Re-run `views.sql` only when a view's definition changes.

**Main files**
- Database: `backend/database/views.sql`
- Backend: `controllers/reportController.js`, `routes/reportRoutes.js` (registered in `server.js` as `/api/reports`)
- Frontend: `app/admin/reports/page.js` (directory), and `quarterly-sales`, `top-selling`, `category-orders`, `delivery-estimates`, `customer-summary` (each `page.js`)

**Notes and limitations**
- The report endpoints have no login or role check yet (see the authentication note below), so anyone who knows the URL can read them.
- The top-selling report shows the top 10 products only.
- The delivery report shows the estimated date stored by checkout. The 5-day / 7-day / +3-day rule is calculated at order time, not in this report.

---

## Project Structure

```
docker-compose.yml  runs backend + frontend containers
backend/
  Dockerfile
  database/        schema.sql, seed.sql, procedures.sql, functions.sql, triggers.sql, views.sql
  src/
    config/        db.js (mysql2 pool)
    controllers/   auth, cart, customer, order, product, report
    routes/        one router per controller
    utills/        shared DB helpers
    server.js
frontend/
  Dockerfile
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

### 4. Docker (optional)

Run the backend and frontend as containers instead of installing Node locally. The database stays on Aiven, so `backend/.env` (see step 2) is still required.

`backend/Dockerfile`
```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
ENV PORT=8000
EXPOSE 8000
CMD ["node", "src/server.js"]
```

`frontend/Dockerfile`
```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_URL=$NEXT_PUBLIC_URL
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "start"]
```

`.dockerignore` (in both `backend/` and `frontend/`) keeps `node_modules`, `.env*` and, for the frontend, `.next` out of the image.

`docker-compose.yml` (repo root)
```yaml
services:
  backend:
    build: ./backend
    env_file: ./backend/.env
    ports:
      - "8000:8000"

  frontend:
    build:
      context: ./frontend
      args:
        NEXT_PUBLIC_URL: http://localhost:8000
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

Run:
```bash
docker compose up --build
```
Frontend: http://localhost:3000, API: http://localhost:8000/api/products

Notes:
- `NEXT_PUBLIC_URL` is baked in when the frontend image is **built**. After changing it, rebuild (`docker compose up --build`); restarting is not enough.
- The `PORT` in `backend/.env` must match the port mapped in `docker-compose.yml` (8000 above).
- The browser calls the API directly, so for a server deployment set `NEXT_PUBLIC_URL` to the backend's public URL, not `localhost`.
- Never copy `.env` into an image. Pass it at runtime with `env_file`.

## Deployment

- **Docker:** see "Docker (optional)" above. The live site itself runs on Render and Vercel, not Docker.
- **Render (backend):** root directory `backend`, start command `node src/server.js`, set the `DB_*` environment variables.
- **Vercel (frontend):** root directory `frontend`, set `NEXT_PUBLIC_URL` to the Render URL.
- **Aiven (database):** allow the Render IP / `0.0.0.0/0` in the allowlist.

## Notes

- Authentication currently stores the logged-in customer in the browser (`localStorage`, key `brightbuy_user`) and sends `customerId` with requests (cart, reviews). There is no token verification on the server yet.
- Run `npm run build` in `frontend/` before pushing to catch build errors that would fail the Vercel deploy.
