## Goal
Take **FlowPulse Finance** fully out of view across the app — public site, authenticated app, and admin — while leaving every file, route handler, edge function, and DB row intact for future re-activation. **FlowPulse Investor** becomes the sole visible platform.

## Approach
No files deleted, no database changes, no edge functions removed. Pure surface-level hiding via:
1. **Route redirects** — every `/finance/*`, `/dashboard`, `/login/finance`, `/admin/login/finance` URL forwards to the matching `/investor/*` route. Bookmarks and old links keep working.
2. **Admin platform switcher** — Finance toggle hidden, default forced to Investor, localStorage `admin-platform` migrated to `"investor"` on load.
3. **Marketing site** — Finance hero cards, pricing tier, features rows, and portal links removed from `Index.tsx`, `Pricing.tsx`, `Features.tsx`, `Login.tsx`, `AppHeader`/footer.
4. **Sidebars & layouts** — `FinanceLayout` and `AppSidebar` finance entries kept on disk but no longer reachable via UI links.

## Files to edit (presentation only)
- `src/App.tsx` — add `<Navigate>` redirects for `/dashboard`, `/finance`, `/finance/*`, `/finance-payroll`, `/finance-crm`, `/finance-ai-generator`, `/login/finance`, `/admin/login/finance` → investor equivalents. Lazy imports left in place.
- `src/components/admin/PlatformSwitcher.tsx` — render only the Investor pill; clicking is a no-op.
- `src/pages/AdminDashboard.tsx` — on mount, force `localStorage["admin-platform"] = "investor"`; remove Finance copy in headers/labels.
- `src/components/admin/adminNavConfig.ts` — strip "Finance" from any platform meta labels.
- `src/components/admin/FlowPulseScraperHub.tsx` — drop the finance branch; always render investor variant.
- `src/pages/Index.tsx` — remove Finance platform card/hero/section; Investor becomes the lead.
- `src/pages/Pricing.tsx` — remove Finance pricing tier card.
- `src/pages/Features.tsx` — remove Finance feature column/section.
- `src/pages/Login.tsx` — remove "FlowPulse Finance" portal tile.
- `src/pages/About.tsx` — replace any Finance copy with Investor framing.
- Public header/footer components (if they link to Finance) — remove those links.

## Files explicitly kept on disk (untouched, for resurrection)
- `src/pages/finance/**` (all pages)
- `src/pages/FinancePayroll.tsx`, `src/pages/AdminLoginFinance.tsx`, `src/pages/LoginFinance.tsx` if present
- `src/components/FinanceLayout.tsx`
- All `analyst-*` edge functions, `platform = 'finance'` DB rows and RLS policies
- Memory files referring to finance

## Out of scope
- No database migration, no edge function changes, no removal of `platform='finance'` data.
- No rename of memory entries — they still document how finance works for when it returns.
- Admin user roles (`finance_admin`) untouched.

## Risk / reversal
To restore Finance later: revert this diff (or remove the `<Navigate>` redirects and re-add the Finance pill in `PlatformSwitcher` + marketing cards). All business logic and data remain live.
