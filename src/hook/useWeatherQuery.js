import { useQuery } from '@tanstack/react-query';
import { getWeatherByCity } from '../api/api';

export function useWeatherQuery(city, apiKey) {
  return useQuery({
    queryKey: ['weather', city],
    queryFn: () => getWeatherByCity(city, apiKey),
    enabled: !!city,
  });
}