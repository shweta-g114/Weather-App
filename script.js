const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");
const errorContainer = document.querySelector(".error-container");

const grantAccessContainer = document.querySelector(
  ".grant-location-container"
);
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

const APIkey = "bb12753e7ed379304fbb8fb8e303da70";
let currentTab = userTab;
currentTab.classList.add("current-Tab");
getfromSessionStorage();

function switchTab(clickedTab) {
  if (clickedTab != currentTab) {
    currentTab.classList.remove("current-Tab");
    currentTab = clickedTab;
    currentTab.classList.add("current-Tab");

    if (!searchForm.classList.contains("active")) {
      userInfoContainer.classList.remove("active");
      grantAccessContainer.classList.remove("active");
      errorContainer.classList.remove("active");
      searchForm.classList.add("active");
    } else {
      // search form active (visible) tha
      searchForm.classList.remove("active");
      userInfoContainer.classList.remove("active");
      errorContainer.classList.remove("active");
      // for your weather tab, make it visible and check
      // local storage for coordinates
      getfromSessionStorage();
    }
  }
}
userTab.addEventListener("click", () => {
  // pass clicked tab as input parameter
  switchTab(userTab);
});

searchTab.addEventListener("click", () => {
  // pass clicked tab as input parameter
  switchTab(searchTab);
});

// check if coordinates are already present in session storage.
function getfromSessionStorage() {
  const localCoordinates = sessionStorage.getItem("user-coordinates");
  if (!localCoordinates) {
    grantAccessContainer.classList.add("active");
  } else {
    const coordinates = JSON.parse(localCoordinates);
    fetchUserweatherInfo(coordinates);
  }
}

async function fetchUserweatherInfo(coordinates) {
  const { lat, lon } = coordinates;

  // make grantLocationcontainer invisible
  grantAccessContainer.classList.remove("active");
  // make loader visible
  loadingScreen.classList.add("active");

  // Api call
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIkey}`
    );
    const data = await response.json();
    // make loading screen invisible
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
  } catch (err) {
    loadingScreen.classList.remove("active");
  }
}

function renderWeatherInfo(weatherInfo) {
  // firstly , we have to fetch elements
  const cityName = document.querySelector("[data-cityName]");
  const countryIcon = document.querySelector("[data-countryIcon]");
  const desc = document.querySelector("[data-weatherDesc]");
  const weatherIcon = document.querySelector("[data-weatherIcon]");
  const temp = document.querySelector("[data-temp]");
  const windspeed = document.querySelector("[data-windspeed]");
  const humidity = document.querySelector("[data-humidity]");
  const cloudiness = document.querySelector("[data-cloudiness]");

  // fetch values from weatherInfo objects and put it in UI elements
  cityName.innerText = weatherInfo?.name;
  countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
  desc.innerText = weatherInfo?.weather?.[0]?.description;
  // for making first letter capital
  const description = weatherInfo?.weather?.[0]?.description;
  const capitalizedDescription = description
    ? description.charAt(0).toUpperCase() + description.slice(1)
    : "";

  desc.innerText = capitalizedDescription;

  weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
  temp.innerText = `${
    Math.round((weatherInfo?.main?.temp - 273.15) * 100) / 100
  } °C`;
  windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
  humidity.innerText = `${weatherInfo?.main?.humidity}%`;
  cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
  }
}

function showPosition(position) {
  const userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };

  sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  fetchUserweatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

let searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (searchInput.value === "") return;

  fetcSearchWeatherInfo(searchInput.value);
});

async function fetcSearchWeatherInfo(city) {
  loadingScreen.classList.add("active");
  userContainer.classList.remove("remove");
  grantAccessContainer.classList.remove("active");
  errorContainer.classList.remove("active");

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIkey}`
    );
    const data = await response.json();
    if (response?.status === 404) {
      errorContainer.classList.add("active");

      throw new Error("Resource not found");
    } else {
      // make loading screen invisible
      loadingScreen.classList.remove("active");
      userInfoContainer.classList.add("active");
      errorContainer.classList.remove("active");
      renderWeatherInfo(data);
    }
  } catch (err) {
    loadingScreen.classList.remove("active");
    userInfoContainer.classList.remove("active");
  }
}
