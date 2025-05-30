import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Menu } from '../models/Menu';
import { Permission } from '../models/Permission';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  private apiUrl = 'http://localhost:8080/menus';  

  constructor(private http: HttpClient) {}

  
  getAllMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(this.apiUrl);  
  }
  getPermissionsByMenu(idMenu : number): Observable<Permission[]> {
    return this.http.get<Permission[]>(`${this.apiUrl}/getPermissionsByMenu/${idMenu}`);  
  }
}
