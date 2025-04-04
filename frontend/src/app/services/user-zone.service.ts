import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User_Zone } from '../models/User_Zone';

@Injectable({
  providedIn: 'root'
})
export class UserZoneService {

  private apiUrl = 'http://localhost:8080/user'; 
  private apiUrl2 = 'http://localhost:8080/zone'; 
  constructor(private http: HttpClient) { } 
  getUserZones( idUser :  number | undefined ): Observable<User_Zone[]> {
    return this.http.get<User_Zone[]>(`${this.apiUrl}/user-zones/${idUser}`);
  }
  attribuerZoneAUser(idUser: number, idZone: number, idActionneur: number): Observable<any> {
    const url = `${this.apiUrl}/attribuer-zone/${idUser}/${idZone}/${idActionneur}`;
    return this.http.post(url, null);
  }
  getZoneUsers(idZone: number): Observable<User_Zone[]> {
    return this.http.get<User_Zone[]>(`${this.apiUrl2}/zone-users/${idZone}`);
  }
  retirerZoneAUser(idUser: number, idZone: number, idActionneur: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/retirerZoneAUser/${idUser}/${idZone}/${idActionneur}`);
  }
  
}
