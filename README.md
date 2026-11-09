# 📍 Nearby Dubai

Find the **nearest public services in Dubai** from your phone: parking (with free/paid labels), bus stops, metro & tram, mosques, pharmacies, hospitals, police, toilets, drinking water, ATMs, petrol, EV charging and parks.

**Live app:** https://umairjallani.github.io/nearby-dubai/

- No sign-up, no API keys, no tracking. Your location stays in your browser.
- Results sorted by straight-line distance, with one-tap directions in Google Maps.
- Works on any modern phone or desktop browser.

## How it works

It's a single static page (HTML + vanilla JS + [Leaflet](https://leafletjs.com/)). It queries live [OpenStreetMap](https://www.openstreetmap.org/) data through the public [Overpass API](https://wiki.openstreetmap.org/wiki/Overpass_API), searching 2 km and then widening to 5 km and 10 km if it finds little nearby.

Shareable links per category: `?c=mosque`, `?c=bus`, `?c=parking`, etc.

## ⚠️ About "free parking"

Most public parking in Dubai is paid (RTA zones, Parkin), and most car parks in OpenStreetMap **don't say whether they're free**. The app labels each car park **Free**, **Paid** or **Fee unknown** based on the OSM `fee` tag. The *Free parking only* filter shows only car parks explicitly tagged `fee=no`.

**You can fix this:** if you know a free car park, open it on [openstreetmap.org](https://www.openstreetmap.org/), and add `fee=no`. It will show up in the app for everyone.

## Run locally

```bash
git clone https://github.com/umairjallani/nearby-dubai.git
cd nearby-dubai
python3 -m http.server 8000   # then open http://localhost:8000
```

Geolocation needs `https://` or `localhost`.

## Add a category

Edit [`categories.js`](categories.js) and add an entry with an OSM Overpass filter:

```js
{ id: "library", label: "Library", icon: "📚", query: 'nwr["amenity"="library"]{{around}};' }
```

## Roadmap

- [ ] Other emirates (Abu Dhabi, Sharjah…): only the default centre needs changing
- [ ] Arabic / Urdu / Hindi UI
- [ ] Walking-time estimates instead of straight-line distance
- [ ] Prayer times next to mosques
- [ ] Offline cache (PWA)

Contributions welcome: open an issue or PR.

## Credits & license

Map data © OpenStreetMap contributors, [ODbL](https://www.openstreetmap.org/copyright). Code under the [MIT License](LICENSE).
