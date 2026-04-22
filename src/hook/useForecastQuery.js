import { useQuery } from '@tanstack/react-query';
import { getWeatherForecast } from '../api/api';

export function useWeatherForecast(city, apiKey) {
  return useQuery({
    queryKey: ['forecast', city],
    queryFn: () => getWeatherForecast(city, apiKey),
    enabled: !!city,
  });
}