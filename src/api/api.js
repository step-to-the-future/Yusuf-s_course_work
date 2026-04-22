// Current weather
export async function getWeatherByCity(city, apiKey) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Weather not found');
    }
    return await response.json();
  } catch (error) {
    throw new Error('Failed to fetch weather data');
  }
}

// 5-day forecast
export async function getWeatherForecast(city, apiKey) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Forecast not found');
    }
    return await response.json();
  } catch (error) {
    throw new Error('Failed to fetch forecast data');
  }
}