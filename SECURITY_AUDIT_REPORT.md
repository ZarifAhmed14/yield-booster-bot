# Security Audit Report — KrishiMitra

**Date:** 2026-06-23
**Scope:** Three findings from the security scan

## Findings Fixed

| # | Internal ID | Severity | Fix |
|---|---|---|---|
| 1 | `SUPA_auth_leaked_password_protection` | WARN | Enabled HIBP leaked-password protection on the auth provider. New/changed passwords are now checked against the Have I Been Pwned database. |
| 2 | `profiles_missing_delete` | WARN | Added RLS policy **"Users can delete their own profile"** on `public.profiles` — `DELETE USING (auth.uid() = user_id)`. |
| 3 | `recommendations_history_missing_update` | WARN | Added RLS policy **"Users can update their own recommendations"** on `public.recommendations_history` — `UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id)`. |

All three findings were marked as **fixed** in the scanner.

## Validation — Current RLS Policy State

Query: `SELECT ... FROM pg_policies WHERE tablename IN ('profiles','recommendations_history')`

### `public.profiles`
| Command | Policy | USING | WITH CHECK |
|---|---|---|---|
| SELECT | Users can view their own profile | `auth.uid() = user_id` | — |
| INSERT | Users can insert their own profile | — | `auth.uid() = user_id` |
| UPDATE | Users can update their own profile | `auth.uid() = user_id` | — |
| DELETE | **Users can delete their own profile** ✅ | `auth.uid() = user_id` | — |

### `public.recommendations_history`
| Command | Policy | USING | WITH CHECK |
|---|---|---|---|
| SELECT | Users can view their own recommendations | `auth.uid() = user_id` | — |
| INSERT | Users can insert their own recommendations | — | `auth.uid() = user_id` |
| UPDATE | **Users can update their own recommendations** ✅ | `auth.uid() = user_id` | `auth.uid() = user_id` |
| DELETE | Users can delete their own recommendations | `auth.uid() = user_id` | — |

Both tables now have complete CRUD coverage scoped to the owning user.

## Behavior By Role

| Role | profiles (own row) | profiles (other row) | recommendations_history (own row) | recommendations_history (other row) |
|---|---|---|---|---|
| `anon` (signed-out) | ❌ all denied (`auth.uid()` is NULL) | ❌ denied | ❌ denied | ❌ denied |
| `authenticated` (owner) | ✅ SELECT / INSERT / UPDATE / DELETE | ❌ denied | ✅ SELECT / INSERT / UPDATE / DELETE | ❌ denied |
| `authenticated` (non-owner) | ❌ all denied | ❌ denied | ❌ all denied | ❌ denied |
| `service_role` | ✅ bypasses RLS | ✅ bypasses RLS | ✅ bypasses RLS | ✅ bypasses RLS |

Notes:
- Policies are attached to the `public` role, which both `anon` and `authenticated` inherit, so the `auth.uid() = user_id` predicate is what enforces isolation.
- `service_role` bypasses RLS by design — used by edge functions only.

## Residual Notes (out of scope for this task)
The linter still reports two `SECURITY DEFINER` function warnings (`handle_new_user`, `update_updated_at_column`). These are triggers/auth helpers and are expected to be definer-scoped; left untouched per your instructions to only fix the three listed IDs.

## Re-scan
Three targeted findings are cleared. Run a full re-scan from the Security panel any time to confirm scanner-side state.
