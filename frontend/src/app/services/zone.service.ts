import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Zone } from '../models/Zone';
import { ZoneHistory } from '../models/ZoneHistoryDTO';

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
    const params = new HttpParams()
                  .set('idActionneur',idSupprimateur);
    return this.http.delete( `${this.apiUrl}/delete/${idZone}`, { params });
  }
  addZone(zone: Zone, idActionneur: number): Observable<Zone> {
    const params = new HttpParams()
          .set('idActionneur',idActionneur);
    const url = `${this.apiUrl}/addZone`;
    return this.http.post<Zone>(url,zone, { params });
  }
  updateZone(zone : Zone, idZone : number | undefined , idActionneur: number): Observable<Zone> {
    const params = new HttpParams()
          .set('idActionneur',idActionneur);
    return this.http.put<Zone>(`${this.apiUrl}/update/${idZone}`, zone , { params }) ;
  }
  getZoneHistory(idZone: number): Observable<ZoneHistory[]> {
    return this.http.get<ZoneHistory[]>(`${this.apiUrl}/zone-history/${idZone}`);
  }
  getZonesPourProduit(produitId: number): Observable<Zone[]> {
    return this.http.get<Zone[]>(`${this.apiUrl}/getZonesForProduit/${produitId}`);
  }
}
