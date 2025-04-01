import { HttpClient } from '@angular/common/http';
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
  deleteFamille(idFamille: number | undefined , idSupprimateur: number | undefined ): Observable<any> {
      return this.http.delete( `${this.apiUrl}/delete/${idFamille}/${idSupprimateur}`); 
  }
  addFamille(famille: Famille, idActionneur: number | undefined): Observable<Famille> {
    return this.http.post<Famille>(`${this.apiUrl}/addFamille/${idActionneur}`, famille);
  }
}
