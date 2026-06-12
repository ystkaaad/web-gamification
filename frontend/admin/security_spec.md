# Security Specification - Gamify Admin

## 1. Data Invariants
- Users must have a unique ID matching their Auth UID.
- Missions must have positive point rewards.
- Vouchers must have a cost > 0.
- All writes must include a valid timestamp.

## 2. The Dirty Dozen (Attack Payloads)
1. **Identity Theft**: Attempt to create a user document with an ID different from the Auth UID.
2. **Shadow Field Injection**: Adding `isAdmin: true` to a user profile update.
3. **Price Spoofing**: Updating a voucher to have `cost_points: 0`.
4. **Referral Hijack**: Changing another user's `referral_code`.
5. **Orphaned Mission**: Creating a `user_mission` for a non-existent mission ID.
6. **Negative Reward**: Setting `points_reward: -9999` in a mission.
7. **Timestamp Fraud**: Providing a client-side `created_at` date from 1990.
8. **Bulk Scraping**: Attempting to list all users without being authenticated.
9. **Deletion of Master Data**: An unauthenticated user pokušava delete a mission.
10. **Schema Bloat**: Adding a 1MB string to the `description` field.
11. **Status Shortcut**: Setting an affiliate status directly to `ACTIVE` without a pending state (if logic enforced).
12. **Type Poisoning**: Sending a string for the `points` field.

## 3. Test Runner (Draft)
The `firestore.rules.test.ts` will verify that `request.auth != null` and `isValidUser()` checks are strictly enforced.
