# PlanB AI — Intelligent Event Planner & Contingency Architecture

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-3.8_Flash-8E75C2?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> *"Every event has a plan. Great events have a Plan B."*  
> **Official Submission**: PromptWars Challenge 5: Celebration & Event Planner  
> **Repository**: [https://github.com/adarshkumar31august/planb-ai](https://github.com/adarshkumar31august/planb-ai)

---

## 🎯 Problem Statement

Organizing a celebration—whether a college farewell, wedding, birthday, or corporate gala—is inherently high-stakes:
1. **Budget Overruns**: 70%+ of events suffer from chaotic ad-hoc expenses with no category caps or deterministic arithmetic checks.
2. **Fragile Single Plans**: Conventional planning tools only store a static checklist. When a venue floods, a caterer drops out 48 hours prior, or budgets get slashed by 30%, organizers panic with no structured backup strategy.
3. **AI Hallucinations in Existing Tools**: Generic LLM event planners frequently invent fake vendors, hallucinate prices, and fail basic arithmetic (allocating ₹30,000 when given a ₹25,000 cap).

---

## 💡 The Solution: PlanB AI

**PlanB AI** is an intelligent, full-stack event-planning web application built for operational certainty. It couples **generative AI reasoning** (via Google Gemini 3.8 Flash) with **strict deterministic mathematical engines**, ensuring:
- **100% Math Integrity**: All allocations, department splits, and variances are computed with tested application code—never hallucinated by an LLM.
- **The Signature "What If?" Simulator**: One-click scenario stress-testing that produces mathematically validated Plan B revisions with before/after comparisons and a 1-click snapshot rollback.
- **AI Event Architect**: Generates customized departmental distributions, milestones, and contingency strategies tailored to guest scale and venue constraints.
- **Zero Fabricated Vendors**: Pure integrity tracking—vendors, quotes, and statuses (*Not Contacted, Contacted, Quotation Received, Booked*) require verification and are never falsely claimed.
- **Emergency SOS Mode**: High-velocity triage workflow for live event disruptions (weather, power, transport delays) with prioritized checklists and copyable WhatsApp protocols.

---

## 🚀 Key Features

### 1. Modern SaaS Landing Page & Live Mini-Simulator
- Premium design aesthetic: warm off-white background (`#FAF9F6`), dark charcoal typography (`#19181B`), and deep violet accents (`#6D28D9`).
- Interactive sandbox allowing visitors to test the signature What If? engine directly on the landing page before creating an account.
- Before/After comparison showcase, key differentiators, and interactive FAQ accordion.

### 2. Operational Dashboard & Readiness Score
- Executive metrics: Active Events, Upcoming Deadlines, Planned Budget in INR (₹), and Pending Tasks.
- **Event Readiness Score Gauge (0–100%)**: Automatically calculates operational health based on completed milestones and budget allocation.
- Global navigation switcher and mobile drawer navigation.

### 3. Event Creation & Gemini AI Event Architect
- Comprehensive form: Name, Event Type, Date, Timings, Location, Guest Scale, Total Budget in INR, Venue Preference (*Indoor, Outdoor, Hybrid*), and Theme.
- Real-time client-side validation with actionable feedback.
- 1-click **College Farewell Template** (100 guests, ₹25,000 budget).
- **Gemini 3.8 Flash Integration**: Generates concept summaries, strategic advice, bespoke department budgets, and milestone checklists with graceful offline calibrated fallback.

### 4. Smart Budget Engine (Deterministic Arithmetic)
- Category-wise distribution across **Catering**, **Venue**, **AV & Sound**, **Decor**, **Logistics**, and **Contingency Buffer**.
- Dual view: Responsive Card Grid and Line-Item Expense Table.
- Inline editing, expense addition, and 1-click CSV budget export.
- Automatic **Budget Health Alert**: Triggers warnings whenever total allocated exceeds the budget cap.

### 5. Timeline & Task Checklists
- Tasks categorized by department, priority (*Urgent, High, Medium, Low*), and due dates.
- Interactive checkboxes, progress tracking bar, and inline quick-add bar.

### 6. Integrity-Guaranteed Vendor Manager
- Track vendor categories, contact persons, phone numbers, and quoted amounts.
- 4-stage booking workflow: `Not Contacted` → `Contacted` → `Quotation Received` → `Booked`.
- Direct `tel:` and `mailto:` action buttons.
- Strict anti-hallucination policy: never fabricates availability or bookings.

### 7. 🔮 The "What If?" Stress-Test Simulator (Signature Feature)
- **Built-in Crisis Scenarios**:
  - **Budget Cut by 30%** (and the benchmark College Farewell ₹25,000 → ₹18,000 cap reduction).
  - **Guest Count Surges by +50%** (auto-adjusts catering ratios and seating).
  - **Outdoor Venue Unavailable** (triggers weather/rain contingency).
  - **Catering Vendor Cancels** (switches to rapid-fulfillment buffet boxes).
  - **Event Start Time Changes** (re-sequences audio checks and lighting).
  - **Custom Sliders**: Custom budget variation (-50% to +50%) and guest surges (0% to +100%).
- **Before vs After Visual Comparison**: Side-by-side total budget, per-department deltas, affected tasks, and rationale explanations (*"Why PlanB Made This Change"*).
- **Approval Workflow & Instant Rollback**: Changes are applied only upon explicit user confirmation, incrementing the Plan Version (e.g. Plan Version 2.0) and preserving an immutable snapshot with 1-click rollback.
- **WhatsApp Contingency Broadcast**: Copies a clean, ready-to-send brief for committee members and vendors.

### 8. 🚨 Emergency Mode (Crisis SOS)
- Quick crisis presets: Sudden Rain/Storm, Audio/Power Failure, Catering Delay, Guest Surge.
- Prioritized triage protocol:
  - **Immediate (0–30 mins)**: Damage control and lead assignment.
  - **Secondary (30–90 mins)**: Alternative arrangements and logistics.
  - **Communication**: Broadcast announcement templates.

### 9. Clean Architecture & Persistence
- **Repository Pattern (`IEventRepository`)**: Decouples UI from storage. Currently uses `LocalStorageEventRepository` for 100% reliable local persistence across page reloads.
- Ready for remote cloud databases (includes full PostgreSQL schema migration for Supabase in Settings).
- Zero-leak secret architecture: API keys are never bundled into client artifacts or committed to Git.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript 5.5 |
| **Styling & Design System** | Tailwind CSS 3.4, Lucide Icons, Custom Design Tokens |
| **Build & Bundler** | Vite 6.0 with TypeScript compilation |
| **AI Integration** | Google Gen AI SDK (`@google/genai`), Google Gemini 3.8 Flash |
| **Architecture** | Repository Pattern, Context API, Pure Domain Functions |
| **Testing** | Node.js Test Runner (`node --test`), 7 Automated Verification Tests |

---

## 🧪 Automated Test Suite

Run the verified test suite:

```bash
npm test
```

### Verified Test Cases
1. **Baseline College Farewell Integrity**: Validates 100 attendees, ₹25,000 budget cap, and category distributions.
2. **Signature What If? Cap Compliance**: Proves that reducing the College Farewell budget to ₹18,000 yields allocations strictly `<= ₹18,000` with zero rupee overage.
3. **Generic 30% Budget Reduction**: Verifies deterministic value engineering across flexible categories.
4. **Guest Surge Simulation**: Tests per-plate catering scaling under a +50% guest surge.
5. **Form Validation Engine**: Validates error handling for empty fields, past dates, and invalid budgets.
6. **Emergency Protocol Engine**: Confirms phase sorting and sample labeling.
7. **INR Currency Formatter**: Verifies standard Indian numbering format (e.g., `₹25,000`).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (tested on Node v22.x)
- **npm**: v9.0.0 or higher
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/adarshkumar31august/planb-ai.git

# 2. Navigate to project root
cd planb-ai

# 3. Install dependencies
npm install

# 4. (Optional) Configure Gemini API Key
cp .env.example .env
# Edit .env and insert your GEMINI_API_KEY from Google AI Studio
```

### Development & Build Commands

```bash
# Start local development server (http://localhost:3000)
npm run dev

# Run automated tests
npm test

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## 📁 Project Directory Structure

```text
planb-ai/
├── public/                 # Static assets and favicon
├── server/
│   └── geminiMiddleware.ts # Secure Vite server middleware for Gemini API
├── src/
│   ├── components/
│   │   ├── budget/         # BudgetManager, DepartmentView, ExpenseTable
│   │   ├── common/         # Badge, Card, Modal, Tooltip reusable components
│   │   ├── dashboard/      # DashboardOverview, MetricCards, ActionHub
│   │   ├── emergency/      # EmergencyModeModal (Crisis SOS)
│   │   ├── events/         # EventCreationForm, EventDetailView, EditModal
│   │   ├── landing/        # LandingPage, MiniSimulatorSandbox, FAQ
│   │   ├── layout/         # Navbar, Sidebar, Navigation tabs
│   │   ├── settings/       # SettingsView, Gemini API tester, Supabase guide
│   │   ├── simulator/      # WhatIfSimulator, ScenarioCards, BeforeAfter
│   │   ├── timeline/       # TimelineManager, TaskItem, QuickAddBar
│   │   └── vendors/        # VendorManager, VendorCard, StatusDropdown
│   ├── context/
│   │   └── EventContext.tsx # Central state, active event, toast notifications
│   ├── data/
│   │   └── sampleData.ts   # PromptWars College Farewell benchmark dataset
│   ├── services/
│   │   ├── aiService.ts    # Gemini 3.8 Flash SDK & calibrated fallback
│   │   └── eventRepository.ts # IEventRepository & LocalStorage implementation
│   ├── types/
│   │   └── index.ts        # Comprehensive domain TypeScript interfaces
│   ├── utils/
│   │   ├── budgetCalculations.ts # Pure deterministic math & formatters
│   │   ├── emergencyEngine.ts    # Crisis triage prioritization algorithms
│   │   ├── scenarioEngine.ts     # What If? mathematical simulation engine
│   │   └── validators.ts         # Event form validation rules
│   ├── App.tsx             # Root layout & tab router
│   ├── index.css           # Tailwind custom utilities & design system
│   └── main.tsx            # React 18 DOM entrypoint
├── tests/
│   └── planb.test.mjs      # 7 comprehensive automated unit tests
├── .env.example            # Zero-secret environment template
├── .gitignore              # Production-grade git exclusions
├── package.json            # Scripts & dependencies
├── tailwind.config.js      # SaaS palette, fonts, and shadow tokens
├── tsconfig.json           # Strict TypeScript configuration
└── vite.config.ts          # Vite build config & API proxy middleware
```

---

## 🛡️ Privacy, Security & Anti-Hallucination

- **No API Keys in Git**: `.env` is permanently excluded via `.gitignore`. The client session key feature only stores keys in local browser memory and never sends them to third parties.
- **Pure Arithmetic**: No AI model calculates your budget totals; all math is deterministic and unit-tested.
- **Unverified Recommendations**: Emergency recommendations and replacement vendor suggestions are explicitly flagged as sample recommendations to prevent organizers from making false commitments.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

*Crafted for PromptWars Challenge 5: Celebration & Event Planner.*
