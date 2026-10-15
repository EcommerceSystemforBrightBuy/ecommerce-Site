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
| Member 2 - Hasin Amanda| Order Processing & Atomic Checkout (End-to-End) | Done |
| Member 3 | Auth, Customer & Cart | _TODO_ |
| Member 4 - Thimira Nuraj | Staff Personnel & Central Warehouse Inventory | Done |
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

### Member 2 – Hasin Amanda: Order Processing, Atomic Checkout & Initial UI Design

**Responsibility**
- Initial website UI creation & frontend architecture (design system, global layout, responsive navigation, and Airbnb-inspired component styling).
- Customer checkout flow, atomic inventory deduction, PayHere gateway integration, and Admin Order Dispatch queue.

**Features**
- **Initial Website UI & Layout Architecture**:
  - Architected the foundational Next.js frontend design system, global theme styling (`globals.css`), typography tokens, and responsive layout foundations.
  - Implemented the sticky modern Navbar with Texas Central Warehouse stock pill indicators, destination city picker, animated expanding catalog navigation button, and live cart count pill.
  - Created the dynamic Hero Banner carousel (`components/HeroCarousel.jsx`) featuring responsive image scaling, ambient backdrop blurring, automated rotation, and touch/mouse controls.
  - Built customer storefront card components, Texas commerce value badges (Free Statewide Delivery, 24h Store Pickup, Central WH Stock, PayHere Gateway), and the interactive Side-by-Side Product Detail layout (`app/products/[id]/page.js`) pairing high-resolution hardware showcases with the sticky Buy Now reservation box.
- **Atomic Checkout**: Orders are booked through a database stored procedure (`sp_checkout_order`) within an ACID transaction (`START TRANSACTION ... COMMIT / ROLLBACK`), inserting `order`, `order_item`, `delivery`, `payment`, and decrementing `inventory.quantity_on_hand` while recording audit logs into `inventory_transaction`.
- **Negative Stock Prevention**: Database trigger `trg_prevent_negative_inventory` guarantees inventory levels can never drop below zero.
- **PayHere Payment Gateway**: Supports Card payments via PayHere Sandbox with cryptographic MD5 signature verification (`md5sig`) on IPN notifications (`/api/orders/payhere-notify`) and Cash on Delivery (COD).
- **Texas Ground Fulfillment**: Dynamic shipping calculations with Texas city tiers (5 business days for main metro hubs, 7 business days for regional Texas, +3 days replenishment buffer) and 24h store pickup option.
- **Admin Dispatch Queue**: Live management interface for warehouse staff and administrators to inspect itemized order SKUs, verify payment confirmation, and advance order dispatch states (`pending` → `processing` → `dispatched` → `delivered`).

**API routes** (`/api/orders`)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/orders` | Place order atomically via `sp_checkout_order` (body: customer details, items, delivery mode, address, payment method) |
| GET | `/api/orders` | Fetch customer orders / admin dispatch queue (supports `?customer_id=...` filter) |
| GET | `/api/orders/:id` | Fetch order details, customer contact, delivery info, and itemized variant SKUs |
| PUT | `/api/orders/:id/status` | Update order and delivery dispatch status (`pending`, `dispatched`, `delivered`, `failed`) |
| POST | `/api/orders/payhere-params` | Generate PayHere Sandbox checkout credentials, payload, and secure MD5 hash |
| POST | `/api/orders/payhere-notify` | PayHere IPN webhook callback with server-side MD5 signature verification |

**Database work**
- **Stored Procedures**: `sp_checkout_order` in `backend/database/procedures.sql` for atomic order creation, primary item insertion, inventory decrement, delivery scheduling, and payment initialization.
- **Triggers**: `trg_prevent_negative_inventory` in `backend/database/triggers.sql` (`BEFORE UPDATE ON inventory`) to prevent negative stock.
- **Functions**: `fn_calculate_delivery_days(p_city_id, p_in_stock)` in `backend/database/functions.sql` with resolved parameter shadowing.
- **Tables involved**: `order`, `order_item`, `delivery`, `payment`, `inventory`, `inventory_transaction`, `customer_address`, `city`.

**Main files**
- Frontend Core & UI Design: `components/Navbar.jsx`, `components/HeroCarousel.jsx`, `app/globals.css`, `app/layout.js`, `app/page.js` (home storefront & trust strip), `app/products/[id]/page.js` (side-by-side product view & Buy Now card)
- Frontend Checkout & Dispatch: `app/checkout/page.js` (delivery mode & shipping address), `app/checkout/payment/page.js` (PayHere gateway / COD), `app/checkout/confirmation/page.js` (live order receipt), `app/admin/orders/page.js` (dispatch queue & live status updates)
- Backend: `controllers/orderController.js`, `routes/orderRoutes.js`, `database/procedures.sql`, `database/triggers.sql`, `database/functions.sql`

### Member 3 – Nimsara R.P.S. (240464N): Customer Auth, Profile & Cart

**Features**
- Customer registration: name, email, phone, Texas city (loaded from the database), street address, ZIP and password with confirmation. The server validates every field. The new account, customer record and default address are created in one database transaction, and the customer is signed in straight away.
- Customer login: email and password are checked against a bcrypt hash (`bcryptjs`, 10 rounds). Passwords are never stored or returned in plain text. An unknown email and a wrong password give the same error message, so the form cannot be used to find out which emails are registered. Only `customer` accounts can use this login.
- Login persistence: the signed-in customer is kept in `localStorage` (`brightbuy_user`) and restored when the page reloads (`ShopContext.jsx`).
- Profile page (`/account`): shows the customer's details and lets them change their phone number and default delivery address. Phone and address are updated in one transaction, so both change or neither does.
- Persistent cart: for a registered customer the cart is stored in the database (`cart`, `cart_item`), so it survives logout and reload. Adding a variant that is already in the cart increases its quantity. Quantities are limited to 1–99.
- Guest cart: guests can browse and fill a cart, which is kept in `localStorage` (`brightbuy_guest_cart`). Checkout needs a registered customer. When a guest signs in or registers, the guest cart is merged into the saved cart in one transaction (`POST /api/cart/sync`).
- The cart page shows live stock for each item. Out-of-stock items are allowed and shown as backorder (+3 days delivery).

**API routes** (`/api/auth`, `/api/customers`, `/api/cart`, `/api/cities`)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/auth/register` | Register a customer (calls `sp_register_customer`) |
| POST | `/api/auth/login` | Customer login, returns the customer profile |
| GET | `/api/customers/:id` | Customer profile with default address and city |
| PUT | `/api/customers/:id` | Update phone and/or default address (city, street, ZIP) |
| GET | `/api/cart/:customerId` | Saved cart with product, variant, price and live stock |
| POST | `/api/cart/items` | Add an item (quantity is added to any existing quantity) |
| PUT | `/api/cart/items` | Set an exact quantity (`0` removes the item) |
| DELETE | `/api/cart/:customerId/items/:variantId` | Remove one item |
| DELETE | `/api/cart/:customerId` | Empty the cart |
| POST | `/api/cart/sync` | Merge a guest cart into the saved cart after login (one transaction) |
| GET | `/api/cities` | Texas cities for the register and profile forms |

`POST /api/auth/admin-login` (staff portal login) was added later by Member 2 together with the admin pages.

**Registration behaviour**
- Missing fields, an invalid email or a password shorter than 6 characters return `400`.
- A registered email returns `409 An account with this email already exists` (raised by the procedure with `SIGNAL`, and also protected by the unique key `uq_user_email`).
- An unknown city returns `400 Please choose a valid Texas city`.
- A wrong email or password returns `401 Invalid email or password`.

**Database work** (`backend/database/member3_auth_cart.sql`)
- Stored procedure `sp_register_customer`: runs `START TRANSACTION`, inserts into `user`, `customer` and `customer_address`, then `COMMIT`. An `EXIT HANDLER FOR SQLEXCEPTION` does `ROLLBACK` and `RESIGNAL`, so a failure leaves nothing half-created. It checks for a duplicate email and an unknown city first (`SIGNAL SQLSTATE '45000'` with `EMAIL_EXISTS` / `INVALID_CITY`), builds the ids with `UUID()` so two registrations at the same moment cannot clash, and returns the new `user_id`, `customer_id` and `address_id`.
- Seed data: 13 Texas cities in `city` (5 main cities, 8 regional) with `INSERT IGNORE`. `customer_address.city_id` is a foreign key, so these rows are needed before anyone can register.
- Cart: one cart per customer (`uq_cart_customer`) and one row per variant per cart (`uq_cart_variant`). Adding an item uses `INSERT ... ON DUPLICATE KEY UPDATE`, so the database itself prevents duplicate rows. `chk_cart_item_qty` rejects quantities below 1, and cart items are removed automatically if their variant is deleted (`ON DELETE CASCADE`).
- Tables involved: `user`, `customer`, `customer_address`, `city`, `cart`, `cart_item`.
- All queries are parameterised (`?`) to prevent SQL injection, and the password hash is never sent to the browser.

**Main files**
- Database: `backend/database/member3_auth_cart.sql`
- Backend: `controllers/authController.js`, `controllers/customerController.js`, `controllers/cartController.js`, `routes/authRoutes.js`, `routes/customerRoutes.js`, `routes/cartRoutes.js`, `routes/cityRoutes.js`, `scripts/resetSeedPasswords.js`
- Frontend: `app/login/page.js`, `app/register/page.js`, `app/account/page.js`, `app/cart/page.js`, `context/ShopContext.jsx`

**Notes and limitations**
- There is no token (JWT) or session check on the server. The API trusts the `customerId` it is sent, so a customer's profile and cart could be read by anyone who knows the id. Adding JWT and an auth middleware is the next step.
- There is no password reset, email verification or limit on login attempts.

### Member 4: Staff Personnel & Central Warehouse Inventory (End-to-End)

**Responsibility**
- Staff onboarding, roles, status tracking, and directory CRUD.
- Central Texas Warehouse SKU inventory count monitoring, rapid adjustments, and transaction audit logging.

**Features**
- **Warehouse Inventory & Stock Adjustments**: Real-time warehouse catalog view displaying all SKUs, stock levels, and replenishment status with quick one-click increment/decrement adjustments (`+10`, `-1`). Every adjustment automatically records an audit log in `inventory_transaction`.
- **Dynamic Delivery Transit Days Calculation**: Stored function `fn_calculate_delivery_days` calculates delivery transit duration based on destination Texas city tiers (5 business days for main hubs vs 7 business days for regional hubs, with an additional +3 day buffer if stock is depleted).
- **Staff Personnel Management**: Complete lifecycle directory for warehouse staff and administrators (view hub staff, onboard new personnel, edit profile details/hubs, and deactivate/delete staff records) updating Aiven MySQL live.

**API routes** (`/api/inventory`, `/api/staff`)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/inventory` | List all warehouse variant SKUs, product names, and quantity on hand |
| PUT | `/api/inventory/:sku` | Adjust stock count (`+10`, `-1`, or custom delta) & insert audit entry in `inventory_transaction` |
| GET | `/api/staff` | List all hub personnel with profiles and active status |
| POST | `/api/staff` | Onboard new staff member (`user` + `staff_profile`) |
| PUT | `/api/staff/:id` | Update staff details, job title, hub location, or status |
| DELETE | `/api/staff/:id` | Remove or deactivate staff member |

**Database work**
- **Stored Functions**: `fn_calculate_delivery_days(p_city_id, p_in_stock)` in `backend/database/functions.sql` calculating dynamic Texas delivery estimates.
- **Transactional Queries**: Atomic inventory updates and transaction logging (`inventory`, `inventory_transaction`).
- **Tables involved**: `staff_profile`, `user`, `inventory`, `inventory_transaction`, `city`, `product_variant`.

**Main files**
- Frontend Admin Inventory: `src/app/admin/inventory/page.js` (stock list and `+10`/`-1` adjustment actions)
- Frontend Admin Staff: `src/app/admin/staff/page.js` (directory list), `src/app/admin/staff/new/page.js` (onboarding form), `src/app/admin/staff/[id]/edit/page.js` (profile editor)
- Backend: `src/controllers/staffController.js`, `src/routes/staffRoutes.js`, `database/functions.sql`

### Member 5 – Abeykoon AJPGP. (240009C): Executive Management Reports

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
