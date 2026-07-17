const apiKey = "54a06eb2d38906b94cd15dce27a207ed"; // <-- your key
const apiUrl = "https://api.openweathermap.org/data/2.5/weather";

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const weatherDiv = document.getElementById("weather");
const errorDiv = document.getElementById("error");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    errorDiv.textContent = "Please enter a city name.";
    errorDiv.style.display = "block";
    weatherDiv.innerHTML = "";
    return;
  }
  getWeather(city);
});

// Optional: allow Enter key to search
cityInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});
async function getWeather(city) {
  errorDiv.textContent = "";
  errorDiv.style.display = "none";
  weatherDiv.innerHTML = "Loading...";

  try {
    const response = await fetch(
      `${apiUrl}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
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
    errorDiv.textContent = err.message;
    errorDiv.style.display = "block";
  }
}
function showWeather(data) {
  const cityName = data.name;
  const country = data.sys.country;
  const temp = Math.round(data.main.temp);
  const description = data.weather[0].description;
  const humidity = data.main.humidity;
  const wind = data.wind.speed;
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  weatherDiv.innerHTML = `
    <h2>${cityName}, ${country}</h2>
    <img class="weather-icon" src="${iconUrl}" alt="${description}" />
    <div class="temp">${temp}°C</div>
    <div class="details">
      <p>${description}</p>
      <p>Humidity: ${humidity}%</p>
      <p>Wind: ${wind} m/s</p>
    </div>
  `;
}

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    errorDiv.textContent = "Please enter a city name.";
    weatherDiv.innerHTML = "";
    return;
  }
  getWeather(city);
});

// Optional: allow Enter key to search
cityInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});// Try to get user's current location on page load
window.addEventListener("load", () => {
  if (!navigator.geolocation) {
    // Browser doesn't support geolocation
    errorDiv.textContent = "Geolocation is not supported by your browser.";
    errorDiv.style.display = "block";
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      getWeatherByCoords(lat, lon);
    },
    (error) => {
      // User denied or error occurred
      errorDiv.textContent =
        "Unable to access your location. Please search by city name.";
      errorDiv.style.display = "block";
    }
  );
});