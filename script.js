// CONFIG
const apiKey = "54a06eb2d38906b94cd15dce27a207ed";
const apiUrl = "https://api.openweathermap.org/data/2.5/weather";

// DOM ELEMENTS
const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const weatherDiv = document.getElementById("weather");
const errorDiv = document.getElementById("error");
const unitSwitch = document.getElementById("unit-switch");
const themeToggle = document.getElementById("theme-toggle");

// STATE
let units = "metric";      // "metric" = °C, "imperial" = °F
let dark = false;

// UTILITIES
function setError(message) {
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
}

function clearError() {
  errorDiv.textContent = "";
  errorDiv.style.display = "none";
}

function setLoading() {
  weatherDiv.innerHTML = `<div class="loader"></div>`;
}

// CORE: fetch by city
async function getWeather(city) {
  clearError();
  setLoading();

  try {
    const response = await fetch(
      `${apiUrl}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=${units}`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("City not found. Check spelling and try again.");
      } else {
        throw new Error("Failed to fetch weather data.");
      }
    }

    const data = await response.json();
    showWeather(data);
  } catch (err) {
    weatherDiv.innerHTML = "";
    setError(err.message);
  }
}

// CORE: fetch by coordinates (for geolocation)
async function getWeatherByCoords(lat, lon) {
  clearError();
  setLoading();

  try {
    const response = await fetch(
      `${apiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch weather data for your location.");
    }

    const data = await response.json();
    showWeather(data);
    cityInput.value = data.name; // put detected city in the input
  } catch (err) {
    weatherDiv.innerHTML = "";
    setError(err.message);
  }
}

// RENDER
function showWeather(data) {
  const cityName = data.name;
  const country = data.sys.country;
  const temp = Math.round(data.main.temp);
  const feelsLike = Math.round(data.main.feels_like);
  const minTemp = Math.round(data.main.temp_min);
  const maxTemp = Math.round(data.main.temp_max);
  const description = data.weather[0].description;
  const humidity = data.main.humidity;
  const wind = data.wind.speed;
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  const tempUnitSymbol = units === "metric" ? "°C" : "°F";
  const windUnit = units === "metric" ? "m/s" : "mph";

  weatherDiv.innerHTML = `
    <h2>${cityName}, ${country}</h2>
    <img class="weather-icon" src="${iconUrl}" alt="${description}" />
    <div class="temp">${temp}${tempUnitSymbol}</div>
    <div class="details">
      <p>${description}</p>
      <p>Feels like: ${feelsLike}${tempUnitSymbol}</p>
      <p>Low / High: ${minTemp}${tempUnitSymbol} / ${maxTemp}${tempUnitSymbol}</p>
      <p>Humidity: ${humidity}%</p>
      <p>Wind: ${wind} ${windUnit}</p>
    </div>
  `;
}

// EVENT LISTENERS

// Search button
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    setError("Please enter a city name.");
    weatherDiv.innerHTML = "";
    return;
  }
  getWeather(city);
});

// Enter key in input
cityInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

// Unit toggle (°C / °F)
unitSwitch.addEventListener("change", () => {
  units = unitSwitch.checked ? "imperial" : "metric";
  const currentCity = cityInput.value.trim();
  if (currentCity) {
    getWeather(currentCity);
  }
});

// Theme toggle (dark / light)
themeToggle.addEventListener("click", () => {
  dark = !dark;
  document.body.classList.toggle("dark", dark);
  themeToggle.textContent = dark ? "Light" : "Dark";
});

// GEOLOCATION ON LOAD
window.addEventListener("load", () => {
  if (!navigator.geolocation) {
    setError("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      getWeatherByCoords(lat, lon);
    },
    () => {
      setError("Unable to access your location. Please search by city name.");
    }
  );
});