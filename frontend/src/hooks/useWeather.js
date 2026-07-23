import { useState, useEffect } from 'react';
import { weatherService } from '../services/weatherService';

export function useWeather(initialCity = 'Bangalore') {
  const [city, setCity] = useState(initialCity);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadWeather() {
      setLoading(true);
      const data = await weatherService.getCampusWeather(city);
      if (isMounted) {
        setWeather(data);
        setLoading(false);
      }
    }
    loadWeather();
    return () => { isMounted = false; };
  }, [city]);

  return {
    city,
    setCity,
    weather,
    loading
  };
}
