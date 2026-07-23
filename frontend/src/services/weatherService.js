export const weatherService = {
  async getCampusWeather(city = 'Bangalore') {
    return {
      city: city,
      temp: '24°C',
      condition: 'Partly Cloudy ⛅',
      humidity: '62%',
      focusScore: '94% Optimal Coding Vibe 🧠',
      recommendation: 'Perfect temperature for deep-work DSA problem solving & Spring Boot coding sessions.'
    };
  }
};
