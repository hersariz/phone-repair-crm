# PhoneRepair CRM

A modern CRM (Customer Relationship Management) app for phone and electronics repair businesses, with AI and WhatsApp integration.

PhoneRepair CRM gives a repair shop one place to manage customers, service tickets, inventory, technicians, and customer communication — through WhatsApp and an AI assistant that can answer questions using the shop's own CRM data.

## ✨ Features

- **Customer management** — store and manage customer records
- **Service tickets** — create and track repair tickets end to end
- **Technician management** — manage technicians and workload distribution
- **Inventory** — track spare parts and stock levels, with restock reminders
- **WhatsApp integration** — talk to customers directly via the WhatsApp API
- **AI assistant** — a contextual chat assistant that can read CRM data (customers, tickets, inventory, stats)
- **Dashboard** — business performance visualized with charts
- **Monthly reports** — periodic performance analysis
- **Invoicing** — generate invoices for customers

## 🔧 Tech Stack

**Frontend**

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v7
- Recharts (data visualization)
- Lucide React (icons)

**Backend**

- Node.js + Express
- Socket.IO (real-time updates)

**Integrations**

- OpenAI (GPT-4o) / Qwen — AI chat assistant
- WhatsApp Business API — customer communication
- SMS service — service status notifications

## 🚀 Getting Started

### Prerequisites

- Node.js 14+
- A WhatsApp Business API account
- An OpenAI or Qwen API key
- Internet connection

### Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env` and fill in your credentials:

```bash
VITE_CHATGPT_API_KEY=your_chatgpt_api_key
VITE_CHATGPT_API_ENDPOINT=your_chatgpt_api_endpoint
VITE_QWEN_API_KEY=your_qwen_api_key
VITE_QWEN_API_ENDPOINT=your_qwen_api_endpoint
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_custom_verify_token
```

### Running the app

Run the Socket.IO server:

```bash
npm run server
```

Run the web app in development mode:

```bash
npm run dev
```

Or run both at once:

```bash
npm run dev:all
```

## 📂 Project Structure

- `src/components/` — React UI components
- `src/services/` — external API communication
- `src/types/` — TypeScript type definitions
- `src/lib/` — utilities and helpers
- `server.ts` — backend server (Socket.IO + API)

## 🤖 AI Contextual Chat

The built-in AI assistant can access and analyze:

- Customer data (name, contact, address)
- Service tickets (with full customer and technician info)
- Inventory
- Dashboard data and statistics

## 📄 License

MIT
