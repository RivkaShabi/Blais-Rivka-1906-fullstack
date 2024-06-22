import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = 'http://localhost:3000/api'; // URL של צד השרת שלך

  constructor(private http: HttpClient) { }

  searchCities(query: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/search?q=${query}`);
  }

  getCurrentWeather(cityKey: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/currentWeather?cityKey=${cityKey}`);
  }

  addToFavorites(userId: number, cityKey: string, cityName: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/addToFavorites`, { userId, cityKey, cityName });
  }

  deleteFavorite(userId: number, cityKey: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/deleteFavorite`, { userId, cityKey });
  }

  searchFavoriteCities(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/favorites/search/${userId}`);
  }
}
