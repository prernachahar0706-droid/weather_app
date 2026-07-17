const apiKey = "54a06eb2d38906b94cd15dce27a207ed"; // <-- put your real key here
const apiUrl = "https://api.openweathermap.org/data/2.5/weather";

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const weatherDiv = document.getElementById("weather");
const errorDiv = document.getElementById("error");

async function getWeather(city) {
  errorDiv.textContent = "";
  weatherDiv.innerHTML = "Loading...";

  try {
    const response = await fetch(
      `${apiUrl}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("City not found");
      } else {
        throw new Error("Failed to fetch weather data");
      }
    }

    const data = await response.json();
    showWeather(data);
  } catch (err) {
    weatherDiv.innerHTML = "";
    errorDiv.textContent = err.message;
  }
}

function showWeather(data) {
  const cityName = data.name;
  const country = data.sys.country;
  const temp = Math.round(data.main.temp);
  const description = data.weather[0].description;
  const humidity = data.main.humidity;
  const wind = data.wind.speed;

  weatherDiv.innerHTML = `
    <h2>${cityName}, ${country}</h2>
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
});