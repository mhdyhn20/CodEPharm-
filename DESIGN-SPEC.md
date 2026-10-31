# CodEPharm / کد ای فارم — Design Spec (Phase 2)

This is the design-system specification derived from the brief. Since no Figma files were present in the repository, I implemented a clean, modern, Windows-11-business-app interpretation of the described palette while strictly preserving your brand identity colors.

## 1. Brand Tokens

### Palette
| Token | Hex | Usage |
|-------|-----|-------|
| brand-500 (primary) | `#0E6E73` | Main actions, sidebar gradient start, accents, highlighted code pill |
| brand-600 | `#0B5C60` | Hover/active primary button, sidebar gradient end |
| brand-50 | `#E6F2F3` | Soft backgrounds, zebra/hover rows, code-pill background |
| success | `#2FBFA3` | Success toasts/buttons, success dialog code block, plus in logo |
| danger | `#E05252` | Errors, delete/disallowed states |
| warning | `#E4A93B` | Restore button caution |
| surface-bg | `#F5F8FA` | App canvas |
| surface-card | `#FFFFFF` | Cards, dialogs, table |
| surface-muted | `#F0F4F6` | Subtle fill (row headers, info rows) |
| surface-border | `#E2E8EC` | Dividers, input borders |
| ink | `#1B2428` | Primary text |
| ink-soft | `#4B5B62` | Secondary text |
| ink-muted | `#7E8C92` | Captions, hints |
| ink-faint | `#B0BBC0` | Placeholders, disabled icons |

### Typography
- Family: **Vazirmatn** (Regular 400 / Medium 500 / Bold 700) as a bundled placeholder. Replace with your custom brand font by dropping the files in `assets/fonts/` and updating `@font-face` rules in `src/index.css`.
- Scale: 11 / 12 / 13 / 14 (body) / 16 (buttons, form inputs) / 18 / 20 / 24 / 36–64 (hero code display).
- Numerals: all digits displayed as Persian (۰-۹) via `toPersianDigits()`; inputs accept Persian/Arabic/ASCII digits and normalize.

### Spacing
- Base unit 4px; consistent scale 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40.
- Card padding: 24px; dialog padding: 24px; input padding: 12px 16px.

### Radius
- Small (tags/chips): 8px
- Inputs/buttons: 12px (rounded-xl)
- Cards/dialogs: 16px (rounded-2xl)
- Sidebar: 20px (rounded-l-3xl)
- Icon avatar/circle buttons: full round.

### Shadows
- `shadow-card`: `0 2px 10px rgba(14,110,115,.06), 0 1px 3px rgba(27,36,40,.04)` — cards, non-elevated UI
- `shadow-float`: `0 8px 30px rgba(14,110,115,.12), 0 2px 8px rgba(27,36,40,.06)` — dialogs, popups, sidebar
- `shadow-focus`: `0 0 0 3px rgba(14,110,115,.25)` — keyboard focus ring (brand-tinted)

### Motion
- 200ms ease-out on hover/transforms, active:scale-98 on buttons for press feedback.
- Toast: fade + slide-up.

## 2. RTL
- `<html dir="rtl" lang="fa">` set globally.
- Logical CSS properties (`inset-*`, `ps/pe`, `border-start/end`-aware via Tailwind classes `ps-* pe-* ms-* me-*` where needed).
- Sidebar is on the **right**; content flows RTL.
- Sidebar collapse toggle rotates 180° when collapsed; collapse state persisted.
- Phone numbers are rendered LTR using a `.ltr-dir` utility for proper numeral direction but aligned to the cell end (right for RTL table).

## 3. Component Rules

### Buttons
- Primary (filled teal): main actions (Confirm, Save, Print, Login).
- Secondary (outlined teal): alternate actions in dialog footers (Cancel/Print pair).
- Ghost (transparent): tertiary actions (Create new, Dismiss).
- Danger/Success: semantic.
- All: rounded-xl, 40px min-height, font-medium, hover darkens/fills, `disabled:opacity-50`, optional `loading` prop renders animated spinner, `icon` slot, `active:scale-[0.98]` press feedback.

### Inputs
- Rounded-xl, 1px `surface-border`, white bg, generous 12x16 padding, focus: border brand + ring shadow-focus.
- Error state: border `danger` + error text below (text-xs).
- Hint below input for non-blocking warnings (duplicate phone).
- Password inputs have eye-icon toggle (show/hide).
- Search inputs have leading magnifier icon.

### Dialogs
- Centered modal with backdrop blur, ~440px wide, max-height 90vh, rounded-2xl, shadow-float.
- Header always shows logo + app name + close (×) button.
- Closes on Esc and backdrop click (configurable), traps focus.
- Primary action in footer, right-aligned (for RTL: primary leftmost in the flex row visually right-aligned in RTL flow).
- Success dialog: green check, large green code block, vertical stack of actions (Print primary, two secondary options side by side).

### Cards
- White, rounded-2xl, shadow-card, padding 24px.

### Data Table
- Header row uses `surface-muted` bg, sticky when scrolling, semibold caption text.
- Rows: 48px tall, border-t, hover:bg `brand-50/50` (very soft teal wash).
- Subscription code: small teal chip (bg-brand-50, text-brand, rounded-lg, tracking-widest).
- Action column: 32px icon buttons (edit, print) with native title tooltips; hover fills brand-50 and colors icon brand.
- Pagination below: secondary-style prev + teal-filled next, page dots, range summary text (all Persian digits).

### Sidebar
- Vertical gradient from `brand` → `brand-700`, rounded-l-3xl, margin 12px from window edges (right edge flush to canvas edge on the inner side).
- Active item: white raised pill with shadow, brand-colored icon/text.
- Collapsed state: 78px wide, icons centered, tooltips on items; toggle button at bottom; expanded: 250px.
- Bottom: collapse toggle and red hover "خروج".

### Toast
- Top-center toast stack, 3.5s auto-dismiss, color per type (success/danger/dark), fade + slide-up.

### Top Bar
- Light frosted header with user avatar (initials), aligned to the left (opposite sidebar), fixed above scrollable content.

## 4. Icons
- Inline stroke SVGs at 1.8–2px stroke weight.
- Color follows text color (default ink-muted, hover brand) to keep consistent look.
- No external icon library (zero network, zero extra weight).

## 5. Inconsistencies / gaps noted in the brief & how I resolved them
1. **Pagination "next" color** was specified as `#1E40D8` (blue); brief also said "replace with teal tones for consistency" → I made "next" filled teal, "previous" outlined neutral to match the brand.
2. **Edit Patient dialog** brief mentions both «ثبت ویرایش» and «پرینت» but no explicit "cancel"; I kept "پرینت" secondary and "ثبت ویرایش" primary; close (×) in header provides the dismiss action.
3. **Print** brief says "show preview before printing": implemented by opening a dedicated preview BrowserWindow that calls `webContents.print({ silent: false })`, which invokes the system print dialog (this is the standard Electron way and gives the user the printer/settings panel).
4. **Duplicate phone** behavior: brief said "warn (don't block)" → implemented as a hint under the phone field when focus leaves the field and the phone already exists.
5. **Subscription code start value**: brief says starting at 101; the next code is stored in `settings.next_subscription_code` and never rolls back (codes are never reused).
6. **Dark mode**: explicitly not implemented (light mode only) per brief.
7. **Font**: no font files were provided, so Vazirmatn is bundled as an RTL-safe placeholder. Drop your brand font files into `/assets/fonts/` and update `src/index.css` `@font-face` declarations.
8. **Logo**: I generated a minimal brand-consistent teal-square logo (C + green plus) as a placeholder. Replace `build/icon.png` and `src/components/Logo.tsx` when your brand SVG/PNG is available.
