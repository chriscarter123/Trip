# Baht → USD

A one-page currency converter you install on your phone's Home Screen.
It's a plain web app (a PWA): no App Store, TestFlight or sideloading, and no build step.

## Put it online (GitHub Pages, free)

1. On GitHub, open the repo → **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, pick the branch
   (e.g. `main`) and folder `/ (root)`, then **Save**.
3. After a minute it's live at `https://<your-username>.github.io/Trip/`.

## Install on your phone

- **iPhone (Safari):** open the URL → Share button → **Add to Home Screen**.
- **Android (Chrome):** open the URL → ⋮ menu → **Install app** / **Add to Home screen**.

## How it gets rates

- Calls a free, no-key API straight from the phone (`open.er-api.com`, falling back to
  `currency-api` on jsDelivr). No server or account of your own needed.
- The last rate is saved on the phone, so it still works with no signal (it shows when the rate is from).
- It re-checks at most every 6 hours, and when you reopen the app.

## Files

```
index.html            the page
css/styles.css        styling
js/app.js             UI: inputs, quick amounts, rate display
js/rates.js           rate sources + on-device cache (add currencies/sources here)
sw.js                 offline caching of the app files
manifest.webmanifest  name/icon/colors used when installed
icons/                home screen icons
```

## Adding features later

- New screen/feature: add a module in `js/` and import it from `app.js`.
- Other currencies: `open.er-api.com` returns every currency, so `rates.js` can return the whole table.
- After changing any file, bump `VERSION` in `sw.js` so installed phones pick up the update.

## Run locally

```
python3 -m http.server 8000   # then open http://localhost:8000
```
