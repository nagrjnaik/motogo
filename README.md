# motoGo — Live Pack Telemetry

A lightweight, zero-install web app for motorcycle group rides. Everyone opens the same link, shares their GPS, and sees the whole pack on one live map — with distances, spread, and one-tap "stop ahead" signals.

Everything lives in a single static file (`index.html`), so there is no build step and no backend to run.

## Features

- **Live pack map** — see every rider's position, speed, and distance from you (Leaflet + OpenStreetMap, with a vector fallback canvas).
- **Room-based sessions** — each ride has a Session ID like `MG-49X2`. Share the link or type the ID in manually.
- **Stop signals** — broadcast "Stopping ahead — pull over!" (or a custom message) to the pack; riders can acknowledge and navigate to the pin.
- **Pack spread indicator** — max distance between riders at a glance.
- **Rider profiles** — callsign and livery colour, remembered between rides.
- **Daylight / Night mode**, mobile-first layout, WhatsApp invite sharing.
- **iOS GPS troubleshooter** for the common "location permission blocked" cases.

## Running it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

Geolocation requires a **secure context** (HTTPS or `localhost`). It deploys as-is to GitHub Pages, Netlify, Cloudflare Pages, or any static host.

### Deploy on GitHub Pages

1. Push this repo to GitHub.
2. **Settings → Pages → Build and deployment**: deploy from branch `main`, folder `/ (root)`.
3. Your app will be live at `https://<username>.github.io/motogo/`.

## Joining a ride

1. **Start a ride:** enter your callsign, pick a colour, and tap **Start Broadcasting GPS**. A random Session ID is generated for you; you become the room owner on that device.
2. **Invite friends:** tap **Share** in the ride screen to copy the link or send it via WhatsApp.
3. **Join:** open the invite link or enter the Session ID manually, then tap **Start Broadcasting GPS**. The guest sees a waiting screen while the owner receives an approval prompt. The guest's app does not start broadcasting its GPS until approval is received.
4. **Approve or reject:** the owner can accept or reject each join request from the on-screen prompt.

**Important limitation:** this is an app-level admission workflow, not server-enforced access control. The app is static and uses a public MQTT broker; a technically capable person can bypass the UI or forge MQTT messages. Do not treat room approval or a random Session ID as a security boundary, and avoid sharing live location in sensitive situations.

## How it works

- **Transport:** MQTT over WebSockets via the public `broker.emqx.io` broker, on topic `motogo/v5/room/<SESSION_ID>`. A `BroadcastChannel` handles multiple tabs on the same device.
- **Location:** the browser Geolocation API (`watchPosition`), with a high-accuracy attempt first and a Wi-Fi/cell fallback.
- **Distances:** Haversine formula, with bearing and cardinal direction.
- **Storage:** callsign, colour, and theme are kept in `localStorage`. No accounts, no server-side storage.

## Tech stack

Vanilla JavaScript · Tailwind CSS (CDN) · Leaflet · MQTT.js

## Privacy notes

Live coordinates, rider names, speeds, and stop signals are transmitted through a **public** MQTT broker. The join approval prompt reduces accidental entry by ordinary app users but cannot authenticate participants or prevent crafted MQTT clients from reading or publishing room messages. Exit the room (the red button) when the ride ends to stop this app from broadcasting.

## Project structure

```
motogo/
├── index.html   # the entire app (UI, styles, logic)
└── README.md
```

## Roadmap ideas

- Private/authenticated rooms and a self-hosted broker
- Ride history and GPX export
- Offline map tiles

## License

No license has been chosen yet. Add a `LICENSE` file (e.g. MIT) before accepting contributions.
