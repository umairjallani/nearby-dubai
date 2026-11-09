// Each category is an OpenStreetMap query fragment for the Overpass API.
// `{{around}}` is replaced with the search area, e.g. (around:3000,25.2,55.27).
// To add a category, add an entry here — no other code changes needed.
window.CATEGORIES = [
  {
    id: "parking",
    label: "Parking",
    icon: "🅿️",
    query: 'nwr["amenity"="parking"]["access"!~"private|customers"]{{around}};',
  },
  {
    id: "bus",
    label: "Bus stop",
    icon: "🚌",
    query: 'node["highway"="bus_stop"]{{around}};node["public_transport"="platform"]["bus"="yes"]{{around}};',
  },
  {
    id: "metro",
    label: "Metro / Tram",
    icon: "🚇",
    query: 'nwr["railway"="station"]{{around}};nwr["railway"="tram_stop"]{{around}};',
  },
  {
    id: "mosque",
    label: "Mosque",
    icon: "🕌",
    query: 'nwr["amenity"="place_of_worship"]["religion"="muslim"]{{around}};',
  },
  {
    id: "pharmacy",
    label: "Pharmacy",
    icon: "💊",
    query: 'nwr["amenity"="pharmacy"]{{around}};',
  },
  {
    id: "hospital",
    label: "Hospital / Clinic",
    icon: "🏥",
    query: 'nwr["amenity"~"^(hospital|clinic)$"]{{around}};',
  },
  {
    id: "police",
    label: "Police",
    icon: "👮",
    query: 'nwr["amenity"="police"]{{around}};',
  },
  {
    id: "toilets",
    label: "Toilets",
    icon: "🚻",
    query: 'nwr["amenity"="toilets"]{{around}};',
  },
  {
    id: "water",
    label: "Drinking water",
    icon: "🚰",
    query: 'nwr["amenity"="drinking_water"]{{around}};',
  },
  {
    id: "atm",
    label: "ATM",
    icon: "🏧",
    query: 'nwr["amenity"="atm"]{{around}};nwr["atm"="yes"]{{around}};',
  },
  {
    id: "fuel",
    label: "Petrol",
    icon: "⛽",
    query: 'nwr["amenity"="fuel"]{{around}};',
  },
  {
    id: "ev",
    label: "EV charging",
    icon: "🔌",
    query: 'nwr["amenity"="charging_station"]{{around}};',
  },
  {
    id: "park",
    label: "Park",
    icon: "🌳",
    query: 'nwr["leisure"="park"]{{around}};',
  },
];

// Default centre when location is unavailable: Downtown Dubai.
window.DEFAULT_CENTER = { lat: 25.1972, lon: 55.2744, name: "Downtown Dubai" };
