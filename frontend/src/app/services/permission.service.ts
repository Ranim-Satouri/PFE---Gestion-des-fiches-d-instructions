import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Permission } from '../models/Permission';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private apiUrl = 'http://localhost:8080/permissions';  // URL de l'API backend pour récupérer les permissions

  constructor(private http: HttpClient) {}

  // Méthode pour récupérer toutes les permissions
  getAllPermissions(): Observable<Permission[]> {
    return this.http.get<Permission[]>(this.apiUrl);  // Appel GET à l'API backend
  }}
