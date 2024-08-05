export interface IWeatherBoost {
  CLEAR: string[];
  FOG: string[];
  OVERCAST: string[];
  PARTLY_CLOUDY: string[];
  RAINY: string[];
  SNOW: string[];
  WINDY: string[];
}

export class WeatherBoost implements IWeatherBoost {
  CLEAR: string[];
  FOG: string[];
  OVERCAST: string[];
  PARTLY_CLOUDY: string[];
  RAINY: string[];
  SNOW: string[];
  WINDY: string[];

  constructor() {
    this.CLEAR = [];
    this.FOG = [];
    this.OVERCAST = [];
    this.PARTLY_CLOUDY = [];
    this.RAINY = [];
    this.SNOW = [];
    this.WINDY = [];
  }
}
