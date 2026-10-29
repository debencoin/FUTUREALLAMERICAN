# FAA Recruit app

Future All American athlete pages as an installable web app and an iOS/Android app.
Athlete pages, ratings and offers, the national watch list, QR/NFC Connect codes,
sponsor spots, donations (gear, gift cards, Donation Calendar), NFT drops, the ATHX
wallet, Share & Earn, chat, the athlete backend and the owner backend with the
revenue dashboard.

It is the same app as the claude.ai page, moved onto its own stack:

| Piece | Where it lives |
| --- | --- |
| App screens and logic | `www/app.js`, `www/styles.css` |
| Site data (athletes, rankings, sponsors, settings) | `www/state.json` as the starting copy; the live copy is the `site_state` table once Supabase is set up |
| Sign-in, database, uploads, publishing | `www/platform.js` on Supabase |
| Photos, logos, highlight videos | `www/assets/` |
| Database tables and access rules | `supabase/schema.sql` |
| Installable web app | `www/manifest.webmanifest`, `www/sw.js`, `www/icons/` |
| iOS and Android | Capacitor (`capacitor.config.json`) |

There is no build step. The `www` folder is the whole app.

## 1. Try it now (demo mode)

```bash
cd recruit-app
npx --yes serve www -l 5173
```

Open http://localhost:5173. Everything you can see works; sign-in, saving and uploads
are off until Supabase is connected.

## 2. Connect Supabase (sign-in, data, uploads)

1. Create a free project at https://supabase.com.
2. **SQL Editor → New query**, paste all of `supabase/schema.sql`, run it.
   It makes `fasterphysicaltherapy@gmail.com` the owner. Add other owner emails to `app_owners`.
3. **Authentication → Providers**: turn on **Email**, **Google** and **Twitter (X)**.
   Google and X each need an app created in their developer consoles; Supabase shows the
   callback URL to paste there.
4. **Authentication → URL Configuration**: set Site URL to your app address and add it
   (plus `http://localhost:5173`) under Redirect URLs.
5. In `www/config.js` fill in `supabaseUrl`, `supabaseAnonKey` (Project Settings → API) and `siteUrl`.
6. Sign in on the app with the owner email, open **My Account → Company Backend**, check the
   data, and press **Publish changes** once. That copies `state.json` into the live
   `site_state` table; from then on every publish updates the live app for everyone.

Instagram has no sign-in option for apps like this, so Instagram ownership is still verified
with the bio code in the claim and Connect Your Socials flows.

## 3. Put the web app online

Any static host works. Point it at the `recruit-app/www` folder:

- **Vercel / Netlify**: new project from this repo, root directory `recruit-app/www`, no build command.
- **GitHub Pages**: publish the `recruit-app/www` folder.

Use HTTPS so the "Add to Home Screen" install and offline mode work. Put the final address
in `siteUrl` so QR codes and NFC wristbands point to it.

## 4. iOS and Android apps

Needs Node.js 20+, Xcode (iOS, on a Mac) and Android Studio (Android).

```bash
cd recruit-app
npm install
npm run ios       # adds the iOS project and opens Xcode
npm run android   # adds the Android project and opens Android Studio
```

Run `npm run sync` after changing anything in `www`. Set the app icon from
`www/icons/icon-1024.png` in Xcode and Android Studio before submitting.

## Notes

- The Supabase JavaScript client loads from the jsDelivr CDN at runtime.
- Payments still go through your Stripe links, Venmo, Cash App and Zelle, set in the owner
  backend's Payments tab. Apple Pay appears on Stripe checkout when it is turned on in Stripe.
- Athletes' payout handles are stored in their private `profiles` documents; only owners can read them.
