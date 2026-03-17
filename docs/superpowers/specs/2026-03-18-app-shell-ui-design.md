# App Shell UI Design

Date: 2026-03-18
Status: Approved for planning
Product area: Dashboard shell and shared application chrome

## Context

Offer Track already has pockets of visual polish, especially in the dashboard shell and jobs surface, but the app shell is not yet a fully coherent system. The current interface has personality in a few components while the broader shell still behaves like a mostly standard SaaS layout.

The user wants to improve the UI by focusing first on the shared app shell rather than on individual feature pages. During brainstorming, the preferred direction was:

- Shell scope first, not page-level redesign
- Visual direction: Warm Command Center
- Personality level: Bold
- Guardrail: Clarity must not regress

## Problem

The current shell does not yet fully deliver on the product positioning described in the README: a compact operating system for an active job search. The sidebar, top bar, and shared surfaces need to feel more intentional, more branded, and more cohesive, while still keeping dense job-search workflows readable.

## Goals

- Make the shell feel distinctive and product-specific rather than generically shadcn-like
- Concentrate most of the interface personality into the shared shell so data-heavy pages stay usable
- Improve visual hierarchy across navigation, page header, and surrounding surfaces
- Introduce a warmer, branded visual system without reducing legibility
- Keep desktop and mobile shells recognizably part of the same system

## Non-Goals

- No full redesign of jobs tables, kanban boards, analytics panels, or forms in this pass
- No logo redesign, illustration system, or marketing-style brand overhaul
- No decorative motion that competes with workflow clarity
- No density reduction that makes the app feel less operational

## Chosen Direction

The selected design direction is `Command Deck`.

Why this direction:

- It best matches the chosen visual tone: warm, bold, but still structured
- It allows personality to live in the shell instead of adding noise to each feature page
- It supports the product metaphor of a focused operating system better than a calmer editorial direction
- It creates room for stronger identity without compromising content clarity

## Visual System

### Palette

The shell should use a warm neutral base with stronger contrast than the current mostly grayscale treatment.

- Base background: ivory and soft stone neutrals
- Foreground: dark ink tones
- Brand accent: amber-copper range
- Supporting accents: restrained warm tinting for gradients and highlights
- Explicitly avoid purple-forward SaaS styling

### Surface Language

The shell should use layered surfaces with clear hierarchy.

- Outer app background gains subtle warm atmosphere instead of flat neutral white
- Sidebar and top bar become the most branded shell surfaces
- Content panels remain calmer than the shell chrome
- Rounded corners remain a signature, but not every layer should share the exact same radius
- Borders, shadows, and translucency should feel deliberate and consistent rather than incidental

### Typography

Typography should gain more character in headings and labels without hurting readability.

- Page titles and brand-adjacent headings become more intentional and weighty
- Eyebrow labels stay compact and high-signal
- Body text remains straightforward and highly legible
- The shell should not rely on experimental typography that clashes with dense workflows

### Motion

Motion remains subtle and functional.

- Keep soft entrance transitions and hover-lift behavior where already useful
- Avoid showy or decorative animation
- Motion should reinforce hierarchy and affordance, not personality for its own sake

## Structural Design

### Desktop Sidebar

The left sidebar becomes the primary branded anchor of the application.

- Keep the current left-rail layout and collapse behavior
- Strengthen the top brand block with warmer gradients and clearer visual ownership
- Make active navigation states more explicit through fill, contrast, and glow-like emphasis
- De-emphasize secondary navigation groups relative to the active route
- Ensure collapsed mode feels intentionally compact, not merely reduced

### Desktop Header

The header becomes a compact command bar rather than a generic sticky container.

- Keep breadcrumbs, page title, and contextual actions
- Improve grouping so controls feel like a unified action cluster
- Make the header visually distinct from content but calmer than the sidebar brand block
- Preserve sticky behavior where already helpful

### Content Framing

The shell should frame pages more intentionally without redesigning page internals.

- Shared outer containers gain clearer rhythm and separation
- The shell defines hierarchy before page-level components render
- Page panels should remain readable and comparatively quiet inside the stronger shell

### Mobile Shell

Mobile should mirror the same design system without trying to force a desktop sidebar pattern.

- Strengthen the top area and mobile navigation framing
- Keep bottom or compact navigation readable and easy to scan
- Reuse the same color logic, radii, and surface rules as desktop
- Avoid making mobile feel overloaded with branded decoration

## Scope of First Pass

The first implementation pass should focus on shared shell and token layers:

- `app/globals.css`
- shared shell/layout components
- navigation link styling
- section header styling
- mobile shell framing
- shared surface, border, shadow, and gradient rules used by the shell

This pass may lightly adjust shared button or input presentation only if required for shell consistency.

This pass should not redesign:

- jobs table internals
- kanban card system
- dashboard summary card content structure
- analytics-specific charts or panels
- forms beyond incidental shell alignment

## Intended File Targets

Expected implementation will likely center on:

- `app/globals.css`
- `components/layout/dashboard-shell.tsx`
- `components/layout/dashboard-nav-link.tsx`
- `components/layout/dashboard-section-header.tsx`
- `components/layout/dashboard-navigation.ts`
- possibly shared button or related shell-adjacent primitives if needed

Final implementation can adjust this set if better boundaries emerge, but the design intent is to keep shell changes centralized.

## Acceptance Criteria

The redesign is successful if all of the following are true:

- The app shell has a noticeably stronger point of view on first glance
- Sidebar, header, and surrounding shell surfaces feel like one system
- The interface feels warmer and more branded without becoming louder or harder to parse
- Active route and main actions are easier to distinguish than before
- Dense feature pages still read clearly inside the redesigned shell
- Desktop and mobile shells feel related
- Existing frontend and backend tests continue to pass after implementation

## Risks

- Too much warmth or surface styling could reduce clarity and create visual fatigue
- A bolder shell could clash with quieter feature pages if the hierarchy is not controlled
- Over-styling collapsed navigation could make compact mode harder to scan

## Risk Mitigations

- Keep strongest treatment in the shell chrome, not in content-heavy panels
- Reserve highest contrast for active states and primary actions
- Validate the shell against existing dense screens instead of judging it in isolation
- Prefer a small number of strong visual rules over many decorative details

## Implementation Notes For Planning

- Centralize new shell tokens in global CSS rather than repeating gradients and shadow values inline
- Treat shell identity as a system: background, sidebar, header, nav states, and mobile framing should evolve together
- Maintain current interaction patterns unless they interfere with the new hierarchy
- Test both light and dark mode behavior if dark mode remains supported by the shell
