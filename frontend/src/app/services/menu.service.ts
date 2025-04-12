import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Menu } from '../models/Menu';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private apiUrl = 'http://localhost:8080/menus';  // URL de l'API backend pour récupérer les menus

  constructor(private http: HttpClient) {}

  // Méthode pour récupérer tous les menus
  getAllMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(this.apiUrl);  // Appel GET à l'API backend
  }
}
