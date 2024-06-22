import { Component } from '@angular/core';
import { WeatherService } from '../weather.service';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent {

  searchQuery = '';
  cities: any[] = [];
  currentWeather: any = null;
  backgroundTimer: any;
  constructor(private weatherService: WeatherService) { }

  searchCities(): void {
    if (this.searchQuery.trim() === '') {
      this.cities = [];
      return;
    }
    this.weatherService.searchCities(this.searchQuery).subscribe(
      data => {
        this.cities = data;
      },
      error => {
        console.error('Error searching cities:', error);
      }
    );
  }

  getCurrentWeather(cityKey: string): void {
    this.weatherService.getCurrentWeather(cityKey).subscribe(
      data => {
        this.currentWeather = data;
      },
      error => {
        console.error('Error fetching current weather:', error);
      }
    );
  }

  addToFavorites(cityKey: string, LocalizedName: string): void {
    const userId = '123';
    this.weatherService.addToFavorites(Number(userId), cityKey, LocalizedName).subscribe(
      () => {
        console.log('City added to favorites');
      },
      error => {
        console.error('Error adding city to favorites:', error);
      }
    );
  }
 
}
