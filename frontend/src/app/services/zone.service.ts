import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Zone } from '../models/Zone';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {

  private apiUrl = 'http://localhost:8080/zone'; 
  constructor(private http: HttpClient) { } 
  getAll(): Observable<Zone[]> {
      return this.http.get<Zone[]>(`${this.apiUrl}/activeZones`);
  }
  deleteZone(idZone: number | undefined, idSupprimateur: number): Observable<any> {
    return this.http.delete( `${this.apiUrl}/delete/${idZone}/${idSupprimateur}`); 
  }
}
