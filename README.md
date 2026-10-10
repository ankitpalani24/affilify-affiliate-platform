# Affilify — Dynamic Affiliate E-Commerce Platform

A production-ready, full-stack **Affiliate Product Discovery & Deal Catalog Platform** built with **React (Vite)**, **Node.js/Express**, and **MongoDB (Mongoose)** with an administrative control center, dynamic categories, product management, and real-time affiliate click-tracking engine.

---

## 🎯 Project Overview & Business Logic

This website is **NOT a traditional shopping cart or checkout store**. Instead, it is a high-converting affiliate product discovery portal where:
- Visitors discover curated deals across **Amazon**, **Flipkart**, **Myntra**, **Ajio**, **Nykaa**, and custom affiliate platforms.
- When customers click **"Buy Now"** or **"Buy on Amazon"**, they are tracked and seamlessly redirected via `302 HTTP Redirect` to your affiliate tracking URL.
- **Zero cart, zero checkout, zero inventory management, zero payment gateway overhead.**

---

## 🚀 Key Features

### 🌟 Storefront & Customer Experience
- **Dynamic Homepage**: High-impact Hero banner with top pick spotlight, category pills, trending deals, and platform shortcuts (Amazon, Flipkart, Myntra).
- **Comprehensive Catalog**: Live debounced search, category filtering, multi-store filtering, price slider/range, discount sorting, and view switchers.
- **Product Details**: Multi-image interactive gallery, discount breakdown ("You Save ₹X"), bullet-point specifications, FTC-compliant affiliate disclosure, and related deals.
- **Favorites / Saved Deals**: Locally-persisted wishlist for deal hunters.
- **FTC Affiliate Compliance**: Built-in disclosure page and trust badges for full Amazon Associates & Flipkart Affiliate compliance.

### 🛡️ Admin Management Portal (`/admin`)
- **Secure Authentication**: JWT-based protected admin routes with bcrypt password hashing.
- **Dashboard Overview**: Real-time KPI metrics, daily clicks trend chart (Recharts), network distribution share, and top clicked products.
- **Product Management**: Full CRUD, multi-image upload & URL preview, auto discount calculation, live slug generator, instant active/inactive visibility toggle, featured/trending badges, and direct affiliate link testing.
- **Category Management**: Create, edit, reorder, and activate/deactivate categories dynamically without editing code.
- **Affiliate Conversion Logs**: Real-time log stream recording timestamp, product, platform, visitor IP, and one-click **CSV Export**.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide React, Recharts, React Router DOM v6 |
| **Backend** | Node.js, Express.js, Multer (image uploads), Helmet, Morgan, CORS, Dotenv |
| **Database** | MongoDB with Mongoose (with hybrid fallback resilience) |
| **Authentication** | JSON Web Tokens (JWT) + BcryptJS password hashing |

---

## 📂 Project Structure

```text
ECS/
├── backend/
│   ├── .env                       # Backend environment configuration
│   ├── .env.example               # Template environment configuration
│   ├── uploads/                   # Uploaded product and category images
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js              # Database connection manager with auto-seed
│   │   ├── controllers/
│   │   │   ├── adminController.js # Admin authentication, stats & click analytics
│   │   │   ├── categoryController.js # Category CRUD & product count aggregation
│   │   │   ├── productController.js  # Product CRUD, filters, search & redirect
│   │   │   └── uploadController.js   # Local image file upload handler
│   │   ├── middleware/
│   │   │   ├── auth.js            # JWT protection middleware
│   │   │   └── upload.js          # Multer configuration
│   │   ├── models/
│   │   │   ├── Admin.js           # Admin user model
│   │   │   ├── AffiliateClick.js  # Click tracking log model
│   │   │   ├── Category.js        # Dynamic category model
│   │   │   └── Product.js         # Flexible product data model
│   │   ├── routes/
│   │   │   ├── adminRoutes.js     # /api/admin endpoints
│   │   │   ├── categoryRoutes.js  # /api/categories endpoints
│   │   │   ├── productRoutes.js   # /api/products endpoints
│   │   │   └── uploadRoutes.js    # /api/upload endpoints
│   │   ├── utils/
│   │   │   ├── seed.js            # Initial seed dataset
│   │   │   └── store.js           # In-memory fallback layer
│   │   └── server.js              # Express entry point
│   └── package.json
│
├── frontend/
│   ├── index.html                 # HTML shell with Google Fonts & SEO tags
│   ├── vite.config.js             # Vite config with API proxy
│   ├── tailwind.config.js         # Custom brand & affiliate colors configuration
│   ├── src/
│   │   ├── components/            # Reusable UI components (Navbar, Footer, ProductCard, etc.)
│   │   ├── context/               # AuthContext, ToastContext, WishlistContext
│   │   ├── pages/                 # Public pages (Home, Products, ProductDetails, Disclosure)
│   │   ├── pages/admin/           # Admin pages (Dashboard, Products, Form, Categories, Clicks, Settings)
│   │   ├── services/              # API client layer
│   │   ├── utils/                 # Currency, platform badge, and date formatters
│   │   ├── App.jsx                # Route declarations
│   │   ├── index.css              # Custom styling, animations & scrollbar
│   │   └── main.jsx               # React bootstrap
│   └── package.json
│
├── package.json                   # Root package runner with Concurrently
└── README.md
```

---

## ⚙️ Configuration & Environment Variables

Create or update `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecs_affiliate
JWT_SECRET=super_secret_ecs_affiliate_jwt_key_2026_secure
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:5173
ADMIN_DEFAULT_EMAIL=admin@affilify.com
ADMIN_DEFAULT_PASSWORD=Admin@123456
```

> **Connecting to your existing MongoDB / MongoDB Atlas:**
> Replace `MONGODB_URI` with your connection string:
> `MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ecs_affiliate?retryWrites=true&w=majority`

---

## 🏃 Running the Application

### Option A: Run Both Frontend and Backend Concurrently (Recommended)
From the root directory:
```bash
npm run dev
```

### Option B: Run Individually
**Backend:**
```bash
cd backend
npm run dev
```
*Backend runs at `http://localhost:5000`*

**Frontend:**
```bash
cd frontend
npm run dev
```
*Frontend runs at `http://localhost:5173`*

---

## 🔐 Admin Portal Access

1. Open `http://localhost:5173/admin/login`
2. Default Administrator Credentials:
   - **Email:** `admin@affilify.com`
   - **Password:** `Admin@123456`
   *(Or click the **"Fill Default Demo Credentials"** button on the login screen).*

---

## 📡 REST API Summary

### Public Product Endpoints
- `GET /api/products` — Filter products by category, brand, platform, price, featured, trending with pagination & sorting.
- `GET /api/products/slug/:slug` — Fetch single product with related category items.
- `GET /api/products/filters/meta` — Get available brands, stores, and price bounds for dynamic filters.
- `GET /api/products/:id/click` — Increments click counter, logs analytics event, and redirects (`302`) to partner URL.

### Category Endpoints
- `GET /api/categories` — Fetch all active categories with product counts.
- `POST /api/categories` — Add new category (Admin).
- `PUT /api/categories/:id` — Update category (Admin).
- `DELETE /api/categories/:id` — Delete category (Admin).

### Admin Endpoints
- `POST /api/admin/login` — Authenticate and receive JWT token.
- `GET /api/admin/dashboard` — Metric counts, 7-day click trend, platform distribution, top products.
- `GET /api/admin/clicks` — Paginated click logs with IP/timestamp.
- `POST /api/upload/single` — Upload product or category images.
