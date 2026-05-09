# S01: Login/logout button + redirect conditionnel — UAT

**Milestone:** M005
**Written:** 2026-05-08T06:38:07.057Z

## UAT S01

### Scenario 1: Anonymous user visits root
1. Navigate to http://localhost:3000/
2. ✅ Should redirect to /sign-in?callbackUrl=/

### Scenario 2: User signs up and sees dashboard
1. Go to sign-in page, toggle to sign-up mode
2. Fill in name, email, password and submit
3. ✅ Should land on dashboard (/)
4. ✅ Header shows "Logout" button

### Scenario 3: User logs out
1. Click "Logout" in header
2. ✅ Should redirect to /sign-in
3. ✅ Header shows "Login" link
4. ✅ Navigating to / redirects to /sign-in

### Scenario 4: Authenticated user visits root
1. Log in successfully
2. Navigate to /
3. ✅ Should stay on dashboard, no redirect
