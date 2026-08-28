# EcoMind - AI-Powered Sustainability Diagnosis & Decision Engine

> **Tagline**: "Diagnose before you decarbonize."

EcoMind is a complete full-stack web application that turns company documents (utility bills, spreadsheets, meter logs, PDFs, CSVs) into sustainability insights, deterministic EcoScore calculations, AI root-cause diagnosis, what-if scenario simulations, and action plans.

---

## Complete User Workflow

```
HOME
 ↓
START ANALYSIS
 ↓
MODULE SELECTION (/modules)
 ↓
ADAPTIVE SURVEY (/survey/energy)
 ↓
DOCUMENT UPLOAD (/data)
 ↓
AUTOMATIC DATA EXTRACTION & VALIDATION
 ↓
SUSTAINABILITY CALCULATIONS & ECOSCORE (/results)
 ↓
AI ROOT-CAUSE DIAGNOSIS (Probable Root Cause & Need)
 ↓
RECOMMENDED ACTIONS (/improve)
 ↓
ACTION COMPARISON (/compare)
 ↓
WHAT-IF SIMULATION (/simulator)
 ↓
PROGRESS TRACKING (/progress) & ADMIN MANAGEMENT (/admin)
```

---

## Project Structure

```
ecomind/
├── start.bat               # 1-Click launcher for Windows
├── start.sh                # 1-Click launcher for Mac/Linux
├── README.md               # Export & setup guide
├── package.json            # Root configuration
├── frontend/               # React 18 + Vite SPA (Plain CSS, zero UI frameworks)
├── backend/                # Express API Server + Gemini AI + Calculation Engine
└── supabase/               # SQL schema migrations (23 tables + seed data)
```

---

## How to Run on Any Computer / Device

### Prerequisites
- Install **Node.js** (v18 or higher) from [nodejs.org](https://nodejs.org/).

### Quick 1-Click Start (Windows)
Double-click `start.bat` in the project folder!

### Manual Terminal Start

1. **Install Dependencies**:
   ```bash
   npm run install:all
   ```

2. **Start Backend Server**:
   ```bash
   cd backend
   node server.js
   ```
   *Runs on `http://localhost:5000` (Bound to `0.0.0.0` for multi-device access)*

3. **Start Frontend Dev Server**:
   ```bash
   cd frontend
   npm run dev
   ```
   *Runs on `http://localhost:3000` (Accessible on local network via host IP)*

---

## Sharing & Exporting the Project

To share this project with others or transfer it to another computer:

1. Simply copy or share the project ZIP archive (`ecomind-fullstack.zip`).
2. Extract the archive on the target computer.
3. Run `start.bat` (or `npm run install:all && npm start` in terminal).
