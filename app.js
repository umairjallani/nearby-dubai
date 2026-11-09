(function () {
  "use strict";

  const OVERPASS_URLS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
  ];
  const RADII = [2000, 5000, 10000]; // metres; widen until we find something
  const MAX_RESULTS = 20;

  const cats = window.CATEGORIES;
  let current = cats[0];
  let here = { ...window.DEFAULT_CENTER, fromDevice: false };
  let lastResults = [];

  // ---------- Map ----------
  const map = L.map("map", { zoomControl: true }).setView([here.lat, here.lon], 14);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  const hereMarker = L.circleMarker([here.lat, here.lon], {
    radius: 9, color: "#fff", weight: 3, fillColor: "#1a73e8", fillOpacity: 1,
  }).addTo(map).bindTooltip("You are here");
  const layer = L.layerGroup().addTo(map);

  map.on("click", (e) => {
    setHere(e.latlng.lat, e.latlng.lng, false);
    search();
  });

  // ---------- UI ----------
  const $ = (id) => document.getElementById(id);
  const nav = $("categories");
  cats.forEach((c) => {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.id = c.id;
    b.textContent = `${c.icon} ${c.label}`;
    b.addEventListener("click", () => selectCategory(c.id));
    nav.appendChild(b);
  });

  $("locate").addEventListener("click", locate);
  $("free-only").addEventListener("change", render);

  function selectCategory(id) {
    current = cats.find((c) => c.id === id) || cats[0];
    [...nav.children].forEach((b) => b.setAttribute("aria-pressed", b.dataset.id === current.id));
    $("free-only-wrap").hidden = current.id !== "parking";
    const url = new URL(location.href);
    url.searchParams.set("c", current.id);
    history.replaceState(null, "", url);
    search();
  }

  function setStatus(msg) { $("status").textContent = msg; }

  function setHere(lat, lon, fromDevice) {
    here = { lat, lon, fromDevice };
    hereMarker.setLatLng([lat, lon]);
  }

  function locate() {
    if (!navigator.geolocation) { setStatus("Location not supported — tap the map instead."); return; }
    setStatus("Finding you…");
    navigator.geolocation.getCurrentPosition(
      (p) => { setHere(p.coords.latitude, p.coords.longitude, true); map.setView([here.lat, here.lon], 15); search(); },
      () => { setStatus(`Location blocked — showing ${window.DEFAULT_CENTER.name}. Tap the map to move.`); search(); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  // ---------- Data ----------
  async function overpass(q) {
    let lastErr;
    for (const url of OVERPASS_URLS) {
      try {
        const res = await fetch(url, { method: "POST", body: "data=" + encodeURIComponent(q) });
        if (!res.ok) throw new Error("HTTP " + res.status);
        return (await res.json()).elements || [];
      } catch (e) { lastErr = e; }
    }
    throw lastErr;
  }

  let searchId = 0;
  async function search() {
    const id = ++searchId;
    layer.clearLayers();
    $("results").innerHTML = "";
    for (const r of RADII) {
      setStatus(`Searching ${current.label.toLowerCase()} within ${r / 1000} km…`);
      const around = `(around:${r},${here.lat},${here.lon})`;
      const q = `[out:json][timeout:25];(${current.query.split("{{around}}").join(around)});out center tags 200;`;
      let els;
      try { els = await overpass(q); }
      catch (e) { if (id === searchId) setStatus("Map data service is busy — try again in a minute."); return; }
      if (id !== searchId) return; // a newer search started
      if (els.length >= 3 || r === RADII[RADII.length - 1]) {
        lastResults = els.map(toPlace).filter(Boolean).sort((a, b) => a.dist - b.dist);
        render();
        return;
      }
    }
  }

  function toPlace(el) {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat == null) return null;
    const t = el.tags || {};
    return {
      lat, lon, tags: t,
      name: t["name:en"] || t.name || t["name:ar"] || current.label,
      dist: haversine(here.lat, here.lon, lat, lon),
      osm: `https://www.openstreetmap.org/${el.type}/${el.id}`,
    };
  }

  function parkingFee(t) {
    if (t.fee === "no") return { label: "Free", cls: "free" };
    if (t.fee === "yes" || t.fee) return { label: "Paid", cls: "paid" };
    return { label: "Fee unknown", cls: "unknown" };
  }

  // ---------- Render ----------
  function render() {
    layer.clearLayers();
    const list = $("results");
    list.innerHTML = "";
    let items = lastResults;
    if (current.id === "parking" && $("free-only").checked) items = items.filter((p) => p.tags.fee === "no");
    items = items.slice(0, MAX_RESULTS);

    if (!items.length) {
      setStatus(current.id === "parking" && $("free-only").checked
        ? "No parking tagged as free nearby. Most Dubai parking isn't tagged — untick to see all."
        : `No ${current.label.toLowerCase()} found within ${RADII[RADII.length - 1] / 1000} km.`);
      return;
    }
    setStatus(`${items.length} nearest ${current.label.toLowerCase()} — closest first`);

    const bounds = L.latLngBounds([[here.lat, here.lon]]);
    items.forEach((p, i) => {
      const fee = current.id === "parking" ? parkingFee(p.tags) : null;
      const dir = `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lon}`;
      const extra = [
        fee && `<span class="badge ${fee.cls}">${fee.label}</span>`,
        p.tags.opening_hours && `<span class="hours">🕒 ${esc(p.tags.opening_hours)}</span>`,
        p.tags.route_ref && `<span class="hours">Routes: ${esc(p.tags.route_ref)}</span>`,
      ].filter(Boolean).join(" ");

      const html = `<strong>${esc(p.name)}</strong> <span class="dist">${fmt(p.dist)}</span><br>${extra}
        <div class="links"><a href="${dir}" target="_blank" rel="noopener">Directions</a>
        <a href="${p.osm}" target="_blank" rel="noopener">Details / edit</a></div>`;

      const m = L.marker([p.lat, p.lon], {
        icon: L.divIcon({ className: "pin", html: `<span>${current.icon}</span>`, iconSize: [30, 30] }),
      }).bindPopup(html).addTo(layer);

      const li = document.createElement("li");
      li.innerHTML = html;
      li.addEventListener("click", (e) => {
        if (e.target.tagName === "A") return;
        map.setView([p.lat, p.lon], 17); m.openPopup();
      });
      list.appendChild(li);
      if (i < 5) bounds.extend([p.lat, p.lon]);
    });
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
  }

  // ---------- Utils ----------
  function haversine(a1, o1, a2, o2) {
    const R = 6371000, rad = Math.PI / 180;
    const dA = (a2 - a1) * rad, dO = (o2 - o1) * rad;
    const h = Math.sin(dA / 2) ** 2 + Math.cos(a1 * rad) * Math.cos(a2 * rad) * Math.sin(dO / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function fmt(m) { return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`; }
  function esc(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  // ---------- Start ----------
  const startCat = new URLSearchParams(location.search).get("c");
  selectCategory(cats.some((c) => c.id === startCat) ? startCat : cats[0].id);
  locate();
})();
