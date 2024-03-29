// Global variables
const weatherApiRootUrl = 'https://api.openweathermap.org';
const weatherApiKey = 'a23926b23cbd7c1d7c67adf9564cfed5';
var cityToSearch = "San Diego";

// DOM element references
var searchForm = document.querySelector('#search-form');
var searchInput = document.querySelector('#search-input');
var todayContainer = document.querySelector('#today');
var forecastContainer = document.querySelector('#forecast');
var searchHistoryContainer = document.querySelector('#history');

// Fetches weather data for given location from the Weather Geolocation
// endpoint; then, calls functions to display current and forecast weather data.

// Add timezone plugins to day.js
dayjs.extend(window.dayjs_plugin_utc);
dayjs.extend(window.dayjs_plugin_timezone);

var searchHistory = document.querySelector(".list-group");

// convert city strings to array, also load searched cities
var historyArray = JSON.parse(localStorage.getItem("savedCity")) || [];

function savedCity(location) {

  // add to the array if there its a valid input and non-duplicate 
  if (!(location == "" || historyArray.includes(location))) {
    historyArray.push(location);
  }

  // convert city object into strings
  localStorage.setItem("savedCity", JSON.stringify(historyArray));

  // empty repeated city array elements and city weather history
  searchHistory.innerHTML = "";

  displayList(location);
}

// make searched cities into a list of cities, and append to HTML
function displayList() {
    for (var i = 0; i < historyArray.length; i++) {
      var historyListItem = document.createElement("li"); // Create a <li> element
      var historyButton = document.createElement("button"); // Create a <button> element
      historyButton.className = "list-group-item";
      historyButton.textContent = historyArray[i];
      historyButton.id = historyArray[i]; // Set the id of the button to the text inside it
      historyListItem.appendChild(historyButton); // Append the button to the <li> element
      searchHistory.appendChild(historyListItem); // Append the <li> element to the parent container
    }
  }
  

displayList();

var searchHistoryClickHandler = function(event) {
    console.log("Please!")
    var citySearch = event.target.getAttribute("id");
    if (citySearch) {
        //Clear Past Movie Info & Rerun Search
        searchInput.innerHTML = "";
        removeCurrentWeather();
        fetchCoords(citySearch);
    };
};

function renderItems(city, data) {
    renderCurrentWeather(city, data.current, data.timezone);
    renderForecast(data.daily, data.timezone);
}

function fetchCoords(location) {
    var city = location;
    
    var apiUrlCity = `${weatherApiRootUrl}/data/2.5/weather?q=${city}&units=imperial&exclude=minutely,hourly&appid=${weatherApiKey}`;

    fetch(apiUrlCity)
        .then(

            function (res) {
                return res.json();
        })
        .then(
        function (data) {

        lat = data.coord.lat;
        lon = data.coord.lon

        var apiUrlLatLon = `${weatherApiRootUrl}/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${weatherApiKey}`;
        fetchWeather(apiUrlLatLon, city);
    })
        .catch(function (err) {
            console.error(err);
        });

}

function fetchWeather(locationPath, city) {
    
        fetch(locationPath)
            .then(

                function (res) {
                    return res.json();
                }


                )
            .then(
                function (data) {

                console.log("DATA", data);
                renderItems(city, data);

            }
            )
            .catch(function (err) {
                console.error(err);
            });

}

function removeCurrentWeather() {

    var removeThis = document.getElementById('remove-after');
    removeThis.remove();

}

function renderCurrentWeather(city, currentData, timezone) {

    var unixTs = currentData.dt;
    var currentDay = dayjs.unix(unixTs).tz(timezone).format('M/D/YYYY');
    var iconUrl = `https://openweathermap.org/img/w/${currentData.weather[0].icon}.png`;
    var iconDescription = currentData.weather[0].description;
    var tempF = currentData.temp;
    var windMph = currentData.wind_speed;
    var humidityToday = currentData.humidity;

    var currentCol = document.createElement('div');
    var heading = document.createElement('div');
    var headingText = document.createElement('h3')
    var weatherIcon = document.createElement('img');
    var body = document.createElement('div')
    var tempEl = document.createElement('h5');
    var windEl = document.createElement('h5')
    var humidityEl = document.createElement('h5');

    currentCol.setAttribute('class', 'col-12');
    currentCol.setAttribute('id', 'remove-after')
    weatherIcon.setAttribute('src', iconUrl);
    weatherIcon.setAttribute('alt', iconDescription);
    headingText.textContent = `${city} (${currentDay})`;
    currentCol.append(heading, body);
    heading.appendChild(headingText);
    headingText.style.display = 'inline-block';
    heading.appendChild(weatherIcon);
    weatherIcon.style.display = 'inline-block';
    tempEl.textContent = `Temp: ${tempF} °F`;
    body.appendChild(tempEl);
    windEl.textContent = `Wind: ${windMph} MPH`;
    body.appendChild(windEl);
    humidityEl.textContent = `Humidity: ${humidityToday} %`;
    body.appendChild(humidityEl);

    todayContainer.append(currentCol)
}

// Function to display 5 day forecast.
function renderForecast(dailyForecast, timezone) {
    // Create unix timestamps for start and end of 5 day forecast
    var startDt = dayjs().tz(timezone).add(1, 'day').startOf('day').unix();
    var endDt = dayjs().tz(timezone).add(6, 'day').startOf('day').unix();

    var headingCol = document.createElement('div');
    var heading = document.createElement('h4');

    headingCol.setAttribute('class', 'col-12');
    heading.textContent = '5-Day Forecast:';
    headingCol.append(heading);

    forecastContainer.innerHTML = '';
    forecastContainer.append(headingCol);
    for (var i = 0; i < dailyForecast.length; i++) {
        // The api returns forecast data which may include 12pm on the same day and
        // always includes the next 7 days. The api documentation does not provide
        // information on the behavior for including the same day. Results may have
        // 7 or 8 items.
        if (dailyForecast[i].dt >= startDt && dailyForecast[i].dt < endDt) {
        renderForecastCard(dailyForecast[i], timezone);
        }
    }
}

function renderForecastCard(forecast, timezone) {
    // variables for data from api
    var unixTs = forecast.dt;
    var iconUrl = `https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`;
    var iconDescription = forecast.weather[0].description;
    var tempF = forecast.temp.day;
    var { humidity } = forecast;
    var windMph = forecast.wind_speed;

    // Create elements for a card
    var col = document.createElement('div');
    var card = document.createElement('div');
    var cardBody = document.createElement('div');
    var cardTitle = document.createElement('h5');
    var weatherIcon = document.createElement('img');
    var tempEl = document.createElement('p');
    var windEl = document.createElement('p');
    var humidityEl = document.createElement('p');

    col.append(card);
    card.append(cardBody);
    cardBody.append(cardTitle, weatherIcon, tempEl, windEl, humidityEl);

    col.setAttribute('class', 'col-md');
    col.classList.add('five-day-card');
    card.setAttribute('class', 'card bg-primary h-100 text-white');
    cardBody.setAttribute('class', 'card-body p-2');
    cardTitle.setAttribute('class', 'card-title');
    tempEl.setAttribute('class', 'card-text');
    windEl.setAttribute('class', 'card-text');
    humidityEl.setAttribute('class', 'card-text');

    // Add content to elements
    cardTitle.textContent = dayjs.unix(unixTs).tz(timezone).format('M/D/YYYY');
    weatherIcon.setAttribute('src', iconUrl);
    weatherIcon.setAttribute('alt', iconDescription);
    tempEl.textContent = `Temp: ${tempF} °F`;
    windEl.textContent = `Wind: ${windMph} MPH`;
    humidityEl.textContent = `Humidity: ${humidity} %`;

    forecastContainer.append(col);
}

function handleSearch(e) {

    console.log("Hello?")

    if(!searchInput.value) {
        return;
    }

    e.preventDefault();
    var search = searchInput.value.trim();

    debugger;
    savedCity(search);
    removeCurrentWeather();
    fetchCoords(search);
    searchInput.value = ''
    
}

searchForm.addEventListener('submit', handleSearch);

searchHistoryContainer.addEventListener("click", searchHistoryClickHandler);

fetchCoords(cityToSearch)
