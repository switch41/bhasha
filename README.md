## Overview

This project uses the following tech stack:
- Vite
- Typescript
- React Router v7 (all imports from `react-router` instead of `react-router-dom`)
- React 19 (for frontend components)
- Tailwind v4 (for styling)
- Shadcn UI (for UI components library)
- Lucide Icons (for icons)
- Supabase (for database, storage)
- Framer Motion (for animations)
- Three js (for 3d models)

All relevant files live in the 'src' directory.

Use pnpm for the package manager.

## Environment Variables

Supabase is used for data and storage. Provide credentials via Vite env:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Alternatively, you can set these at runtime (see Supabase section below).

# Authentication

A lightweight demo auth is implemented in `src/hooks/use-auth.ts` storing a user in localStorage.
- Email OTP flow is simulated for UI only
- Anonymous sign-in is supported

Use the hook:
```typescript
import { useAuth } from "@/hooks/use-auth";
const { isLoading, isAuthenticated, user, signIn, signOut } = useAuth();
```

## Protected Routes

Check `useAuth` in your pages and redirect to `/auth` as needed.

## Auth Page

See `src/pages/Auth.tsx`.

# Frontend Conventions

- Pages in `src/pages`, components in `src/components`.
- Shadcn primitives in `src/components/ui`.

## Page routing

Your page component should go under the `src/pages` folder.

When adding a page, update the react router configuration in `src/main.tsx` to include the new route you just added.

## Shad CN conventions

Follow these conventions when using Shad CN components, which you should use by default.
- Remember to use "cursor-pointer" to make the element clickable
- For title text, use the "tracking-tight font-bold" class to make the text more readable
- Always make apps MOBILE RESPONSIVE. This is important
- AVOID NESTED CARDS. Try and not to nest cards, borders, components, etc. Nested cards add clutter and make the app look messy.
- AVOID SHADOWS. Avoid adding any shadows to components. stick with a thin border without the shadow.
- Avoid skeletons; instead, use the loader2 component to show a spinning loading state when loading data.


## Landing Pages

You must always create good-looking designer-level styles to your application. 
- Make it well animated and fit a certain "theme", ie neo brutalist, retro, neumorphism, glass morphism, etc

Use known images and emojis from online.

If the user is logged in already, show the get started button to say "Dashboard" or "Profile" instead to take them there.

## Responsiveness and formatting

Make sure pages are wrapped in a container to prevent the width stretching out on wide screens. Always make sure they are centered aligned and not off-center.

Always make sure that your designs are mobile responsive. Verify the formatting to ensure it has correct max and min widths as well as mobile responsiveness.

- Always create sidebars for protected dashboard pages and navigate between pages
- Always create navbars for landing pages
- On these bars, the created logo should be clickable and redirect to the index page

## Animating with Framer Motion

You must add animations to components using Framer Motion. It is already installed and configured in the project.

To use it, import the `motion` component from `framer-motion` and use it to wrap the component you want to animate.


### Other Items to animate
- Fade in and Fade Out
- Slide in and Slide Out animations
- Rendering animations
- Button clicks and UI elements

Animate for all components, including on landing page and app pages.

## Three JS Graphics

Your app comes with three js by default. You can use it to create 3D graphics for landing pages, games, etc.


## Colors

You can override colors in: `src/index.css`

This uses the oklch color format for tailwind v4.

Always use these color variable names.

Make sure all ui components are set up to be mobile responsive and compatible with both light and dark mode.

Set theme using `dark` or `light` variables at the parent className.

## Styling and Theming

When changing the theme, always change the underlying theme of the shad cn components app-wide under `src/components/ui` and the colors in the index.css file.

Avoid hardcoding in colors unless necessary for a use case, and properly implement themes through the underlying shad cn ui components.

When styling, ensure buttons and clickable items have pointer-click on them (don't by default).

Always follow a set theme style and ensure it is tuned to the user's liking.

## Toasts

You should always use toasts to display results to the user, such as confirmations, results, errors, etc.

Use the shad cn Sonner component as the toaster. For example:

```
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
export function SonnerDemo() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        toast("Event has been created", {
          description: "Sunday, December 03, 2023 at 9:00 AM",
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        })
      }
    >
      Show Toast
    </Button>
  )
}
```

Remember to import { toast } from "sonner". Usage: `toast("Event has been created.")`

## Dialogs

Always ensure your larger dialogs have a scroll in its content to ensure that its content fits the screen size. Make sure that the content is not cut off from the screen.

Ideally, instead of using a new page, use a Dialog instead. 

# Data and Storage: Supabase

- Client initialization lives in `src/lib/supabase.ts`.
- Text and audio contributions use `src/lib/supabaseContrib.ts`.
- User stats are aggregated via `src/lib/supabaseStats.ts` and consumed in `src/components/UserStats.tsx`.
- Audio files are uploaded to Supabase Storage bucket named `audio`.

Quick setup (.env at project root):
```
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```
Restart the dev server after setting these.

## Supabase Environment Setup

The app reads Supabase credentials from Vite env vars at build time:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Steps:
1) Create `.env` at project root and set the variables
2) Restart dev server

Alternative (runtime, no env needed):
- In the app, provide values via the configuration gate prompt if shown, or set in DevTools:
```
localStorage.setItem("SUPABASE_URL", "https://xxxx.supabase.co");
localStorage.setItem("SUPABASE_ANON_KEY", "<anon_key>");
```
Reload afterward.

# Notes

- All Convex code, config, and dependencies have been removed.
- Replace any future data access with Supabase client utilities in `src/lib`.