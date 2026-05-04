# Debales AI — Multi-tenant AI Assistant

## Setup

### 1. Install
```bash
npm install
```

### 2. .env.local
```
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/debales
OPENROUTER_API_KEY=sk-or-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Seed
```bash
npm run seed
```

### 4. Run
```bash
npm run dev
```

## Demo Users
| Email | Role | Project |
|---|---|---|
| admin@acme.com | admin | Acme Retail |
| member@acme.com | member | Acme Retail |
| admin@demo.com | admin | Demo CRM Co |

## Architecture
Access Layer → Service Layer → Route Handlers → Hooks → UI

## Config-driven Admin Dashboard
Collection: dashboardconfigs, field: projectSlug
Edit that document in MongoDB → dashboard changes with no code change.

Demo edit:
db.dashboardconfigs.updateOne(
  { projectSlug: "acme-retail" },
  { $push: { "sections.0.widgets": { type: "stat-card", label: "New Metric", dataKey: "totalMessages", order: 99 } } }
)

## What's Mocked
- Shopify/CRM: hardcoded data injected into AI prompt when toggled
- Auth: cookie stub (pick user from dropdown)
- AI: falls back to canned message if OpenRouter unavailable
