# Alpha Sigma Phi — Theta Rho, Texas A&M University

A complete multi-page website in HTML, CSS and JavaScript with a small JavaScript server for the protected store.

## Where to edit
- **HTML pages:** public/index.html, about.html, philanthropy.html, calendar.html, events.html and store.html.
- **Design:** public/assets/styles.css. Cardinal, stone and white colors are defined at the top.
- **Chapter, image slots and social icons:** public/assets/site-config.js.
- **Chapter images:** public/assets/images/.
- **Social icon images:** public/assets/icons/.
- **Events:** public/assets/events-data.js. Includes a commented example. No made-up dates are published.
- **Protected catalog:** server/catalog.js. Initial products are clearly marked collection previews.
- **Full illustrated slot map and instructions:** open the Website & image guide in the site footer.

The Instagram link initially points to the national organization. Replace it with your chapter account.

## Run locally
Install Node.js 22.13 or newer, open a terminal in this folder, then run:

```text
npm install
```

Copy .env.example to both .env and .dev.vars. Set STORE_PASSCODE to a strong passcode and STORE_SESSION_SECRET to a long, random secret (32 bytes or more). The already-prepared local checkout has these values; they are intentionally omitted from the downloadable source archive. Do not share or commit these files.

```text
npm run dev
```

Open the Local URL printed by the server. Use the server instead of double-clicking the HTML files: navigation uses website paths and the store requires its API.

## Build and publish
```text
npm run build
```

This site uses the generated Sites/Vinext hosting layer to serve the HTML and the JavaScript store endpoint as a Cloudflare Worker. Keep its hosting configuration and dependencies. The HTML, CSS and browser JavaScript are plain editable files; React components are not used for the site interface.

Ask Codex to update and republish this site after editing. Set STORE_PASSCODE and STORE_SESSION_SECRET as secret runtime values in Sites before deployment. The current Sites publication is private to the owner; changing it to a public chapter website is a separate access change.

## Store behavior
- Passcode verification happens on the server, never in public JavaScript.
- The catalog API rejects unauthenticated requests.
- A signed HTTP-only cookie lasts eight hours and is Secure over HTTPS.
- Passcode or session secret rotation invalidates existing sessions.
- Login has a basic per-runtime, per-IP attempt limit. It is not a distributed rate limiter.
- The shared passcode grants store catalog access, not individual membership verification.
- Product photos in public/assets/images are public assets. Keep sensitive files out of public/.
- No payment processing or fake checkout is included. Add a real orderUrl to each product to link to your ordering provider.

## Calendar
All displayed times use America/Chicago. Add explicit -05:00 or -06:00 offsets in event timestamps, as appropriate to the date. The same event list powers all views. Export produces an .ics file of upcoming events; it is not a live subscription.

## Photo credit
“Texas A&M University Academic Building” by Donnie Ray Jones, Wikimedia Commons, CC BY 2.0. Displayed with cropping.
https://commons.wikimedia.org/wiki/File:Texas_A%26M_University_Academic_Building.jpg
https://creativecommons.org/licenses/by/2.0/

Keep the credit on image-guide.html while using this photo.

