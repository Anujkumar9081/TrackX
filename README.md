<b>Live demo https://track-x-drab.vercel.app/login</b>

# TrackX — Smart Fleet Logistics, Trip Budgeting & Document Vault

TrackX is a comprehensive logistics and commercial fleet management web application designed for fleet owners and truck drivers. It streamlines trip dispatching, route planning, real-time highway amenity discovery, multi-expense budgeting, fuel theft ("Petrol Chori") auditing, vehicle maintenance tracking, and centralized digital compliance document storage.

---

## 📌 Project Overview & Development Credits

- **Backend Architecture & APIs**: Handcrafted and written by **Anuj Kumar** (Node.js, Express, MongoDB schemas, JWT authentication, and RESTful routing).
- **Frontend UI & Styling**: Built with the collaborative assistance of **AI** (React 19, Vite, responsive CSS Grid/Flexbox design, and interactive modals).

---

## 🚀 Key Features

### 1. Role-Based Authentication & Authorization
- **Multi-Role Access**: Dedicated workflows for **Fleet Owners** (`owner`) and **Truck Drivers** (`driver`).
- **Secure Token-Based Auth**: Passwords hashed with `bcryptjs` and session tokens issued using `jsonwebtoken` (JWT).
- **Protected Endpoints**: Secured via custom server middleware (`backend/Middleware/Auth.js`).

### 2. Fleet & Maintenance Management
- **Multi-Truck Management**: Register and switch between different commercial trucks in your fleet (e.g., Tata Signa, Ashok Leyland, BharatBenz).
- **10,000 km Service Counter**: Real-time maintenance countdown tracking distance covered against the recommended 10,000 km threshold.
- **One-Click Service Reset**: "Mark Serviced" action resets maintenance counters and logs vehicle health.

### 3. Interactive Route Planner (Point A ➔ Point B)
- **Logistics Corridor Select**: Instant routing for major Indian freight routes (e.g., Delhi ➔ Kanpur, Mumbai ➔ Pune, Jaipur ➔ Delhi, Ahmedabad ➔ Mumbai, Kolkata ➔ Patna).
- **Custom Distance Input**: Editable road distance in kilometers with automatic trip budget updates.
- **Interactive Map Canvas**: Visualizes journey route polyline, origin hub, destination hub, and truck markers using **Leaflet.js** and **OpenStreetMap**.
- **Widescreen Map Expansion**:
  - Horizontal expand arrow button (`[ ❯ Expand ]` / `[ ❮ Collapse ]`) expands the map into 100% full-width cinematic view.
  - **Persistent State**: Remembers your preferred view in `localStorage` so the map remains expanded even after refreshing the page.
- **Route Telemetry Footer**: Eliminates dead canvas space by displaying live corridor stats, road distance, fuel demand, and amenities status.

> [!NOTE]
> **Map & Routing Implementation Note:**
> TrackX utilizes **Leaflet.js** with **OpenStreetMap** (free, open-source). Because it plots geometric route coordinates without an expensive commercial turn-by-turn API, it is a simplified corridor visualization and is not as street-level traffic-accurate as proprietary Google Maps.

### 4. Highway Amenities (Petrol Pumps & Dhabas)
- **Petrol Pump Overlay**: Pinpoints roadside fuel stations with diesel prices (₹/L), high-flow commercial pumps, air/water facilities, and rest stops.
- **Highway Dhabas**: Identifies truck-friendly dhabas with driver ratings, pure veg/non-veg meals, hot showers, and safe overnight parking.
- **Interactive Toggles**: Turn petrol pumps and dhabas on/off independently on the map.

> [!NOTE]
> **Data Storage Note:**
> Nearest petrol pump and dhaba locations are currently powered by a **fixed, in-memory dataset** mapped along major logistics highways.

### 5. Multi-Expense Breakdown & Trip Budgeting
- **Automated Fuel Estimator**: Calculates expected fuel in liters based on the vehicle's standard mileage (`Distance / Mileage`) and fuel price (₹90/L).
- **Toll Tax (FASTag)**: Auto-calculated baseline toll fees, customizable per journey.
- **Food / Meals**: Dedicated expense tracking column for driver meals on the highway.
- **Water & Refreshments / Extra Expenses**: Dedicated tracking column for incidental travel and driver refreshment costs.
- **Total Trip Cost & ₹/km Rate**: Real-time aggregated budget banner showing cost efficiency per kilometer.

### 6. Anti-Theft ("Petrol Chori") Engine & Fuel Audit
- **Journey State Machine**: Track trips in `IDLE` or `IN TRANSIT` states.
- **Trip Audit Modal**: Drivers/owners enter final odometer readings and actual fuel liters pumped upon trip completion.
- **Theft Detection Algorithm**: Compares actual fuel burn against theoretical consumption based on vehicle mileage baseline. Automatically triggers alerts if suspected fuel pilferage or mechanical leaks exceed tolerance.

### 7. Digital Document Vault (Compliance Locker)
A complete paperless document locker organized into three clear categories:

1. **🚛 Truck Compliance Documents**:
   - Registration Certificate (RC)
   - Vehicle Insurance
   - Fitness Certificate
   - Pollution Under Control (PUC)
   - Goods Vehicle National Permit
   - Motor Vehicle Tax Clearance Proof
2. **👤 Driver & Personal Documents**:
   - Commercial Heavy Vehicle Driving Licence (DL)
   - Aadhaar Card (National Identity Proof)
   - PAN Card (Tax ID)
   - Passport / Voter ID
   - Driver Medical Fitness Certificate
3. **📋 Journey & Cargo Documents**:
   - GST E-Way Bill
   - Commercial Tax Invoice
   - Goods Receipt (Bilty / LR - Lorry Receipt)
   - Delivery Challan
   - Loading / Unloading Weight Slips

**Document Vault Capabilities**:
- **PDF & Image Upload**: Upload `.pdf`, `.png`, `.jpg`, `.jpeg`, and `.webp` files.
- **In-App Document Viewer**: Full-screen modal to preview uploaded documents (interactive PDF iframe viewer or high-res image modal).
- **One-Click Download**: Download official compliance files directly from the browser.
- **Document Management**: Add custom document types, input validity notes, and delete expired documents.
- **Local Persistence**: Saves uploaded files and status flags directly in `localStorage` so all documents persist across browser refreshes.

---

## 🛠️ Tech Stack & Libraries Used

### Backend

| Library / Tool | Version | Purpose in TrackX |
| :--- | :--- | :--- |
| **Node.js** | `>= 18` | JavaScript runtime engine powering the backend server. |
| **Express.js** | `^5.3.0` | Minimal, high-performance web framework for handling REST API routing, query parameters, and JSON payloads. |
| **MongoDB & Mongoose** | `^9.11.1` | NoSQL database and Object Data Modeling (ODM) library for managing Users, Truck Registrations, Trips, and Document schemas. |
| **JSON Web Token (`jsonwebtoken`)** | `^9.0.3` | Generates and verifies cryptographic bearer tokens for secure user authentication and RBAC. |
| **Bcryptjs (`bcryptjs`)** | `^3.0.3` | Hashes and salts user passwords to safeguard credentials against credential breaches. |
| **CORS (`cors`)** | `^2.8.6` | Configures Cross-Origin Resource Sharing so the React frontend can securely communicate with the Express server. |

### Frontend

| Library / Tool | Version | Purpose in TrackX |
| :--- | :--- | :--- |
| **React** | `^19.2.8` | Declarative component-based UI library powering dashboard state, modals, and reactive calculations. |
| **React DOM** | `^19.2.8` | DOM renderer for React components. |
| **Vite** | `^8.2.2` | Lightning-fast development server, hot module replacement (HMR), and production build bundler. |
| **React Router DOM** | `^7.18.4` | Single Page Application (SPA) client-side routing between Login, Signup, Dashboard, and Truck Registration pages. |
| **Leaflet** | `^1.9.4` | Open-source mobile-friendly interactive mapping library for drawing highway routes, truck positions, and custom amenity markers. |
| **Lucide React (`lucide-react`)** | `^1.58.0` | Comprehensive iconography suite for logistics, fuel, navigation, food, tools, documents, and interactive arrows. |
| **Oxlint** | `^1.79.0` | Ultra-fast linter to enforce JavaScript/React code hygiene and quality standards. |

---

## 📂 Project Directory Structure

```text
TrackX/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection handler with local fallback
│   ├── Database/
│   │   ├── Truck_registaion.js   # Mongoose model for registered trucks
│   │   └── Users.js              # Mongoose model for user credentials & roles
│   ├── Middleware/
│   │   └── Auth.js               # JWT verification & role protection middleware
│   ├── models/
│   │   ├── Document.js           # Schema for compliance documents
│   │   ├── Trip.js               # Schema for journey routes, mileage & fuel audits
│   │   ├── Truck.js              # Schema for truck specs & maintenance logs
│   │   └── User.js               # Schema for users
│   ├── routes/
│   │   ├── amenityRoutes.js      # Highway amenities API (Petrol pumps & Dhabas)
│   │   ├── documentRoutes.js     # Document vault upload & filter API
│   │   ├── tripRoutes.js         # Start trip, end trip & fuel theft audit API
│   │   └── truckRoutes.js        # Fleet fetch & 10,000 km maintenance reset API
│   ├── index.js                  # Main Express application entrypoint (Port 3000)
│   ├── package.json              # Backend dependencies & scripts
│   └── package-lock.json
│
├── frontend/
│   ├── public/                   # Static assets & icons
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx     # Main logistics hub: Map, Trip Controller & Vault
│   │   │   ├── Login.jsx         # User login with role redirect
│   │   │   ├── RegisterTruck.jsx # Fleet truck registration form
│   │   │   └── Signup.jsx        # Account registration with role selection
│   │   ├── Style/
│   │   │   ├── Dashboard.css     # Responsive dashboard layout, map & vault styles
│   │   │   ├── Login.css         # Authentication view styling
│   │   │   ├── RegisterTruck.css # Truck registration layout
│   │   │   └── Signup.css        # Signup screen styles
│   │   ├── App.jsx               # Route definitions
│   │   ├── index.css             # Global typography, CSS resets & variables
│   │   └── main.jsx              # React DOM root mounting
│   ├── index.html                # HTML5 entrypoint with Google Fonts
│   ├── package.json              # Frontend dependencies & scripts
│   └── vite.config.js            # Vite build configuration
│
└── README.md                     # Project documentation
```

---

## ⚙️ Installation & Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local community edition or MongoDB Atlas cloud connection)

---

### Step 1: Clone Repository
```bash
git clone https://github.com/<your-username>/TrackX.git
cd TrackX
```

---

### Step 2: Setup & Start the Backend

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. (Optional) Configure environment variables or use the default local database:
   - Default MongoDB URL: `mongodb://127.0.0.1:27017/signupdb`
   - Default Server Port: `3000`
4. Start the Express server:
   ```bash
   node index.js
   ```
   You should see:
   ```text
   server is running
   MongoDB Connected to database: signupdb
   ```

---

### Step 3: Setup & Start the Frontend

1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```text
   http://localhost:5173
   ```

---

## 🛣️ API Endpoints Reference

### Authentication
- `POST /signup` — Register a new account (`UserName`, `Email`, `Password`, `role`).
- `POST /login` — Authenticate user and receive a signed JWT token.

### Fleet & Maintenance
- `POST /registrations` — Register a new truck with driver details & license dates.
- `GET /truckRoutes` — Retrieve all trucks associated with the logged-in owner/driver.
- `PUT /truckRoutes/:truckNumber/reset-service` — Reset the 10,000 km maintenance counter.

### Trips & Fuel Audit
- `POST /tripRoutes/start` — Initiate a trip with planned distance, origin, destination, and budget.
- `POST /tripRoutes/end` — Submit final odometer & actual fuel liters; computes theft risk report.

### Amenities & Documents
- `GET /amenityRoutes/nearby?type=all|fuel|dhaba` — Return highway petrol pumps & dhabas.
- `GET /documentRoutes?category=TRUCK|DRIVER|JOURNEY` — Fetch stored compliance documents.
- `POST /documentRoutes/upload` — Upload and link a document to an owner and truck.

---

## 🔮 Future Roadmap

- [ ] **Live GPS Telematics Integration**: Connect physical OBD-II / IoT GPS tracker devices via WebSockets.
- [ ] **Google Maps Directions API**: Upgrade from straight-line corridor polylines to real-time traffic turn-by-turn navigation.
- [ ] **Cloud Storage for Files**: Integrate AWS S3 / Cloudinary for cloud-hosted document storage.
- [ ] **Automated FASTag & Toll Deduction**: Link real-time FASTag API for automated toll reconciliation.
- [ ] **WhatsApp & SMS Alerts**: Send automated maintenance and fuel theft alerts directly to truck owners.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).

