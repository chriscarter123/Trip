# Trip

A travel command center you install on your phone's Home Screen:
- **Today:** the day's itinerary (with "Now" highlighted), tonight's hotel, a big
  Thai-address card to show drivers, and emergency numbers.
- **Money:** baht ↔ dollar converter with a running total.

Everything works offline once it has been opened.
It's a plain web app (a PWA): no App Store, TestFlight or sideloading, and no build step.

## Put it online (GitHub Pages, free)

1. On GitHub, open the repo → **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, pick the branch
   (e.g. `main`) and folder `/ (root)`, then **Save**.
3. After a minute it's live at `https://<your-username>.github.io/Trip/`.

## Install on your phone

- **iPhone (Safari):** open the URL → Share button → **Add to Home Screen**.
- **Android (Chrome):** open the URL → ⋮ menu → **Install app** / **Add to Home screen**.

## How it gets exchange rates

- Calls a free, no-key API straight from the phone (`open.er-api.com`, falling back to
  `currency-api` on jsDelivr). No server or account of your own needed.
- The last rate is saved on the phone, so it still works with no signal (it shows when the rate is from).
- It re-checks at most every 6 hours, and when you reopen the app.

## Editing your itinerary

Everything on the Today tab comes from **`data/trip.json`**. Edit it on GitHub
(works from your phone: open the file → pencil icon → commit). The app picks up the
new version next time it's opened with a connection, and keeps the last copy for offline.

```jsonc
{
  "name": "Thailand",
  "timezone": "Asia/Bangkok",              // decides what "today" and "now" mean
  "essentials": [                          // shown under "Essentials & emergency"
    { "label": "Tourist Police", "value": "1155", "tel": "1155" },
    { "label": "Insurance", "value": "Policy # 123" },
    { "label": "Visa", "value": "Open PDF", "url": "https://..." }
  ],
  "days": [
    {
      "date": "2026-12-02",
      "title": "Old City",
      "stay": {                            // the "Tonight" card
        "name": "Hotel name",
        "address": "Street, City",         // tap → Google Maps
        "addressLocal": "ที่อยู่ภาษาไทย",       // adds a "Show driver" button
        "phone": "+66 ...",
        "confirmation": "ABC123"
      },
      "items": [
        {
          "time": "08:30",                 // 24-hour HH:MM
          "title": "Grand Palace",
          "place": "Grand Palace, Bangkok",// tap → Google Maps
          "placeLocal": "พระบรมมหาราชวัง",  // optional: "Show driver"
          "notes": "Cover shoulders",
          "confirmation": "XYZ",
          "url": "https://..."             // optional link (tickets, booking)
        }
      ]
    }
  ]
}
```

Every field except `date` and `title` is optional.

## Files

```
index.html             page layout: one <section class="view"> per tab + bottom tab bar
css/styles.css         styling
js/app.js              tab switching; register new tabs here
js/util.js             shared helpers
js/today/today.js      Today tab (reads data/trip.json)
js/money/money.js      Money tab: converter + quick amounts
js/money/rates.js      exchange-rate sources + on-device cache
js/money/tally.js      running total, saved on the device
data/trip.json         your itinerary and essentials
sw.js                  offline caching
manifest.webmanifest   name/icon/colors used when installed
icons/                 home screen icons
```

## Adding features later

- New tab: add a `<section class="view" id="view-NAME">` and a tab link in `index.html`,
  put the code in `js/NAME/`, and add it to `TABS` in `js/app.js`.
- After changing any code file, bump `VERSION` in `sw.js` (and add new files to its list)
  so installed phones pick up the update. Editing `data/trip.json` doesn't need this.

## Run locally

```
python3 -m http.server 8000   # then open http://localhost:8000
```
