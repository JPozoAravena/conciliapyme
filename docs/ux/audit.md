# UX/UI audit, Phase 0 (read-only)

Scope: every route of the running app, as CONTADOR, DUENO and ADMIN, at 1440x900 and 360x800, light and dark. Screenshots live in `docs/ux/before/` (37 PNGs, named `<route>-<viewport>-<theme>[-<role>].png`). Automated checks (axe-core from `node_modules`, tab order, overflow, target size) were run by a throwaway script outside the repo. No source file was changed.

Quality bar: Linear, Stripe Dashboard, Vercel, Mercury. WCAG 2.2 AA.

## 1. Summary

- The app is functionally clean and already accessible at the basics: skip link, semantic tables with captions, labelled fields, `role=alert/status`, visible 2px focus ring, 44px targets, `prefers-reduced-motion` handled, AA contrast. axe-core found 0 contrast or label violations in light mode; the only axe hit was `scrollable-region-focusable` (DUENO, mobile conciliation).
- Visually it reads as a competent template, not a product: one green accent, system-like cards, no iconography, no data hierarchy, no brand moment. The first screen after login is two link cards and "Hola, email". Nothing says "reconciliation".
- There is no dashboard. The home page does not show what an accountant needs first: unreconciled amount, pending invoices, last import, matches waiting for review.
- The shell is the weakest part: a horizontal top bar that wraps to three rows at 360 px, no active-route state, no user menu, role not shown outside home, and no `aria-current`.
- Conciliation is the core screen and the least refined: one card per movement with a repeated table inside; the score is a bare number; the rule is shown with a Spanish label but the audit log leaks raw enums (`MONTO_Y_FOLIO`). At 360 px the page overflows horizontally (scrollWidth 582) for CONTADOR.
- Dark mode works only through `prefers-color-scheme`. There is no toggle and no `color-scheme` meta, so native controls (date picker, file input, select) stay light-styled in places.
- States: skeleton exists for clientes and importar only; empty and error states are text-only cards; success and error go through URL-coded banners at the top of the page (no toast, no scroll-into-view).
- Role communication is weak: DUENO sees the same buttons minus the action ones, with no explanation except on Importar. Conciliation hides the confirm column silently.

| Area | Score (0-5) | Note |
|---|---|---|
| Visual design | 2.5 | Tidy, consistent, generic |
| IA / navigation | 2 | Flat top bar, no active state, no dashboard |
| Accessibility | 3.5 | Strong base; gaps in focus on scroll regions, `aria-current`, dark native controls |
| Responsive | 3 | Forms good; nav wraps; conciliation overflows; tables clip without cue |
| States | 2.5 | Skeletons partial; no toasts; empty/error are plain |
| Forms | 3 | Good labels and help; no inline validation, server-only errors, English "Choose File" |
| Data display / CLP | 3 | Tabular nums and `$1.190.000` correct; dates inconsistent; no filters, sorting, totals |
| Role communication | 2 | Silent hiding of actions |

## 2. Findings

Sorted by impact / effort. Evidence names are PNGs in `docs/ux/before/`.

| ID | Screen | Finding | Evidence | Severity | Impact | Effort | WCAG |
|---|---|---|---|---|---|---|---|
| F01 | Conciliación | Page overflows horizontally at 360 px (scrollWidth 582 > 360); the whole page is wider than the viewport and the table is cut at "Regla". Cause: `li.tarjeta` flex column with a `tabla` whose min-content exceeds the card, so the card grows instead of the inner scroller. | conciliacion-mobile-light-contador.png | high | Core flow unusable on phone | S | 1.4.10 Reflow |
| F02 | Conciliación | Core screen has no summary and no prioritisation: card-per-movement, table repeated, score is a bare number, no visual for 100/70/40 confidence, no "best match" emphasis, no bulk review. | conciliacion-desktop-light-contador.png | high | The product's value is not visible | M | - |
| F03 | Shell | Top bar wraps to 3 rows at 360 px, email hidden on mobile, no active link state, no `aria-current="page"`, no user menu, role not shown. | home-mobile-light-contador.png, cliente-detalle-mobile-light-contador.png | high | Wayfinding and screen real estate | M | 2.4.8, 1.3.1 |
| F04 | Home | No dashboard. "Hola, {email}" plus two link cards duplicating the nav. No KPIs (unreconciled CLP, pending invoices, last import), no next action. | home-desktop-light-contador.png | high | First impression for recruiters | M | - |
| F05 | Auditoría | Raw enum in detail (`MONTO_Y_FOLIO`), `dif.` abbreviations, date format `21-11-26, 5:03 p. m.` differs from `04-09-2026` elsewhere. | auditoria-desktop-light-dueno.png | medium | Looks unfinished | S | - |
| F06 | Roles | DUENO sees Auditoría in nav (permission allows it) but no label that the account is read-only; Conciliación silently drops the Acción column; clients page hides forms with no message. | conciliacion-desktop-light-dueno.png, clientes-desktop-light-dueno.png | medium | Role is not communicated | S | 3.3.2 |
| F07 | Tables | No sticky header, sort, filter, search, totals or row count affordance. Clients list has 3 columns only; invoices clip at 360 px with no scroll cue. | cliente-detalle-mobile-light-contador.png | medium | Data density below fintech bar | M | 1.4.10 |
| F08 | Tables (mobile) | `tabla-scroll` regions without `tabIndex` fail axe `scrollable-region-focusable` when it has no focusable child (conciliation, DUENO). Invoices table has it, others do not. | conciliacion-mobile-light-dueno.png | medium | Keyboard users cannot scroll | S | 2.1.1 |
| F09 | Global | Dark mode follows OS only, no toggle, no `color-scheme: light dark`, so native date/file/select controls are not themed. | home-desktop-dark-contador.png, importar-desktop-dark-contador.png | medium | Theming incomplete | S | - |
| F10 | Importar | File input shows browser-locale "Choose File / No file chosen" next to a Spanish app; dashed field has no drop zone; success summary lacks file name, date and a link to Conciliación. | importar-resultado-banco-b-desktop-light-contador.png | medium | Primary action feels unpolished | M | 3.1.2 |
| F11 | Feedback | Success/error are page-top banners via URL codes; after submit at long pages the banner can be off-screen; no toast, no optimistic state. | clientes-error-rut-desktop-light-contador.png | medium | Weak feedback loop | M | 4.1.3 |
| F12 | Forms | No inline or client validation; RUT is checked only server-side; number inputs show spinners; no input masks for RUT or CLP. | clientes-error-rut-desktop-light-contador.png | medium | Friction | M | 3.3.1, 3.3.3 |
| F13 | Login | Plain card on grey; no brand, no demo-credentials hint, no show-password, generic error text. | login-desktop-light.png, login-error-desktop-light.png | medium | First screen recruiters see | S | 3.3.7 |
| F14 | Dev overlay | Next dev "N" indicator overlaps content in all captures (dev only, not an app defect). | any | low | Screenshot noise | S | - |
| F15 | Typography | Geist loaded, but tabular figures only on some cells (`tabular-nums` applied ad hoc); `.titulo` 30 px only; no scale tokens; uppercase 12 px table headers. | clientes-desktop-light-contador.png | low | Polish | S | - |
| F16 | Tokens | Hard-coded colours (`#fff` in `.btn-peligro`), Tailwind arbitrary `var(--x)` classes mixed with `.btn/.tarjeta` component classes, duplicated link styles in `Encabezado`. | globals.css, encabezado.tsx | low | Maintainability | M | - |
| F17 | Loading | Skeleton only on `/clientes` and `/importar`; conciliation and audit (heaviest queries) have none. | n/a (code) | low | Perceived speed | S | - |
| F18 | Empty states | Text-only cards, no icon or next action (for example "No hay abonos pendientes" has no link to Importar). | clientes-desktop-light-dueno.png | low | Dead ends | S | - |
| F19 | Danger zone | `<details>` delete is the only confirmation; no name confirmation or modal. | cliente-detalle-mobile-light-contador.png | low | Safety | S | 3.3.4 |

Checks that passed: no horizontal overflow at 360 on any other route; no interactive element under 24 px (except the skip link while hidden); focus ring visible (2px solid) on skip link, logo, all nav links, buttons and inputs; tab order follows visual order; light-theme axe contrast clean. Dark theme was not axe-scanned; contrast is estimated from tokens: `--muted #a3b5ad` on `#0d1512` is about 8:1, `--brand #3ecfa5` on `#141f1b` about 9:1, so AA holds.

## 3. Per-screen notes

**Login.** Centered card, good autocomplete attributes, `role=alert`. Missing brand presence, show/hide password, demo-account helper (portfolio use), and the error says "demasiados intentos" together with invalid credentials. Works at 360 px.

**Layout / shell.** Skip link present. Header is `max-w-4xl` (896 px), so the app looks narrow on 1440 screens and leaves large empty areas; a data-heavy product needs a wider content column or a sidebar. Logo is a letter in a square. Sign-out is a secondary button of the same weight as nav. Nav items are 44 px tall, which causes the three-row wrap on mobile.

**Dashboard / home.** Greeting with email and a role badge; two cards with one button each. Opportunity: KPI strip, "needs attention" list, recent activity, last import.

**Facturas.** There is no `/facturas` route; invoices live under `/clientes/[id]`. Invoice table (folio, CLP amount, issue, due, status badge) is clear, with `tabIndex=0` scroll region. Missing: global invoices view, filters by status, overdue emphasis, totals. Forms for new invoice and edit client share the page with the table, which is long on mobile.

**Clientes.** Simple list; RUT plus name link plus count. Create form below the list (below the fold for long lists). No search. Success and RUT error go through banner. Empty state exists (could not be reached, seed has clients).

**Importar.** Best-polished screen: clear help text, selected file name live region, result cards with counts, "already imported" state, accepted formats cards. Gaps: English browser file button, no drag and drop, no progress beyond the spinner button, result does not link to next step. Empty submit stays on the same page (browser `required` stops it). Fixture result banco-a showed the "already imported" path; banco-b showed 2 new movements.

**Conciliación.** See F01, F02. Rule names are translated; score has no scale; difference column shows `$0` for exact matches (noise). Confirm button label is a plain "Confirmar" repeated per row. DUENO sees a read-only variant without explanation.

**Auditoría.** Filter form plus table, pagination only when more than one page. Accessible and correct; detail text is machine-like (F05). No actor avatar, no expand for before/after.

**404.** Default Next not-found (see `404-desktop-light-contador.png`); not branded, no way back besides the header.

## 4. Design-system inventory

- Fonts: Geist and Geist Mono through `next/font/google`, exposed as `--font-geist-sans/-mono`. Mono is loaded but barely used.
- Tokens (CSS variables in `:root`, overridden under `prefers-color-scheme: dark`): background, foreground, surface, muted, border, brand, brand-hover, on-brand, brand-soft, danger (+hover, soft, border, text), ok (soft, border, text), warn (soft, text), ring, shadow. Only `--color-background/foreground` are bridged into Tailwind `@theme`; the rest are consumed as `bg-[var(--x)]` arbitrary values.
- Component classes in `@layer components`: `.contenedor`, `.titulo`, `.subtitulo`, `.texto-suave`, `.enlace`, `.tarjeta`, `.etiqueta`, `.ayuda`, `.campo`, `.btn` (+primario, peligro, secundario), `.spinner`, `.aviso` (+error, ok), `.tabla-scroll`, `.tabla`, `.badge` (+pendiente, pagada, diferencia, neutro), `.esqueleto`.
- React components: `Aviso`, `BotonEnviar`, `Campo`, `CamposCliente`, `EstadoFactura`, `Encabezado`; page-local `TablaFacturas`, `FacturaForm`, `EliminarCliente`, `ResultadoImportacion`, `SelectorArchivo`, `FormatosAceptados`.
- Duplication: nav link classes repeated four times; arbitrary-value utilities duplicating `.tarjeta`/border/background in importar and clientes; three table implementations with similar markup; `Cifra` tile is local; status colours exist as tokens but not as a typed Badge/Tone API; no spacing/radius/type scale tokens (only inline rem values); no Button component (class strings only); `#fff` literal in `.btn-peligro`.
- Motion: 150-200 ms transitions, spinner, skeleton shimmer, `entrar` keyframe. Reduced-motion respected (animation durations forced to 1 ms).

## 5. Library fit

- **shadcn/ui on Radix:** good fit for Dialog (delete client), DropdownMenu (user menu), Tabs, Tooltip, Sheet (mobile nav). It would replace the `.btn/.campo/.tarjeta` classes, so migration must be gradual to avoid churn. Accept only primitives actually needed.
- **next-themes:** fit. Gives toggle, `class` strategy, no flash. Needs the CSS dark block to switch from media query to a `.dark` / `[data-theme]` selector.
- **lucide-react:** fit. The UI has zero icons; nav, empty states, status badges and buttons all benefit. Tree-shakes.
- **sonner:** fit for success feedback after Server Actions, replacing the URL-banner pattern. Error codes in URLs must stay for non-JS (needs owner decision? no, just keep both).
- **TanStack Table:** marginal today. Tables are small and server-rendered; sort and filter can be URL params. Adopt only if client-side sorting or selection is wanted on conciliation; otherwise it adds client JS to Server Components.
- **next/font Geist + tabular nums:** already done; add a `.num` utility with `font-variant-numeric: tabular-nums` globally on numeric cells and consider `font-feature-settings: "ss01"` only if it fits.
- **motion:** low need. CSS handles current transitions; use it only for list reordering when a match is confirmed (layout animations). Keep bundle in mind.
- **@axe-core/playwright:** fit. `axe-core` is already in `node_modules`; adding the Playwright wrapper to e2e gives a regression gate. Needs a devDependency decision.

## 6. Risks: E2E selectors in `e2e/conciliar.e2e.ts`

The test relies on these, so markup changes must keep them or update the test in the same PR:
- `getByLabel('Correo')` and `getByLabel('Contraseña')` (login labels).
- `getByRole('button', { name: 'Ingresar' })` (login submit text).
- `toHaveURL('/')` after login (home must remain at `/`).
- `getByLabel('Archivo CSV')` and `setInputFiles` (file input label).
- `getByRole('button', { name: 'Importar cartola' })`; note it is also a link on home, but only a button on `/importar`.
- `getByRole('status')` must resolve to exactly one element (strict mode): `toContainText('Importación completa')` and `'Conciliación confirmada.'`. Adding sonner toasts, a loading `role=status` or a live region on those pages would break it. The `Cargando…` skeleton has `role=status` too.
- `getByRole('button', { name: 'Confirmar factura {folio} para {descripcion}' })`: the aria-label from `BotonEnviar etiqueta`; the movement description text must remain part of it. Turning the table into cards or a menu must keep this accessible name.
- Exact success copy `Conciliación confirmada.` and `Importación completa` (UI text).

## 7. Needs owner decision

Anything below goes beyond styling and would touch domain, actions, schema or authorisation:
1. **Dashboard KPIs** (unreconciled total, pending count, last import date): needs new queries in `src/lib` or services; no schema change, but new read model code.
2. **Score/confidence display** (100/70/40 with reasons, "best match" flag) uses data `sugerir()` already returns; showing why a rule matched could need extra fields from `src/lib/conciliacion/sugerir`.
3. **Audit detail humanisation** (rule names, invoice folio, movement description, before/after): needs richer data in the Mongo audit payload, which is a domain/schema change; today `detalle()` only has `factura`, `regla`, `diferenciaClp`.
4. **Role communication**: a visible read-only state is UI-only, but showing Auditoría in nav for DUENO versus hiding it is an RBAC decision (`auditoria:ver` currently allows DUENO).
5. **Toasts replacing URL banners**: changes the "error codes in URLs" convention and the `leerAviso` helper in `src/lib/errores`; also affects E2E `status` selector.
6. **Client-side validation of RUT**: reusing `src/lib/rut.ts` in the browser is safe, but duplicating rules in form schema should be agreed.
7. **Global invoices page, search, filters, pagination of clients/invoices**: new queries and possibly new permissions/routes.
8. **Bulk confirm or undo of a reconciliation**: changes the atomic `$transaction` rule and audit semantics; out of UI scope.
9. **Delete-client confirmation by typing name**: UI-only, but `eliminarCliente` rules (only clients without invoices) are domain.
10. **Mobile nav / sidebar** is UI-only, but if links depend on `puede()` the server check pattern must stay in the layout.

## 8. Routes not reached

- `/clientes/[id]` with no invoices and the `/clientes` empty state were not reachable without data modification; the 404 for an unknown client id was captured.
- Conciliation with many suggestions and the audit pagination (more than one page) were not reached: only two audit events and a handful of movements exist.
- `/api/health` was not captured (not a UI page).
- Dark mode was captured for the CONTADOR flow only (and not for DUENO); dark axe was not run.
