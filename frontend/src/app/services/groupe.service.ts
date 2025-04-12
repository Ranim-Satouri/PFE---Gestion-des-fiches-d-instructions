import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Groupe } from '../models/Groupe';

@Injectable({
  providedIn: 'root'
})
export class GroupeService {
  private apiUrl = 'http://localhost:8080/groupe'; 
  constructor(private http: HttpClient) { } 
  getAll(): Observable<Groupe[]> {
    return this.http.get<Groupe[]>(`${this.apiUrl}/getAll`);
  }
}
