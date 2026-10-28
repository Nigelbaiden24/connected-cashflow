# Push notifications (iOS, Android, web)

FlowPulse sends push notifications through **OneSignal** on every platform. Users are addressed by
their Supabase user id (OneSignal *external id*), so the backend never handles raw device tokens.

## How it fits together

| Piece | Where |
|---|---|
| Native SDK (iOS/Android) | `onesignal-cordova-plugin`, wrapped by `src/lib/nativePush.ts` |
| Web SDK | `src/hooks/useOneSignal.ts` (service worker `public/OneSignalSDKWorker.js`) |
| App wiring (login/logout, taps → deep links, foreground banner, resume sync) | `src/components/notifications/PushBridge.tsx` |
| Permission prompt (after sign-in, at most every 14 days) | `PushPermissionPrompt` in the same file, shown from `InvestorLayout` |
| Settings screen (topics, deal categories, devices, test button) | `/investor/notifications` → `src/pages/investor/NotificationSettingsPage.tsx` |
| Devices and preferences | tables `user_push_devices`, `notification_preferences` (migration `20261028090000_push_notifications.sql`) |
| Sending service | `supabase/functions/_shared/push.ts` (`sendPush`) |
| Admin / internal send endpoint | `send-push-notification` (admins and edge functions only) |
| Event triggers | `notify-event`, called from admin actions via `src/lib/pushEvents.ts` |
| Test notification | `push-test` (sends to the caller's own devices; 1 per minute) |

**Deep links:** notifications carry `data.route` (e.g. `/investor/stock-research?report=…`). Tapping one
opens that screen, also from a cold start. Only same-app paths (or flowpulse.co.uk URLs) are followed.

**Topics** (users switch each on/off in Settings): `research`, `deals` (optionally limited to chosen
categories), `portfolio`, `market` (off by default), `account`. `test` and admin broadcasts ignore topics.

**Token refresh and clean-up:** OneSignal refreshes and retires tokens. The app re-records the device
whenever OneSignal reports a subscription change and on every resume; sign-out removes the device row and
logs the device out of OneSignal; a weekly job deletes devices not seen for 180 days.

## One-off setup (credentials)

### Android
1. In the [Firebase console](https://console.firebase.google.com) create a project (free).
2. Project settings → Service accounts → **Generate new private key** (JSON).
3. OneSignal dashboard → your app → Settings → Push & In-App → **Google Android (FCM)** → upload that JSON.

No `google-services.json` is needed in the app: OneSignal's SDK gets the Firebase details from OneSignal.

### iOS
1. Join the **Apple Developer Program**.
2. Certificates, Identifiers & Profiles → Identifiers → App ID `uk.co.flowpulse.app` with **Push Notifications** enabled.
3. Keys → create a key with **Apple Push Notifications service (APNs)** → download the `.p8`; note the Key ID and your Team ID.
4. OneSignal dashboard → Settings → Push & In-App → **Apple iOS (APNs)** → upload the `.p8` with Key ID, Team ID and bundle id.
5. On a Mac: `npm run build:mobile && npx cap sync ios && npx cap open ios`, select your team under Signing &
   Capabilities (Push Notifications and Background Modes → Remote notifications are already configured), then run on an iPhone.

### Web
OneSignal dashboard → Settings → Push & In-App → **Web** → site URL `https://flowpulse.co.uk`.

## Testing
- App or browser: **Notifications → Send test notification** (`/investor/notifications`).
- Admin: **Push Notification Centre → Test on my devices**.
- The result says how many devices received it; if none, allow notifications on the device and try again.
