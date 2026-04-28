# QA Test Plan: TMS Sprint 3 Bug Fixes & Onboarding

> [!NOTE]
> This test plan covers the validation of recent bug fixes related to the onboarding flow, dashboard loading, and invite link routing in TrackMyScaffolding (TMS).

## 1. Bug Fix Test Cases

### Bug 1: Onboarding Step 3 "Failed to create record."
**Context:** PocketBase schema validation failed due to an invalid role (`Subcontractor`) and missing `permissions` field.
**Fix:** Set `role='Worker'` and `permissions=[]`.

**TC-1.01: Happy Path - Complete Onboarding Successfully**
- **Preconditions:** New user, not registered.
- **Steps:**
  1. Navigate to `https://trackmyscaffolding.com/signup`.
  2. Complete Step 1 (Account details) and Step 2 (Company details).
  3. Proceed to Step 3 and submit the final form.
- **Expected Result:** Record is created successfully without the "Failed to create record" error. The user is advanced to the next screen (Dashboard).

**TC-1.02: Edge Case - API Validation**
- **Preconditions:** Network tab open in browser developer tools.
- **Steps:**
  1. Complete onboarding up to Step 3.
  2. Submit the form.
  3. Inspect the final `POST /api/collections/users/records` request.
- **Expected Result:** Payload strictly contains `"role": "Worker"` and `"permissions": []`. Response is `200 OK`.

### Bug 2: Black "Loading..." screen after onboarding
**Context:** `DashboardPage` used lazy loading without background styles on the fallback, causing a brief black screen.
**Fix:** `DashboardPage` eagerly imported; `LoadingFallback` now has `bg-background` + spinner.

**TC-2.01: Happy Path - Dashboard Loading UI**
- **Preconditions:** Existing user with valid credentials. Network speed throttled to "Slow 3G" in DevTools (to make loading states visible).
- **Steps:**
  1. Log into the application.
  2. Observe the transition to the Dashboard.
- **Expected Result:** The screen is never fully black. The `LoadingFallback` displays the app's standard background color (`bg-background`) and a loading spinner while the dashboard is being prepared.

**TC-2.02: Edge Case - Direct URL Access**
- **Preconditions:** User is authenticated. Network speed throttled.
- **Steps:**
  1. Navigate directly to `https://trackmyscaffolding.com/dashboard` in a new tab.
- **Expected Result:** The `LoadingFallback` briefly appears with the correct styling (`bg-background` and spinner), followed by the Dashboard rendering correctly.

### Bug 3: Invite link (`/join?token=xxx`) routing to wrong page
**Context:** The `/join` route previously pointed to `SubcontractorSignupPage`.
**Fix:** The route now correctly points to `JoinProjectPage`.

**TC-3.01: Happy Path - Valid Invite Link Routing**
- **Preconditions:** User is logged out.
- **Steps:**
  1. Navigate to `https://trackmyscaffolding.com/join?token=valid_test_token`.
- **Expected Result:** The user is routed to the `JoinProjectPage`. The page content correctly reflects joining an existing project, not creating a brand new subcontractor account.

**TC-3.02: Edge Case - Missing Token**
- **Preconditions:** User is logged out.
- **Steps:**
  1. Navigate to `https://trackmyscaffolding.com/join` (no token parameter).
- **Expected Result:** The user is still routed to `JoinProjectPage` (which should cleanly handle the missing state, typically by displaying an error message regarding the missing or invalid token).

## 2. Regression Checklist: Full Onboarding Flow

To ensure the bug fixes haven't broken the overall onboarding experience, run this regression suite:

- [ ] **Account Creation:** Can a user register with valid email/password?
- [ ] **Validation:** Do form fields correctly reject invalid emails and weak passwords?
- [ ] **Step Navigation:** Can the user move back and forth between onboarding steps without losing data?
- [ ] **PocketBase Schema Mapping:** Are new users created in PocketBase correctly mapped with the default `role` ('Worker') and `permissions` ([]) across all signup entry points?
- [ ] **Dashboard Redirect:** After the final onboarding step, is the user smoothly redirected to the Dashboard?
- [ ] **Loading States:** Are all intermediate loading states styled with `bg-background` and an appropriate spinner?
- [ ] **Email Verification:** Does the system trigger the verification email upon signup?

## 3. End-to-End Test Case: Invite Email Flow

**TC-4.01: E2E Invite to Join Project**
- **Preconditions:** Admin user logged in. Target user email is not registered.
- **Steps:**
  1. Admin navigates to Team/Project settings and invites a new worker via email.
  2. Verify the email is received by the target user.
  3. Target user clicks the invite link (e.g., `/join?token=xxx`).
  4. Verify the link opens the `JoinProjectPage` (Validation of Fix #3).
  5. Target user completes the sign-up form on the Join Project page.
  6. Verify the user is successfully created without a PocketBase validation error (Validation of Fix #1).
  7. Verify the user is redirected to the Dashboard with the correct loading UI (Validation of Fix #2).
- **Expected Result:** The user seamlessly transitions from the email invite to viewing the dashboard, interacting with all three fixed components successfully along the way.

## 4. Pass/Fail Criteria

> [!IMPORTANT]
> The sprint will only be considered verified if ALL of the following criteria are met.

### Pass Criteria
- **Zero Critical Errors:** No instances of "Failed to create record" or 400 errors during any registration or join flow.
- **UI Integrity:** No black or unstyled screens appear during loading transitions, particularly post-login or post-onboarding.
- **Routing Accuracy:** All invite links (`/join?token=...`) reliably load the `JoinProjectPage`.
- **Regression:** 100% of the regression checklist items pass without issue.

### Fail Criteria
- Any step in the onboarding or join flow results in a blocked state, unhandled exception, or incorrect PocketBase database entry (e.g., wrong role).
- The `DashboardPage` or its loading fallback displays broken CSS, missing background colors, or a blank/black screen at any point.
- The `/join` route resolves to the `SubcontractorSignupPage`.
