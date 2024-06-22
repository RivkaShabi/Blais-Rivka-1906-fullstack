import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../weather.service';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.css']
})
export class FavoritesComponent implements OnInit {

  userId = '123'; 
  favoriteCities: any[] = [];

  constructor(private weatherService: WeatherService) { }

  ngOnInit(): void {
    this.getFavoriteCities();
  }

  getFavoriteCities(): void {
    this.weatherService.searchFavoriteCities(this.userId).subscribe(
      data => {
        this.favoriteCities = data;
      },
      error => {
        console.error('Error fetching favorite cities:', error);
      }
    );
  }




  deleteFavorite(cityKey: string): void {
    this.weatherService.deleteFavorite(Number(this.userId), cityKey).subscribe(
      () => {
        console.log('City deleted from favorites');
        this.getFavoriteCities(); 
      },
      error => {
        console.error('Error deleting city from favorites:', error);
      }
    );
  }
}
