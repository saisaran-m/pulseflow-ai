# 🌐 PulseFlow AI: DevOps & API Observability Monitoring Hub

PulseFlow AI is an enterprise-grade, full-stack SaaS **Application Performance Monitoring (APM) & DevOps Observability Hub** (similar to Datadog, LogSnag, or New Relic). 

It features real-time telemetry log streams, live charts, customizable alert rule threshold triggers, and context-aware **Google Gemini AI** diagnostic drawers that read raw HTTP trace exception stack traces to generate copyable code patches instantly.

---

## 🚀 Key Highlights & Capabilities

* **📈 Live Telemetry Analytics**: Tracks requests in real-time, displaying live metric counts for total queries, active Requests Per Second (RPS), average latency, and **P95 Latency** calculations.
* **📊 Glassmorphic SVG Visualizations**: Beautiful, custom-themed interactive charts powered by Recharts, tracking requests vs. failure rates and duration latency distribution over chronological intervals.
* **🛡️ SRE Incident & Alerting Engine**: Real-time threshold scanner evaluating database logs. When system metrics cross custom rule thresholds, active alerts are generated onto an audit timeline to be audited and resolved.
* **💻 Interactive Sandbox Shell**: A built-in terminal simulator supporting rolling mock traffic generation. Turn on **Autopilot** to start an asynchronous background worker that keeps dashboard telemetry active.
* **🧠 Gemini AI Crash Diagnostics**: Slide-out trace details panel that retrieves context-specific trace payloads and invokes Gemini (with an offline mock SRE simulator fallback) to analyze severe 500 exceptions, delivering automated patch recommendations.

---

## 🛠️ The Tech Stack

* **Framework**: Next.js 16 (App Router)
* **Frontend**: React 19, Lucide React, Recharts (SVG Visualization)
* **Styling**: Vanilla CSS Modules (featuring custom dark-mode, neon drop-shadows, and glassmorphism)
* **Language**: TypeScript
* **Database**: SQLite (Local Dev) / PostgreSQL (Production cloud)
* **ORM**: Prisma 6 (highly optimized multi-column indexes)
* **AI Engine**: Google Gemini AI (`@google/genai` SDK)

---

## ⚙️ Architecture Flow

```mermaid
graph TD
  User[Developer Client] -->|HTTP Actions| NextApp[Next.js App Router Frontend]
  NextApp -->|Visualizes Charts| Recharts[Recharts SVG Engine]
  NextApp -->|Triggers Simulator| SandboxAPI[/api/sandbox]
  NextApp -->|Fetches Stats| LogsAPI[/api/logs]
  NextApp -->|Manages Alerts| AlertsAPI[/api/alerts]
  NextApp -->|Requests Diagnosis| AnalyzeAPI[/api/analyze]
  
  SandboxAPI -->|Writes Log Traces| DB[(Database - SQLite/PostgreSQL)]
  LogsAPI -->|Queries Log Metrics| DB
  AlertsAPI -->|Creates Rules / Logs Incidents| DB
  AnalyzeAPI -->|Contextual Diagnosis| Gemini[Google Gemini AI / SRE Simulator]
```

---

## ⚡ Quick Start

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org) (v18+) and npm installed.

### 2. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/saisaran-m/pulseflow-ai.git
cd pulseflow-ai
npm install
```

### 3. Database Migration
Initialize your local database migrations and sync schemas using Prisma:
```bash
npx prisma db push
```

### 4. Configure Environment Variables
Create a `.env` file in the project root:
```env
# Optional: Add for live Gemini AI analytics
GEMINI_API_KEY="your_google_gemini_api_key_here"

# Standard SQLite development URL (automatically used if not modified)
DATABASE_URL="file:./dev.db"
```

### 5. Launch the Server
Boot the development server locally:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

---

## ⚙️ Production Deployment (Vercel)

To deploy to Vercel, connect your database schemas to a serverless Postgres DB (like [Neon](https://neon.tech)):

1. Change `provider = "sqlite"` to `provider = "postgresql"` inside `prisma/schema.prisma`.
2. Connect your Neon Connection String as `DATABASE_URL` in your `.env` and push schemas:
   ```bash
   npx prisma db push
   ```
3. Link your GitHub repository to Vercel, inject the environment variables (`DATABASE_URL`, `GEMINI_API_KEY`), and hit **Deploy**!
