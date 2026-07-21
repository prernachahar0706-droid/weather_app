// ============================================================
// 1. Put your OpenWeatherMap API key here
// Get a free one at https://openweathermap.org/api
// ============================================================
const API_KEY = "54a06eb2d38906b94cd15dce27a207ed";

const els = {
  status: document.getElementById("status"),
  weather: document.getElementById("weather"),
  cityInput: document.getElementById("city-input"),
  searchBtn: document.getElementById("search-btn"),
  locateBtn: document.getElementById("locate-btn"),
  themeToggle: document.getElementById("theme-toggle"),
  themeIcon: document.getElementById("theme-icon"),
  unitC: document.getElementById("unit-c"),
  unitF: document.getElementById("unit-f"),
  location: document.getElementById("location"),
  updated: document.getElementById("updated"),
  heroIcon: document.getElementById("hero-icon"),
  temp: document.getElementById("temp"),
  condition: document.getElementById("condition"),
  sunrise: document.getElementById("sunrise"),
  sunset: document.getElementById("sunset"),
  feelsLike: document.getElementById("feels-like"),
  humidity: document.getElementById("humidity"),
  wind: document.getElementById("wind"),
  forecast: document.getElementById("forecast"),
};

let unit = "C"; // "C" or "F"
let lastData = null; // keep the raw metric response so we can re-render on unit switch

// ---------- icons ----------
function iconFor(main) {
  const stroke = `stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  const icons = {
    Clear: `<svg viewBox="0 0 24 24" ${stroke}><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8l1.8-1.8M18 6l1.8-1.8"/></svg>`,
    Clouds: `<svg viewBox="0 0 24 24" ${stroke}><path d="M7 18h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.6A3.5 3.5 0 0 0 7 18Z"/></svg>`,
    Rain: `<svg viewBox="0 0 24 24" ${stroke}><path d="M7 15h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.6A3.5 3.5 0 0 0 7 15Z"/><path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2"/></svg>`,
    Drizzle: `<svg viewBox="0 0 24 24" ${stroke}><path d="M7 14h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.6A3.5 3.5 0 0 0 7 14Z"/><path d="M9 18v2M13 18v2M17 18v2"/></svg>`,
    Thunderstorm: `<svg viewBox="0 0 24 24" ${stroke}><path d="M7 13h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.6A3.5 3.5 0 0 0 7 13Z"/><path d="M13 13l-2.5 4h2.5L11 21"/></svg>`,
    Snow: `<svg viewBox="0 0 24 24" ${stroke}><path d="M7 13h10a4 4 0 0 0 0-8 5.5 5.5 0 0 0-10.6 1.6A3.5 3.5 0 0 0 7 13Z"/><path d="M9 17v4M9 17l-2 1M9 17l2 1M15 17v4M15 17l-2 1M15 17l2 1"/></svg>`,
    Mist: `<svg viewBox="0 0 24 24" ${stroke}><path d="M4 9h16M4 13h16M4 17h10"/></svg>`,
  };
  return icons[main] || icons.Clouds;
}

// ---------- unit helpers ----------
function cToF(c) { return (c * 9) / 5 + 32; }
function fmtTemp(c) {
  return unit === "C" ? Math.round(c) : Math.round(cToF(c));
}
function fmtTime(unixSeconds, timezoneOffsetSeconds) {
  const d = new Date((unixSeconds + timezoneOffsetSeconds) * 1000);
  return d.toUTCString().match(/\d{2}:\d{2}/)[0];
}

// ---------- status ----------
function setStatus(msg, isError = false) {
  els.status.textContent = msg;
  els.status.classList.toggle("error", isError);
}

// ---------- rendering ----------
function render(data, forecastList) {
  lastData = { data, forecastList };

  els.weather.classList.remove("hidden");
  els.location.textContent = `${data.name}, ${data.sys.country}`;
  els.updated.textContent = "Updated just now";
  els.heroIcon.innerHTML = iconFor(data.weather[0].main);
  els.temp.textContent = fmtTemp(data.main.temp);
  els.condition.textContent = data.weather[0].description
    .replace(/\b\w/g, (c) => c.toUpperCase());
  els.sunrise.textContent = "Sunrise " + fmtTime(data.sys.sunrise, data.timezone);
  els.sunset.textContent = "Sunset " + fmtTime(data.sys.sunset, data.timezone);
  els.feelsLike.textContent = fmtTemp(data.main.feels_like) + "°";
  els.humidity.textContent = data.main.humidity + "%";
  els.wind.textContent = Math.round(data.wind.speed * 3.6) + " km/h";

  // 5-day forecast: pick one entry near midday for each date
  const days = {};
  forecastList.forEach((entry) => {
    const date = entry.dt_txt.split(" ")[0];
    const hour = entry.dt_txt.split(" ")[1];
    if (!days[date] || hour === "12:00:00") {
      days[date] = entry;
    }
  });

  const dayKeys = Object.keys(days).slice(0, 5);
  els.forecast.innerHTML = dayKeys
    .map((key) => {
      const entry = days[key];
      const dayName = new Date(key + "T00:00:00").toLocaleDateString(undefined, {
        weekday: "short",
      });
      return `
        <div class="forecast-day">
          <div class="day-name">${dayName}</div>
          ${iconFor(entry.weather[0].main)}
          <div class="day-temps">
            ${fmtTemp(entry.main.temp_max)}°<span class="low">${fmtTemp(entry.main.temp_min)}°</span>
          </div>
        </div>`;
    })
    .join("");
}

// ---------- API calls ----------
async function fetchByCity(city) {
  if (API_KEY.startsWith("PASTE_")) {
    setStatus("Add your OpenWeatherMap API key in script.js first.", true);
    return;
  }
  setStatus("Loading…");
  try {
    const [weatherRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`),
    ]);
    if (!weatherRes.ok) throw new Error("City not found. Try a different spelling.");
    const data = await weatherRes.json();
    const forecast = await forecastRes.json();
    render(data, forecast.list);
    setStatus("");
  } catch (err) {
    setStatus(err.message || "Something went wrong.", true);
  }
}

async function fetchByCoords(lat, lon) {
  if (API_KEY.startsWith("PASTE_")) {
    setStatus("Add your OpenWeatherMap API key in script.js first.", true);
    return;
  }
  setStatus("Finding your local weather…");
  try {
    const [weatherRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
    ]);
    const data = await weatherRes.json();
    const forecast = await forecastRes.json();
    render(data, forecast.list);
    setStatus("");
  } catch {
    setStatus("Unable to fetch your local weather. Try searching a city.", true);
  }
}

// ---------- events ----------
els.searchBtn.addEventListener("click", () => {
  const city = els.cityInput.value.trim();
  if (city) fetchByCity(city);
});

els.cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") els.searchBtn.click();
});

els.locateBtn.addEventListener("click", () => {
  locate();
});

els.themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const isLight = document.body.classList.contains("light");
  els.themeIcon.textContent = isLight ? "☀" : "☾";
});

function setUnit(newUnit) {
  unit = newUnit;
  els.unitC.classList.toggle("active", unit === "C");
  els.unitF.classList.toggle("active", unit === "F");
  if (lastData) render(lastData.data, lastData.forecastList);
}
els.unitC.addEventListener("click", () => setUnit("C"));
els.unitF.addEventListener("click", () => setUnit("F"));

function locate() {
  if (!navigator.geolocation) {
    setStatus("Geolocation isn't supported. Please search a city.", true);
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
    () => setStatus("Location access denied. Please search a city.", true)
  );
}

// ---------- init ----------
locate();