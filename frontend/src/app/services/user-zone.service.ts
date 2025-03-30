import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User_Zone } from '../models/User_Zone';

@Injectable({
  providedIn: 'root'
})
export class UserZoneService {

  private apiUrl = 'http://localhost:8080/user'; // badlou ken ghalet
  constructor(private http: HttpClient) { } 
  getUserZones( idUser :  number | undefined ): Observable<User_Zone[]> {
    return this.http.get<User_Zone[]>(`${this.apiUrl}/user-zones/${idUser}`);
  }
}
