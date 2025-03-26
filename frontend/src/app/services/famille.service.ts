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
    return this.http.get<Famille[]>(`${this.apiUrl}/getAll`);
}
}
