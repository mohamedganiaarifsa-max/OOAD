# PetCare – Smart Pet Take Care Management System

PetCare is a comprehensive, multi-role pet take-care and veterinary clinic management system built with **React 19**, **TypeScript**, and **Vite**.

Designed for veterinary clinics, pet hospitals, and luxury pet boarding resorts, the system delivers tailored workflows and role-based access control (RBAC) across four user roles:
1. **Administrator (Admin)** – Full system oversight, staff roster, revenue analytics, and patient records.
2. **Veterinary Doctor (Doctor)** – Clinical diagnoses, symptoms, vital signs, prescriptions, and immunizations.
3. **Care Staff (Staff)** – Boarding reservations, daily feeding rounds, medication delivery, and grooming queues.
4. **Pet Owner (Owner)** – Protected, read-only pet health visibility, live suite biometrics, and itemized billing settlement.

---

## 1. Verified Demo Login Credentials

All four role accounts are pre-configured with active records and can be accessed via the Universal Sign-In portal (`/login`) or their dedicated role portals:

| Role | Portal URL | Email Address | Password | Workspace Dashboard | Permissions |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `/admin/login` | `admin@petcare.com` | `admin123` | `/admin/dashboard` | **All Modules & User Management** |
| **Veterinary Doctor** | `/doctor/login` | `doctor@petcare.com` | `doctor123` | `/doctor/dashboard` | **Clinical Medical Records & Prescriptions** |
| **Care Staff** | `/staff/login` | `staff@petcare.com` | `staff123` | `/staff/dashboard` | **Feeding, Med Delivery & Grooming** |
| **Pet Owner** | `/owner/login` | `owner@petcare.com` | `owner123` | `/owner/dashboard` | **Protected Read-Only Care & Payments** |

> **Note on Public Registration:**
> Visitors can register a new account directly from the login page using the **Create New Account** tab. By design, public registration is **strictly restricted to the Pet Owner role**. Staff, Doctor, and Administrator accounts must be provisioned by Hospital Administration through the User Management console (`/users`).

---

## 2. Role-Based Permissions & Owner Restrictions

The application enforces strict role-based access control at both the **User Interface** and the **Business Service Logic** layer (`DataService` & `AuthService`):

| Module / Action | Admin | Doctor | Staff | Pet Owner |
| :--- | :---: | :---: | :---: | :---: |
| **Pet Directory** (`/pets`) | View / Add / Delete (All) | View / Add / Delete (All) | View / Add / Delete (All) | **Own Pets Only** (Empty on new register) |
| **Booking & Boarding** (`/boarding`) | Full Edit & Status | Full Edit & Status | Full Edit & Status | **Read-Only Own Stays** (Cannot change status) |
| **Feeding Schedules** (`/feeding`) | Full Edit & Serve | Full Edit & Serve | Full Edit & Serve | **Read-Only Own Pets** (Cannot mark served) |
| **Medication Management** (`/medications`) | Prescribe & Administer | Prescribe & Administer | Administer Doses | **Read-Only Own Pets** (Cannot mark given) |
| **Vaccinations & Certificates** (`/vaccinations`) | Record & Issue | Record & Issue | View Records | **Own Pets' Records Only** |
| **Grooming & Spa Salon** (`/grooming`) | Schedule & Status | Schedule & Status | Schedule & Status | **Read-Only Own Pets** (Cannot change status) |
| **Clinical Medical Records** (`/records`) | Record & Review | Record & Review | View History | **Hidden & Blocked** (Clinical staff only) |
| **Smart Care Monitor** (`/smart-monitor`) | Live Telemetry (All) | Live Telemetry (All) | Live Telemetry (All) | **Own Boarded Pets Only** |
| **Invoices & Billing** (`/invoices`) | Full Management | View Billing | Create & Settle | **Own Invoices Only** (Settle pending bills) |
| **Reports & Excel Exports** (`/reports`) | Full Analytics & Excel | Full Analytics & Excel | Full Analytics & Excel | **Restricted / Admin & Clinical Only** |
| **User Management** (`/users`) | **Full Access** | Restricted | Restricted | Restricted |
| **System Notifications** (`/notifications`) | Broadcast & View | Broadcast & View | Broadcast & View | Role-Targeted Notices |

---

## 3. Strict Pet Owner Privacy & Data Isolation

1. **New Registrations Start Clean**:
   - Newly registered pet owners start with an empty pet list (`[]`).
   - Demo pets (Barnaby, Cleo, Kiwi, Snowball) belong strictly to demo account `usr_owner_01` (`owner@petcare.com`) and are never assigned to new owners.
2. **End-to-End Ownership Scoping**:
   - Every pet has a permanent `ownerId` attached at registration time.
   - `DataService` scopes all queries (pets, stays, feedings, medications, vaccinations, grooming, telemetry, invoices, notifications) to `ownerId === user.id`.
   - Cross-owner privacy: Owner A can never view, search, or access Owner B's pets, stays, or billing.
3. **Owner-Specific Billing & Payment Integrity**:
   - Owners can only view and settle their own pets' invoices.
   - Settle actions validate ownership at the service layer and reject attempts to pay other users' bills or settle already-paid invoices.
4. **Clinical Medical Records Hidden from Owners**:
   - In accordance with hospital protocol, clinical medical diagnoses and doctor notes are hidden from the owner sidebar and dashboard.
   - Route `/records` is guarded by role permissions, preventing direct URL access by pet owners.

---

## 4. Excel Export & Operational Reporting Suite

In the **Reports & Analytics** module (`/reports`), clinical administrators, doctors, and staff have access to a full SheetJS-powered Excel export engine:

1. **Individual Pet Comprehensive Dossier (`.xlsx`)**:
   - Select any pet from the system dropdown to generate a multi-worksheet Excel workbook.
   - Includes 8 dedicated worksheets:
     - `Pet Profile`: Microchip ID, breed, age, weight, allergies, owner contact.
     - `Boarding Stays`: Room tier, check-in/out dates, daily rates, stay status.
     - `Feeding Schedule`: Meal times, diet recipes, portion sizes, completion logs.
     - `Medications`: Prescriptions, dosages, frequencies, administration history.
     - `Vaccinations`: Vaccines administered, batch numbers, next due dates.
     - `Grooming Sessions`: Spa packages, scheduled times, stylist notes, status.
     - `Medical History`: Doctor diagnoses, vital signs, clinical symptoms, treatment plans.
     - `Invoices`: Itemized fees, GST calculations, payment methods, settlement status.
2. **Master Operations Workbook (`.xlsx`)**:
   - Single-click export compiling all registered hospital and resort patients, active boarders, upcoming vaccinations, and financial billing into a master multi-sheet spreadsheet.
3. **Modular Department Reports (`.xlsx`)**:
   - Instant 1-click exports for specific workflows: Boarding Stays, Vaccination Registry, Medication Logs, Feeding Schedules, Grooming Appointments, and Financial Billing.

---

## 5. Indian Rupee (INR – ₹) Standardized Pricing & Tax System

The entire application standardizes on **Indian Rupees (INR – ₹)** with formatting adhering to the Indian numbering system (`en-IN` locale, e.g. `₹1,500`, `₹10,000`, `₹1,25,000`) and standard Indian Goods and Services Tax (18% GST):

* **Boarding & Stay Rates**:
  * **Standard Kennel**: ₹950 / night
  * **Cat Condo**: ₹1,500 / night
  * **Deluxe Suite**: ₹2,500 / night
  * **VIP Penthouse**: ₹4,000 / night
* **Grooming & Salon Care**:
  * **Hydrotherapy Bath & Blow-dry**: ₹1,800
  * **Breed-Specific Styling & Coat Trim**: ₹2,400
  * **Paw Soak, Claw Therapy & Ear Care**: ₹1,600
* **Taxation & Financial Calculations**:
  * Invoices automatically calculate **18% GST** on services and subtotals.
  * Payment options: **Credit / Debit Cards**, **Cash at Front Desk**, and **UPI / NetBanking / Online Transfer**.
  * Financial KPI cards, revenue analytics, receipts, and invoices format with centralized `formatINR` utility.

---

## 4. Installation & Setup Instructions

### Prerequisites
* **Node.js**: Version 18+ or 20+ (LTS recommended)
* **npm**: Version 9+ or **bun** / **yarn** / **pnpm**

### Quickstart (macOS / Linux / Bash)

```bash
# 1. Install dependencies
npm install

# 2. Launch local development server
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

## 5. Running on Windows (Step-by-Step Instructions)

### Option A: Using Windows PowerShell or Windows Terminal (Recommended)

1. **Extract the Project Archive**:
   Right-click `petcare-project.zip` and select **Extract All...** to a folder of your choice (e.g., `C:\Projects\petcare`).

2. **Open PowerShell in the Project Directory**:
   Hold `Shift` and right-click inside the extracted folder, then select **Open PowerShell window here** (or open Windows Terminal and run `cd C:\Projects\petcare`).

3. **Install Dependencies**:
   ```powershell
   npm install
   ```

4. **Start the Development Server**:
   ```powershell
   npm run dev
   ```

5. **Open Browser**:
   Open Google Chrome, Microsoft Edge, or Firefox and navigate to:
   ```
   http://localhost:3000
   ```

### Option B: Using Windows Command Prompt (CMD)

```cmd
cd C:\Path\To\petcare
npm install
npm run dev
```

### Production Build & Preview on Windows

```powershell
# Build optimized production assets
npm run build

# Preview production build locally
npm run preview
```

---

## 6. Download Project ZIP Archive

A complete, self-contained project ZIP is packaged and available:
- **Direct in-app download**: Click the **Project ZIP** button in the top navigation bar or from the **Demo Credentials** modal.
- **Local file location**: `./petcare-project.zip` and `./public/petcare-project.zip`.
- **Re-generate ZIP command**:
  ```bash
  npm run zip
  ```

---

## 7. Architecture & Security Disclosure

* **Password Security**: New user registrations are hashed using SHA-256 via the Web Crypto API before local storage persistence. Demo accounts (`admin123`, `doctor123`, etc.) maintain backwards compatibility.
* **Non-Destructive Demo Data Reset**: Using the "Restore Demo Defaults" feature will refresh sample records and verify demo accounts without deleting custom accounts created by users.
* **Client-Side Storage Disclaimer**: In this demonstration application, data persistence is maintained using the browser's `localStorage`. For production healthcare and commercial use, transition to a dedicated server-side database (e.g., PostgreSQL / Cloud SQL) and stateless server-signed JWT tokens.
* **Simulated Telemetry Notice**: Real-time biometrics, ambient suite climate, and camera feeds in the Smart Care Monitor are simulated physiological telemetry models designed for evaluation and training.
