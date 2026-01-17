# Montra - Student Finance Application

![Status](https://img.shields.io/badge/Status-Stable-success?style=for-the-badge) ![Version](https://img.shields.io/badge/Version-v1.2.0-blue?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

Montra is a sophisticated, full-featured financial tracking platform engineered specifically for students. It addresses unique challenges such as irregular income, tight budgets, and the need for long-term savings planning, providing a robust solution for mastering personal finance.

## Project Overview

| Property | Details |
| :------- | :------ |
| **Project Name** | Montra Student Finance |
| **Status** | Stable Release v1.2.0 |
| **License** | MIT |
| **Stack** | React, TypeScript, Vite, Firebase |
| **Styling** | Tailwind CSS |

## Application Modules

| Module | Description | Status |
| :----- | :---------- | :----- |
| **Dashboard** | High-level overview of financial metrics, charts, and recent activity. | Stable |
| **Budgets** | Define and monitor category-wise spending limits to ensure discipline. | Stable |
| **Goals** | Create and track specific savings targets with visual progress. | Stable |
| **Transactions** | Comprehensive ledger of income and expenses with filtering. | Stable |
| **Authentication** | Secure identity management via Firebase (Google & Email). | Stable |
| **Magic UI** | Modern bento-grid layouts with glassmorphism effects. | Stable |
| **Dark Mode** | Fully responsive dark theme with 'Vibrant' and 'Minimal' styles. | Stable |
| **Data Control** | Export financial data to JSON and reset workspace tools. | Beta |
| **Settings** | User profile, currency preference, and app personalization. | Stable |

## Technology Stack

| Category | Technology | Usage |
| :------- | :--------- | :---- |
| **Frontend** | React 19 | Core UI Component Library |
| **Build Tool** | Vite | High-performance build tooling |
| **Language** | TypeScript | Type safety and code reliability |
| **Styling** | Tailwind CSS | Utility-first responsive styling realm |
| **Animations** | Framer Motion | Fluid UI transitions and effects |
| **Icons** | Lucide React | Scalable vector iconography |
| **Backend** | Firebase | Authentication & Firestore Database |
| **Charts** | Recharts | Interactive data visualization |

## Project Structure

```bash
Montra/
├── frontend/                  # Main Client Application
│   ├── src/
│   │   ├── components/        # Reusable UI & MagicBento components
│   │   ├── contexts/          # Global state (Auth, Theme)
│   │   ├── pages/             # Application Views (Dashboard, Settings, etc.)
│   │   ├── services/          # Firebase integration services
│   │   └── App.tsx            # Main Application entry point
│   ├── tailwind.config.js     # Design system configuration
│   └── vite.config.ts         # Build & Proxy configuration
```

## Installation & Setup

| Step | Action | Command |
| :--- | :----- | :------ |
| 1 | Clone Repository | `git clone <repository-url>` |
| 2 | Enter Directory | `cd frontend` |
| 3 | Install Dependencies | `npm install` |
| 4 | Setup Environment | Create `.env` with Firebase keys |

## Development Commands

| Command | Description |
| :------ | :---------- |
| `npm run dev` | Start local development server on port 5173 |
| `npm run build` | Compile application for production deployment |
| `npm run preview` | Preview the production build locally |
