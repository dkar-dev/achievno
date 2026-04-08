# Telegram Mini App foundation for Achievno

## Current repository state

Achievno is currently a single Next.js 16 application with App Router and a mobile-first product structure.

Current top-level structure:

- `app/` — routes, flows, and screens
- `components/` — reusable UI and product-specific components
- `hooks/` — reusable client hooks
- `lib/` — shared helpers, constants, icons, and types
- `public/` — static assets
- `styles/` — global styling

At the moment, the repository does not yet have separated `app/client` and `app/server` directories.

## Goal

Add support for launching Achievno not only as a regular web app, but also as a Telegram Mini App, while keeping a single shared product codebase.

## Architectural direction

The future target architecture is:

- `app/client` — shared frontend application, UI, product flows, shared components, shared hooks, route-aware client logic, and design system
- `app/server` — server-side logic, Telegram bot integration, webhook handlers, Telegram init data validation, backend-specific adapters

Until the repository is physically split, all new Telegram Mini App work must be designed in a way that is easy to extract into this target structure later.

## Core rules

### 1. One shared product UI

Telegram Mini App must not become a separate duplicated frontend.

The same product screens, components, flows, and visual system must be shared between:

- regular web app
- Telegram Mini App

Telegram-specific behavior must be added as an adapter layer, not as a forked product implementation.

### 2. Telegram-specific code isolation

All Telegram-specific client logic must be isolated in a dedicated platform layer.

Recommended future location:

- `app/client/src/platform/telegram/*`

Until the repo is split, the same idea must be preserved in the current structure by grouping Telegram-specific code into a clearly isolated module subtree.

This layer is responsible for:

- Telegram WebApp SDK bootstrapping
- runtime detection
- safe access to Telegram-specific APIs
- theme / viewport / back button integration
- launch parameter parsing
- normalized Telegram platform context for the rest of the app

### 3. Server-side Telegram isolation

All bot-related and trust-bound Telegram logic must live in server-side code only.

This includes:

- Telegram bot token usage
- webhook handlers
- init data verification
- secure mapping between Telegram user and application user
- server-side session/bootstrap logic for Telegram launches

No secret Telegram credentials may be used in client code.

### 4. First implementation target

The first Telegram Mini App milestone is intentionally narrow.

It must achieve only this:

- the application can be opened inside Telegram as a Mini App
- the client can detect Telegram runtime safely
- the client can initialize Telegram WebApp SDK safely
- the app does not break in normal browser mode
- Telegram-specific code remains isolated from the main product logic

This milestone does not yet require full bot flows, production auth, or advanced Telegram UX features.

## Transitional implementation rule

Because the repo is still a single Next.js app, all new work must be done with future extraction in mind.

That means:

- avoid scattering Telegram conditionals across unrelated screens
- introduce a small dedicated platform abstraction first
- keep Telegram bootstrapping close to the application shell
- keep domain/product components unaware of Telegram wherever possible

## Near-future extraction target

When the repo is reorganized later, the code should migrate with minimal rewriting into:

- shared client app code
- Telegram client adapter
- Telegram server integration layer

The current work must prepare that split, not block it.
