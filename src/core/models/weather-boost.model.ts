export interface IWeatherBoost {
  clear: string[];
  fog: string[];
  overcast: string[];
  partlyCloudy: string[];
  rainy: string[];
  snow: string[];
  windy: string[];
}

export class WeatherBoost implements IWeatherBoost {
  clear: string[] = [];
  fog: string[] = [];
  overcast: string[] = [];
  partlyCloudy: string[] = [];
  rainy: string[] = [];
  snow: string[] = [];
  windy: string[] = [];
}
