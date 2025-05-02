import { Injectable } from '@angular/core';
import { Ligne } from '../models/Ligne';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LigneService {
private apiUrl = 'http://localhost:8080/ligne'; 
  constructor(private http: HttpClient) { } 
  getAll(): Observable<Ligne[]> {
    return this.http.get<Ligne[]>(`${this.apiUrl}/activeLignes`);
  }
  getLignesByUserZones(idUser : number): Observable<Ligne[]> {
    return this.http.get<Ligne[]>(`${this.apiUrl}/getLignesByUserZones/${idUser}`);
  }
  addLigne(ligne: Ligne, idActionneur: number): Observable<any> {
    const params = new HttpParams()
                  .set('idActionneur',idActionneur)
    return this.http.post<any>(`${this.apiUrl}/addLigne`, ligne , {params});
  }
  updateLigne(ligne: Ligne, idLigne : number | undefined , idActionneur: number ): Observable<Ligne> {
    const params = new HttpParams()
                  .set('idActionneur',idActionneur);
    return this.http.put<Ligne>(`${this.apiUrl}/update/${idLigne}`, ligne , { params }) ;
  }
  deleteLigne(idLigne: number , idActionneur: number): Observable<any> {
    const params = new HttpParams()
                  .set('idActionneur',idActionneur)
    return this.http.delete(`${this.apiUrl}/delete/${idLigne}` , { params });
  }
}
