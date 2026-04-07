# Achievno

Achievno is a mobile-first Next.js prototype for tracking personal achievements and group progress across web and Telegram Mini App surfaces.

The repository is focused on product flows and reusable UI: welcome/auth screens, onboarding, personal and group spaces, achievements, challenges, profile, notifications, and discovery.

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui + Radix UI
- Vercel Analytics

## Project structure

```text
app/                  App Router pages and user flows
  welcome/            Entry screen
  auth/               Sign in / sign up
  onboarding/         Profile, goals, notifications onboarding
  app/                Main product area
    spaces/           Spaces list
    achievements/     Achievement screens
    groups/           Group screens
    discover/         Discovery flow
    me/               Personal workspace
    notifications/    Notifications
    profile/          Profile
    settings/         Settings

components/
  achievno/           Product-specific components
  ui/                 Shared UI primitives

hooks/                Reusable client hooks
lib/
  achievno/           Routes, constants, icons, shared types
  utils.ts            Common helpers

public/               Icons and placeholder assets
styles/               Global styles
