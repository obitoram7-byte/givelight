# Givelight

A guest-first micro-donation experience for Nepal, India, and global donors. The web app starts in demo mode: no database or payment credentials are required to explore the experience.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Demo donations are simulated in the browser and are never presented as verified real payments. To configure PostgreSQL, copy `.env.example` to `.env`, set `DATABASE_URL`, then run `npm run db:generate` and `npm run db:migrate`. Demo payment mode remains enabled unless explicitly replaced with a real, server-side provider adapter.

## Stack

Next.js App Router, TypeScript, Tailwind CSS v4, Framer Motion, GSAP, React Three Fiber, Zustand, TanStack Query, Prisma/PostgreSQL, and Auth.js.

## Project map

- `src/app`: routes, API routes, and global layout
- `src/components`: reusable interface and donation components
- `src/lib`: typed demo data and domain helpers
- `prisma`: relational schema and seed data

## Included demo flows

- English/Hindi switcher, light/dark themes, reduced-motion support, and responsive navigation
- Cause region/category filters, sample partner/campaign details, progress, and impact sections
- Guest donation intent and explicit demo confirmation; checkout never asks for contact information
- Share-card preview, PNG download, native share, and copy-link controls
- Cause, live-stats, leaderboard, donation-status, and stats-stream API routes
- PostgreSQL Prisma schema and sample NGO/campaign seed data

## Not enabled for real donations

The payment-provider interface is intentionally unregistered, so real provider webhooks return `503` until a provider-specific adapter is implemented and configured. The webhook route verifies through that adapter before it records a unique provider event and transitions a pending donation to paid inside a database transaction. Auth.js sign-in, OTP, guest claiming, teams, payouts, and admin actions are also disabled until their providers, persistence, role checks, and operational policies are configured. Those routes fail closed rather than simulate real authorization.

The current demo store is process-local and is not durable or suitable for multi-instance deployments. Demo totals only adjust for confirmed USD demo gifts; no fake exchange rates are applied to NPR/INR. The visible starting totals, partner verification, and campaign progress are illustrative sample data, not real fundraising claims.

## Payment and security boundary

Guest checkout does not ask for contact details or login. The included checkout is demo-only; it does not contact FonePay, eSewa, Khalti, Razorpay, Stripe, or PayPal. Production payment adapters must create orders on the server, validate provider signatures against the raw webhook body, deduplicate provider event IDs in a database transaction, and only then mark donations paid. Keep all provider secrets server-only. Never count a browser callback as payment confirmation.

The schema includes one-time guest claim tokens, identity/session records, provider events, causes, NGOs, teams, payouts, and impact updates. Live values in the initial interface are clearly illustrative demo data.

## Motion and accessibility notes

The app uses a shared motion pattern in `src/lib/motion.ts` and the existing Framer Motion stack to keep animation purposeful: micro-interactions stay around 180–220ms, screen transitions around 320ms, and confirmation celebrations stay short and verified-only. Reduced-motion users keep the same information and actions available without movement-heavy transitions.

The web version emphasizes a cinematic hero reveal, scroll-triggered story chapters, a live counter that only animates after verified total changes, and a story-card export sized for 9:16 sharing. The app also avoids counting any donation as successful before the backend confirmation step completes.

This repository contains the web app only; there is no Android module or Compose project to update in the current workspace. If a native Android version is added later, it should use Compose-native animation APIs, system reduced-motion preferences, and only a small curated Lottie asset for a success spark while the rest of the interaction remains native and performant.

## Production follow-through

Before accepting real donations, configure approved provider accounts, implement and test each provider adapter and signed webhook, add rate limiting and operational monitoring, review NGO/campaign verification and payout controls, and publish applicable privacy, terms, refund, and support policies. Auth.js provider credentials and database-backed sessions also need environment-specific configuration.
