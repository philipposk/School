# OAuth Provider Setup (Google / Facebook / Apple)

Code path is wired. To actually let users sign in with a provider, you must (a) create an OAuth app at the provider, (b) paste the client ID/secret into Supabase, and (c) toggle the provider on in Supabase.

Supabase project: `basmlwgdznmfhdqxtzaz` → https://supabase.com/dashboard/project/basmlwgdznmfhdqxtzaz/auth/providers

Common values:
- **Site URL**: `https://school.6x7.gr` (already set)
- **Authorized redirect URI** (the one to paste at every provider): `https://basmlwgdznmfhdqxtzaz.supabase.co/auth/v1/callback`

---

## Google

1. https://console.cloud.google.com/apis/credentials → "Create credentials" → "OAuth client ID".
2. Application type: **Web application**.
3. Authorized JavaScript origins: `https://school.6x7.gr`
4. Authorized redirect URI: `https://basmlwgdznmfhdqxtzaz.supabase.co/auth/v1/callback`
5. Save → copy **Client ID** and **Client secret**.
6. Supabase dashboard → Authentication → Providers → Google → toggle on → paste both → Save.
7. OAuth consent screen: add your email as a test user (or publish if you want anyone to sign in).

## Facebook

1. https://developers.facebook.com/apps → "Create App" → type "Consumer".
2. Add product: **Facebook Login** → Web.
3. Settings → Basic: grab **App ID** and **App Secret**.
4. Facebook Login → Settings → Valid OAuth Redirect URIs:
   `https://basmlwgdznmfhdqxtzaz.supabase.co/auth/v1/callback`
5. Supabase dashboard → Authentication → Providers → Facebook → toggle on → paste App ID/Secret → Save.
6. App Review: switch to Live mode when ready (otherwise only test users can sign in).

## Apple

Apple is the most painful. Needs a paid Apple Developer account ($99/yr).

1. https://developer.apple.com/account/resources/identifiers/list → "+" → **App IDs** → "App". Enable "Sign in with Apple" capability.
2. New **Services ID** (this is the OAuth client ID). Configure → enable Sign in with Apple → Primary App ID = the one above. Add domain `basmlwgdznmfhdqxtzaz.supabase.co` and return URL `https://basmlwgdznmfhdqxtzaz.supabase.co/auth/v1/callback`.
3. Keys → "+" → new key with "Sign in with Apple" enabled → download the `.p8` file (only chance, save it). Note the **Key ID** and your **Team ID**.
4. Generate a client secret JWT (Supabase has a generator in the Apple provider config, or use `apple-signin-auth` npm). Inputs: Team ID + Key ID + Services ID + the `.p8` private key. JWT is valid for max 6 months — you have to re-generate.
5. Supabase dashboard → Authentication → Providers → Apple → toggle on → paste Services ID as Client ID and the JWT as Secret → Save.

---

## Test

After enabling a provider:

1. Visit https://school.6x7.gr in an incognito window.
2. Click the OAuth button.
3. Complete the provider flow.
4. You should be returned to `https://school.6x7.gr/#access_token=...`.
5. The frontend's `handleOAuthCallback()` (in `init()`) reads the session, populates `user`, strips the fragment from the URL, and updates the UI.

If a provider isn't enabled, the user sees a "coming soon" modal (we detect the Supabase `"provider is not enabled"` error and show the friendly notice).

---

## Useful commands

```bash
# Re-fetch Supabase auth config (verify providers turn-on succeeded)
PAT=sbp_...
curl -s -H "Authorization: Bearer $PAT" \
  https://api.supabase.com/v1/projects/basmlwgdznmfhdqxtzaz/config/auth \
  | jq '{external_google_enabled, external_facebook_enabled, external_apple_enabled, site_url, uri_allow_list}'

# Update an OAuth provider via API (alternative to dashboard)
curl -s -X PATCH -H "Authorization: Bearer $PAT" -H "Content-Type: application/json" \
  https://api.supabase.com/v1/projects/basmlwgdznmfhdqxtzaz/config/auth \
  -d '{
    "external_google_enabled": true,
    "external_google_client_id": "...apps.googleusercontent.com",
    "external_google_secret": "GOCSPX-..."
  }'
```
