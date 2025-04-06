import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Famille } from '../models/Famille';

@Injectable({
  providedIn: 'root'
})
export class FamilleService {

  private apiUrl = 'http://localhost:8080/famille'; 
  constructor(private http: HttpClient) { } 
  getAll(): Observable<Famille[]> {
    return this.http.get<Famille[]>(`${this.apiUrl}/activeFamilies`);
  }
  deleteFamille(idFamille: number | undefined , idSupprimateur: number  ): Observable<any> {
    const params = new HttpParams()
                  .set('idActionneur',idSupprimateur);
      return this.http.delete( `${this.apiUrl}/delete/${idFamille}` ,  { params }); 
  }
  addFamille(famille: Famille, idActionneur: number ): Observable<Famille> {
    const params = new HttpParams()
                  .set('idActionneur',idActionneur);
    return this.http.post<Famille>(`${this.apiUrl}/addFamille`, famille ,  { params });
  }
  updateFamille(famille: Famille, idFamille : number | undefined , idActionneur: number ): Observable<Famille> {
    const params = new HttpParams()
                  .set('idActionneur',idActionneur);
    return this.http.put<Famille>(`${this.apiUrl}/update/${idFamille}`, famille , { params }) ;
  }
}
