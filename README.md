# motoGo — Live Pack Telemetry

A lightweight, zero-install web app for motorcycle group rides. Everyone opens the same link, shares their GPS, and sees the whole pack on one live map — with distances, spread, and one-tap "stop ahead" signals.

The app remains static and GitHub Pages compatible: `index.html` contains the UI and logic, with a web manifest, service worker, and app icons alongside it. There is no build step or app backend to run.

## Features

- **Live pack map** — see every rider's position, speed, and distance from you (Leaflet + OpenStreetMap, with a vector fallback canvas).
- **Room-based sessions** — each ride has a Session ID like `MG-49X2`. Owners can choose **Open** (automatically accept anyone with the ID) or **Closed** (approve each join request).
- **Stop signals** — broadcast "Stopping ahead — pull over!" (or a custom message) to the pack; riders can acknowledge and navigate to the pin.
- **Pack spread indicator** — max distance between riders at a glance.
- **Rider profiles** — callsign and livery colour, remembered between rides.
- **Daylight / Night mode**, mobile-first layout, WhatsApp invite sharing, and an installable PWA experience.
- **iOS GPS troubleshooter** for the common "location permission blocked" cases.

## Running it

Serve the folder on localhost for local testing (especially when testing PWA installation and the service worker):

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

1. **Start a ride:** enter your callsign, pick a colour, choose Open or Closed room access, and tap **Start Broadcasting GPS**. A random Session ID is generated for you.
2. **Invite friends:** tap **Share** in the ride screen to copy the link or send it via WhatsApp.
3. **Join:** open the invite link or enter the Session ID manually, then tap **Start Broadcasting GPS**.
4. **Open room:** join requests are accepted automatically. Share the Room ID only with people you intend to invite.
5. **Closed room:** the guest waits while the owner accepts or rejects the request. Closed is the default setting.

**Important limitation:** this is an app-level admission workflow, not server-enforced access control. The app is static and uses a public MQTT broker; a technically capable person can bypass the UI or forge MQTT messages. Do not treat room approval or a random Session ID as a security boundary, and avoid sharing live location in sensitive situations.

## Install on a phone

MotoGo includes a web app manifest, app icons, and a service worker for installation from a secure HTTPS origin.

- **Android / Chrome:** open the GitHub Pages site in Chrome and use **Install app** from the browser menu (or the in-app Install button when Chrome offers it).
- **iPhone / Safari:** open the site in Safari, tap **Share**, then **Add to Home Screen**.
- The service worker caches the app shell, but map libraries and live room synchronization still depend on network access.

**Background location limitation:** installing MotoGo as a PWA does not guarantee that the browser will keep GPS updates running while another app is foregrounded or the phone is locked. Browser and operating-system power management may suspend the page. Reliable background GPS requires a native app with the appropriate platform permissions.

Riders whose updates stop remain visible at their last known position and are marked stale; they leave the roster when they explicitly exit the room. This is a UI-level behavior, not a guarantee that their phone is still sharing location.

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
├── index.html        # app UI, styles, and logic
├── manifest.json    # PWA metadata and install icons
├── service-worker.js # static app-shell cache
├── icons/
│   ├── motogo.svg
│   ├── motogo-192.png
│   ├── motogo-512.png
│   ├── motogo-192.svg
│   └── motogo-512.svg
└── README.md
```

## Roadmap ideas

- Private/authenticated rooms and a self-hosted broker
- Ride history and GPX export
- Offline map tiles

## License

No license has been chosen yet. Add a `LICENSE` file (e.g. MIT) before accepting contributions.
