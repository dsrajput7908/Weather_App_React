import React from "react";
import apiKeys from "./apiKeys";
import Clock from "react-live-clock";
import Forcast from "./forcast";
import loader from "./images/WeatherIcons.gif";
import ReactAnimatedWeather from "react-animated-weather";

const dateBuilder = (d) => {
  let months = [
    "January", "February", "March", "April", "May", "June", "July", "August", 
    "September", "October", "November", "December"
  ];
  let days = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  let day = days[d.getDay()];
  let date = d.getDate();
  let month = months[d.getMonth()];
  let year = d.getFullYear();

  return `${day}, ${date} ${month} ${year}`;
};

const defaults = {
  color: "white",
  size: 112,
  animate: true,
};

class Weather extends React.Component {
  state = {
    lat: undefined,
    lon: undefined,
    errorMessage: undefined,
    temperatureC: undefined,
    temperatureF: undefined,
    city: undefined,
    country: undefined,
    humidity: undefined,
    description: undefined,
    icon: "CLEAR_DAY", // Default icon
    sunrise: undefined,
    sunset: undefined,
    loading: true, // Track loading state
  };

  componentDidMount() {
    if (navigator.geolocation) {
      this.getPosition()
        .then((position) => {
          this.getWeather(position.coords.latitude, position.coords.longitude);
        })
        .catch(() => {
          // Fallback weather for when location is denied
          this.getWeather(28.67, 77.22); // Default location (Delhi)
          alert("Location access denied. Using default location.");
        });
    } else {
      alert("Geolocation is not available.");
    }

    // Update weather every 10 minutes (600,000 ms)
    this.timerID = setInterval(() => {
      if (this.state.lat && this.state.lon) {
        this.getWeather(this.state.lat, this.state.lon);
      }
    }, 600000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID); // Cleanup on unmount
  }

  // Promise wrapper for geolocation
  getPosition = (options) => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  // Fetch weather data based on latitude and longitude
  getWeather = async (lat, lon) => {
    try {
      const api_call = await fetch(
        `${apiKeys.base}weather?lat=${lat}&lon=${lon}&units=metric&APPID=${apiKeys.key}`
      );
      const data = await api_call.json();
      
      // Handle API error
      if (data.cod !== 200) {
        throw new Error(data.message || "Failed to fetch weather data.");
      }

      // Set weather data to state
      this.setState({
        lat: lat,
        lon: lon,
        city: data.name,
        temperatureC: Math.round(data.main.temp),
        temperatureF: Math.round(data.main.temp * 1.8 + 32),
        humidity: data.main.humidity,
        description: data.weather[0].description,
        country: data.sys.country,
        sunrise: this.getTimeFromUnixTimeStamp(data.sys.sunrise),
        sunset: this.getTimeFromUnixTimeStamp(data.sys.sunset),
        icon: this.getWeatherIcon(data.weather[0].main),
        loading: false, // Data loaded, stop showing loader
      });
    } catch (error) {
      console.error("Error fetching weather data:", error);
      this.setState({ errorMessage: error.message, loading: false });
    }
  };

  // Convert Unix timestamp to human-readable time
  getTimeFromUnixTimeStamp(timestamp) {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    return date.toLocaleTimeString(); // Returns time in hh:mm:ss format
  }

  // Get weather icon based on weather condition
  getWeatherIcon(weather) {
    const icons = {
      "Haze": "CLEAR_DAY",
      "Clouds": "CLOUDY",
      "Rain": "RAIN",
      "Snow": "SNOW",
      "Dust": "WIND",
      "Drizzle": "SLEET",
      "Fog": "FOG",
      "Smoke": "FOG",
      "Tornado": "WIND",
    };
    return icons[weather] || "CLEAR_DAY"; // Default icon is CLEAR_DAY
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="loading">
          <img src={loader} alt="Loading..." style={{ width: "50%" }} />
          <h3 style={{ color: "white" }}>Detecting your location...</h3>
          <p style={{ color: "white" }}>
            Your current location will be used to calculate real-time weather.
          </p>
        </div>
      );
    }

    if (this.state.errorMessage) {
      return (
        <div className="error">
          <h3 style={{ color: "white" }}>Error: {this.state.errorMessage}</h3>
        </div>
      );
    }

    return (
      <React.Fragment>
        <div className="city">
          <div className="title">
            <h2>{this.state.city}</h2>
            <h3>{this.state.country}</h3>
          </div>
          <div className="mb-icon">
            <ReactAnimatedWeather
              icon={this.state.icon}
              color={defaults.color}
              size={defaults.size}
              animate={defaults.animate}
            />
            <p>{this.state.description}</p>
          </div>
          <div className="date-time">
            <div className="dmy">
              <div className="current-time">
                <Clock format="HH:mm:ss" interval={1000} ticking={true} />
              </div>
              <div className="current-date">{dateBuilder(new Date())}</div>
            </div>
            <div className="temperature">
              <p>
                {this.state.temperatureC}°<span>C</span>
              </p>
            </div>
          </div>
        </div>
        <Forcast icon={this.state.icon} weather={this.state.description} />
      </React.Fragment>
    );
  }
}

export default Weather;
