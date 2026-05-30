# Neuro-Symbolic Business Intelligence Framework

A high-integrity multi-tenant dashboard and formal verification engine designed to bridge probabilistic generative reasoning with deterministic symbolic logic. This framework integrates **Laravel 12**, **React 19**, **Python 3.14 (Z3 SMT Solver)**, and **Gemini 1.5 Pro** to provide mathematically verified operational strategies.

---

## 1. COMPONENT STACK & HYBRID ARCHITECTURE

### **Multi-tenant Core**
- **Backend**: Laravel PHP 8.2+ (configured for PHP 8.3 parity) utilizing Eloquent ORM for strict data isolation.
- **Frontend**: React 19 + Inertia.js v2 for seamless Single Page Application (SPA) delivery without the complexity of client-side routing.
- **Styling**: Tailwind CSS v4 with a high-density "Control Room" aesthetic.

### **Inter-Process Communication (IPC) Layer**
The system bridges the PHP and Python environments via the **Symfony Process** utility (`app/Http/Controllers/BusinessController.php`).
- **Data Streaming**: Payloads are transmitted via `Standard Input (sys.stdin)` using `$process->setInput(json_encode($packet))`. This bypasses Windows CLI string length limitations.
- **Fortified Windows Environment**: The execution environment is manually hardened to ensure stability on Windows Server hosts:
  - `SystemRoot`: `C:\Windows`
  - `SystemDrive`: `C:`
  - `PATH`: Hardcoded to include `System32`, `Python314`, and `Scripts`.
  - `GEMINI_API_KEY`: Injected directly from the `.env` file into the Python process context.

### **Symbolic & Neural Layers**
- **Symbolic Guard Layer**: A Python 3.14 backend (`scripts/verify_logic.py`) utilizing the **Z3 SMT Solver**. It evaluates incoming telemetry against formal invariants before allowing any narrative generation.
- **Neural Narrative Layer**: The **Gemini Pro Content API** (`gemini-1.5-flash-latest`). It generates human-readable strategies only after the symbolic layer has identified a satisfying state (`sat`).

---

## 2. MULTI-TENANT SCHEMAS & DATABASE CONSTRAINTS

The database is architected around a tenant root system with strict foreign key constraints and polymorphic logging.

### **Primary Tenant Tables**
- **`business_profiles`**: The root of the multi-tenant tree.
  - `industry_type`: Enum (`Restaurant`, `E-commerce`, `Staffing`).
- **`staff_mris`**: Detailed personnel tracking.
  - `base_quality_rating`: Decimal (3,2) - Accountability index (0.00 to 5.00).
  - `business_id`: Constrained foreign key to `business_profiles`.

### **Operational Metrics**
- **`daily_performance_logs`**: Time-series workload metrics.
  - `tasks_started`: Integer
  - `tasks_failed`: Integer
  - `overtime_hours`: Decimal (5,2) - Core driver for the Fatigue Bound.
- **`error_waste_logs`**: Polymorphic telemetry engine.
  - `ingredient_id` / `product_id`: Nullable constrained keys for hybrid industry support.
  - `error_type`: Enum (`Expired`, `Overcooked`, `Size Mismatch`, `Defective`, `Prep Error`).
  - `waste_qty`: Decimal (10,2).
  - `financial_loss`: Decimal (10,2).
  - `system_reasoning`: Text - Audit trail for the Logic Gate.

### **Supporting Relations**
- **`ingredients`**: Inventory tracking for Restaurant tenants.
- **`products`**: Retail item configuration with JSON `attributes`.
- **`orders`**: Commercial lifecycle tracking with statuses: `Completed`, `Returned`, `Cancelled`.

---

## 3. SYNTHETIC HIGH-VOLUME ENVIRONMENT SEEDING

The framework includes a precision seeding engine (`BusinessController@advancedSeed`) for generating stress-test environments.
- **Temporal Consistency**: Logs are generated using relative dates (`now()->subDays($i)`) to build coherent 7-day performance history.
- **Role-Based Population**: Seeds diverse industry roles (e.g., Head Chef, Fulfillment, Safety Officer).
- **Relational Integrity**: Seeds products/ingredients first, then maps waste incidents proportionally based on staff fatigue and quality ratings to ensure realistic data distributions.

---

## 4. DYNAMIC INTERACTIVE DASHBOARD

The dashboard (`resources/js/pages/Business/Dashboard.tsx`) is a reactive operational interface.

### **UI Adaptation Engine**
The layout dynamically reconfigures its visual tokens based on the `industry_type`:
- **Icons**: Utensils (Restaurant) vs. Shopping Bag (E-commerce) vs. Briefcase (Staffing).
- **Labels**: "Ingredients" (Restaurant) vs. "Products" (E-commerce) vs. "Staff MRI" (Staffing).
- **Charts**: "Waste by Ingredient" vs. "Task Failure by Staff".

### **Operational Statistics Cards**
- **Total Financial Loss / Failures**: Sum of `financial_loss` or `tasks_failed` scaled by simulation modifiers.
- **Fatigue Index**: Mean `overtime_hours` across the active staff trace.
- **System Reliability**: Real-time health score calculated as:
  - `100 - (projectedLogs * 2) - (avgFatigue * 5)` (Adjusted for industry context).
- **Z3 Solver Status**: Visual indicator of the logic gate state (e.g., `Formal Proof SAT`).

### **Interactive Simulation Panel (`BusinessAnalyzerPanel.tsx`)**
Three high-precision sliders allow users to model theoretical state changes:
1. **Anomaly Rate Delta**: `[-50% to +50%, step 1]` - Scales the volume of error logs.
2. **Shift Fatigue Delta**: `[-50% to +50%, step 1]` - Scales the average overtime hours.
3. **Target Loss Mitigation**: `[0% to 100%, step 1]` - Inversely scales the impact of errors on the reliability score.

*Adjusting these sliders updates all dashboard charts in real-time via the `modifiers` state object.*

---

## 5. COMPUTATIONAL VERIFICATION LAYER & LOGIC GATE

The Python verification script (`scripts/verify_logic.py`) serves as the system's "Pre-frontal Cortex."

### **Batch-Clustering Module**
Telemetry streams are grouped into 5-batch clusters to identify systemic failure patterns. This prevents the AI from reacting to high-frequency data noise and ensures strategies address root-cause trends.

### **Formal Invariants**
Z3 evaluates the state vector $S$ against the following mathematical bounds:
- **Asset Leakage Invariant**:
  $$\sum \text{financial\_loss} < 50000.0$$
- **Staffing Safety Invariant**:
  $$(\text{avg\_OT} \leq 12.0) \land (\text{fail\_rate} < 0.15)$$

### **Dual-Path Execution**
1. **SAT Path**: Solver identifies a satisfying assignment. The verified deltas and context are passed to Gemini Pro to generate a verified prescriptive strategy.
2. **UNSAT Path (Hallucination Block)**: If invariants are violated, the logic gate triggers a protective barrier. The AI narrative is discarded, and the UI displays a **"Hallucination Blocked"** alert containing the formal Z3 counter-proof, securing the interface against mathematically impossible suggestions.
