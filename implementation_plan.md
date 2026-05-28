# Full WAVY_BANK Redesign

## Goal Description

Create a brand‑new Next.js web application that replaces all legacy code, introduces a premium UI/UX (glassmorphism, gradients, micro‑animations), and provides a clean client‑side storage layer. The new app will contain the following routes:
- `/overview` – Executive dashboard (already refreshed).
- `/clients` – List and manage clients.
- `/transactions` – List and add transactions.
- `/clients/new` – Form to create a client.
- `/transactions/new` – Form to create a transaction.
- `/settings` – Admin settings and data reset.
- `/login` – Simulated Google login.

All pages will share a common layout, global styling, and reusable components.

## User Review Required

> **⚠️ This plan deletes the existing `app/` directory (legacy pages) and creates a new directory structure.**
> - Confirm you want to discard the old pages.
> - Confirm whether you need to keep any existing files (e.g., custom utilities) aside from `storage.ts`.
> - Confirm if you require authentication or any other features not listed.

## Open Questions

- Should any of the current pages (`dashboard`, `accounts`, etc.) be kept as reference?
- Do you want a dark‑mode toggle?
- Do you want to keep the current `storage.ts` logic or generate a fresh one?

## Proposed Changes

---

### 1. Project Re‑initialisation
- **[DELETE]** `app/` (all legacy pages).
- **[NEW]** `app/` – fresh Next.js 14 app router.
- **[NEW]** `components/` – reusable UI primitives (Card, Button, Table, Loader, IconBadge).
- **[NEW]** `styles/` – global CSS with design tokens, glassmorphism utilities, and animations.
- **[NEW]** `lib/` – new `storage.ts` with strict type guards.

### 2. Global Styling (`styles/globals.css`)
- Import Google Font **Inter**.
- Define CSS variables for gradients, glass background, accent colors.
- Utility classes: `.glass`, `.text-glow-blue`, `.grid-bg`.
- Keyframe animations for background grid and button hover.

### 3. Layout Component (`components/Layout.tsx`)
- Fixed header with brand logo and navigation links.
- Main content area centered, wrapped in a container.
- Footer with minimal copy.
- Uses the `.glass` class for a sleek translucent header.

### 4. New Pages (under `app/`)
| Page | Route | Description |
|------|-------|-------------|
| **Overview** | `/overview` | Executive dashboard with KPI cards and recent transaction table (premium design). |
| **Clients** | `/clients` | Table of all clients, searchable, sortable, CRUD actions. |
| **Transactions** | `/transactions` | List of recent transactions, filterable, add‑new form. |
| **Add Client** | `/clients/new` | Form with animated inputs to create a client. |
| **Add Transaction** | `/transactions/new` | Form to record a deposit/transfer with validation. |
| **Settings** | `/settings` | Admin flag toggle, data‑reset button (danger zone). |
| **Login** | `/login` | Simulated Google login, redirects to `/overview`. |

All pages import `Layout` and share the same design language.

### 5. Component Library (examples)
- **Card** – glass background, hover lift.
- **Button** – gradient background, scale on hover.
- **Table** – dark theme, striped rows, hover highlight.
- **Loader** – shimmer placeholder.
- **IconBadge** – circles wrapping `lucide-react` icons.

### 6. Storage Layer (`lib/storage.ts`)
- Re‑implemented API (`getClients`, `setClients`, `findClient`, `updateClient`, `deleteClient`, `insertClient`, `getTransactions`, `setTransactions`, `addTransaction`, `generateAccountNumber`).
- Strict `Array.isArray` checks; corrupted data triggers auto‑reset.
- Types `Client` and `Transaction` exported for reuse.

### 7. Animations & Interactivity
- CSS transitions on buttons, cards, rows.
- Background grid animation via `@keyframes`.
- Fade‑in page loads.
- Form fields validate with a tiny “check” animation.

### 8. SEO & Accessibility
- `<Head>` with descriptive `<title>` and `<meta description>` on each page.
- Semantic HTML structure, proper heading hierarchy.
- ARIA labels and focus styles for keyboard navigation.

### 9. Verification Plan
- **Automated:** Run `npm run dev` and ensure no console errors.
- **Manual:** Visit each route, confirm UI matches design, CRUD works, data persists.
- **Performance:** Bundle size under 1 MB (vanilla CSS, no heavy libs).

### 10. GitHub Deployment
- After completing the implementation, initialize a Git repository, commit all files, and push to a new GitHub repository (named `WAVY_BANK`).
- Add a remote `origin` and push the `main` branch.

---

**Next Steps** (upon your approval):
1. Create `task.md` with a detailed checklist.
2. Scaffold the new directory structure and global CSS.
3. Implement the new `storage.ts`.
4. Build Layout and core components.
5. Add each page sequentially, testing after each.
6. Run the dev server, verify functionality.
7. Commit and push to GitHub.

Please review the plan and answer the open questions so I can proceed.
